# Передача редизайна в Yii2: что сделать на backend

Редизайн — это фронтенд поверх существующего сайта. Есть статические шаблоны страниц и JS-модули, данные пока читаются из JSON-снимка сайта. Существующие маршруты, эндпоинты, формы и корзина Yii **не меняются**. Ниже по шагам: как подключить сборку, какие шаблоны вывести на каких маршрутах и в каком формате нужны данные.

Обзор всего проекта — в [README](../README.md).

---

## 1. Сборка и подключение файлов

```bash
npm ci
npm run build -- --base=/redesign/
```

- Результат лежит в `dist/`, его целиком копируют в `web/redesign/`. Подпапка нужна, чтобы `dist/assets/` не пересёкся с `web/assets/`, куда Yii публикует свои ассеты. Имя подпапки может быть любым, но в `--base` и при копировании оно должно совпадать.
- В подпапке лежат собранные JS и CSS (`assets/`), шрифты, медиа (`media/`) и данные (`data/`).
- Фирменные шрифты подключаются по адресу `/fonts/FuturisC.woff`, `/fonts/HelveticaNeueCyr-Roman.woff`, `/fonts/HelveticaNeueCyr-Bold.woff` — это те же файлы, что уже лежат на сервере сайта; копия есть в `dist/fonts/`.
- `dist/.vite/manifest.json` — список, по которому Yii подключает файлы страницы. Ключ — шаблон страницы (`catalog.html`, `product.html`, …):

```json
"catalog.html": {
  "file": "assets/catalog-BFKXTzET.js",
  "css": ["assets/catalog-_98lrVmC.css"],
  "imports": ["_app-CiagTJkS.js", "_content-sFySHHzW.js", "_product-card-DYM92Ow7.js", "_rail-CI-AUyxQ.js"]
}
```

На странице нужны `<script type="module">` с `file` и `<link rel="stylesheet">` со **всеми** `css` самой записи **и её `imports`** (рекурсивно). Общие стили сайта лежат в записи `_app-….js`. JS-зависимости модуль подгрузит сам.

Пример хелпера: это не готовый код проекта, а образец для своего AssetBundle или виджета.

```php
function redesignTags(string $page): string
{
    static $manifest;
    $base = '/redesign/';
    $manifest ??= json_decode(file_get_contents(Yii::getAlias('@webroot/redesign/.vite/manifest.json')), true);

    $css = [];
    $seen = [];
    $walk = function (string $key) use (&$walk, &$css, &$seen, $manifest) {
        if (isset($seen[$key])) return;
        $seen[$key] = true;
        foreach ($manifest[$key]['css'] ?? [] as $file) $css[$file] = true;
        foreach ($manifest[$key]['imports'] ?? [] as $import) $walk($import);
    };
    $walk($page);

    $html = '';
    foreach (array_keys($css) as $file) $html .= '<link rel="stylesheet" href="' . $base . $file . '">';
    return $html . '<script type="module" src="' . $base . $manifest[$page]['file'] . '"></script>';
}

// во view карточки товара: <?= redesignTags('product.html') ?>
```

Имена файлов меняются при каждой сборке, поэтому их всегда берут из манифеста, а не прописывают вручную. `404.html` нужна только статическому превью на GitHub Pages, в Yii она не используется.

---

## 2. Layout: шапка, подвал, режим production

| Что | Откуда | Куда в Yii |
|---|---|---|
| `<head>`: `theme-color`, иконки, строка `document.documentElement.classList.add('js')`, тёмный фон до загрузки CSS | `src/partials/head.html` (ссылку на `/src/styles/index.css` **не** переносить: стили придут из манифеста) | layout, `<head>` |
| SVG-спрайт иконок | `src/partials/icons.html` | layout, сразу после `<body>` |
| Шапка, mega menu, мобильное меню | `src/partials/header.html` | layout |
| Подвал | `src/partials/footer.html` | layout |

Обязательно в layout:

1. **`<html lang="ru" data-env="production">`.** Это включает боевой режим: ссылки ведут на настоящие маршруты Yii, корзина работает через `/cart/*`, формы и поиск отправляются на сервер. На домене `*.globaleffects.ru` режим включается и без атрибута.
2. **`<?= Html::csrfMetaTags() ?>`.** Фронтенд берёт токен из `meta[name="csrf-token"]` и `meta[name="csrf-param"]`.
3. **Начальное состояние корзины.** Это то, что сейчас печатается как `shopCart.setData({...})`. Вместо этого нужно `<script>window.GE_CART_INITIAL = {...}</script>` или `<script type="application/json" id="ge-cart-initial">{...}</script>`. Формат тот же: `{items, count, cost, cost_full}`.
4. **`<body data-page="…">`** — как в шаблоне страницы: `home`, `catalog` (у категории **и у карточки товара**: подсвечивается «Каталог»), `gallery`, `about`, `cart`, `news`, `blog`, `page`. По нему подсвечивается пункт меню.

Ссылки в шапке и подвале размечены `data-route` и в боевом режиме сами перестраиваются на маршруты Yii. Править `href` вручную не нужно.

---

## 3. Маршруты: какой шаблон, откуда страница берёт свой товар или статью

Разметку `<main>` из шаблона переносят во view соответствующего маршрута, а скрипт и стили подключают по манифесту (раздел 1). Страница сама определяет, что показывать, по адресу Yii:

| Маршрут Yii | Шаблон (ключ в манифесте) | Что читает страница |
|---|---|---|
| `/` | `index.html` | — |
| `/category/<slug>` | `catalog.html` | `<slug>` из пути, фильтры и сортировка — из `?color=…&stock=1&sort=…` |
| `/product/<slug>` | `product.html` | `<slug>` из пути |
| `/news/view?news_id=<id>` | `news.html` | `news_id` |
| `/blog/<slug>` | `blog.html` | `<slug>` из пути |
| `/page/about`, `/contacts` | `about.html` | — (новости, блог и дилеры — блоки этой страницы; `/contacts` → якорь `#contacts`) |
| `/page/<slug>` (delivery, politika-konfidencialnosti, pravila-prodazi-tovarov) | `page.html` | `<slug>` из пути |
| `/gallery/images/<slug>`, `/gallery/videos/<slug>` | `gallery.html` | `<slug>` из пути (выбранный раздел) |
| `/cart`, `/cart/index` | `cart.html` | — (блок оформления — существующая форма Yii) |

Если адрес другой или параметр удобнее передать явно, view может вывести его атрибутом на `<body>`. Атрибут сильнее адреса:

```php
<body data-page="product" data-param-p="<?= Html::encode($product->slug) ?>">
```

Подходит любой `data-param-<имя>`: `p` (товар, статья, страница), `c` (категория), `id` (новость), `cat` (раздел галереи). Логика лежит в `pageParams()` в `src/js/core/routes.js`.

**Проверить локально:** `npm run dev`, затем открыть адреса как на сайте:

- `http://127.0.0.1:5173/product/kompaktnaa-konfetti-masina-global-effects-easy-confetti`
- `/category/konfetti`
- `/news/view?news_id=187`
- `/blog/kriopuski-global-effects`
- `/page/delivery`
- `/gallery/images/konfetti`

Dev-сервер отдаёт на них нужный шаблон так же, как это будут делать views.

Перенаправления на стороне Yii:
- `/news` → `/page/about#news`;
- `/blog` → `/page/about#blog`;
- маршруты `/offers…` снять.

---

## 4. Данные: формат JSON

Сейчас страницы читают снимок сайта от 25.09.2026 из `<base>/data/`. Чтобы цены, наличие и тексты были живыми, есть два варианта:

- **(а) Отдавать JSON того же формата по тем же адресам** (`/redesign/data/catalog.json` и т. д.). Это может быть действие контроллера или выгрузка файлов при изменении каталога в админке. Код фронтенда не меняется.
- **(б) Другие адреса.** Пути меняются в одном месте: `src/js/data/api.js`.

`catalog.json` нужен на каждой странице: по нему работают поиск в шапке, корзина и меню. Его стоит отдавать с HTTP-кэшированием.

Общие правила:

- **Цены** — целые рубли (`int`). `null` значит «Цена по запросу».
- **`availability`:** `in_stock` («В наличии»), `on_order` («Под заказ», кнопка открывает `DemandProductForm`), `request` («Цена по запросу», открывает `PriceRequestForm`).
- **Картинки** — абсолютные URL или пути от корня сайта.
- **HTML в `description` и `body`** перед вставкой проходит белый список тегов на фронтенде (DOMPurify, `src/js/core/sanitize.js`): остаются текст, ссылки, картинки, списки, заголовки и таблицы, а `<script>`, обработчики событий, `iframe`, `style` и ссылки `javascript:` вырезаются. Это второй рубеж: **сервер тоже обязан очищать HTML** (например, `HtmlPurifier` при сохранении в CMS), потому что фронтенд не защищает других потребителей этих данных.
- **Адреса в данных** (`url` новостей, `files[].url`, ссылки в HTML) могут быть только путями сайта, `#якорями`, `http(s):`, `mailto:` или `tel:`. Остальные схемы (`javascript:`, `data:`, `vbscript:`) фронтенд заменяет на `#`.
- **Ссылки внутри HTML** — обычные адреса сайта (`/product/…`, `/category/…`, `/news/view?news_id=…`). Ссылки на товары, которых нет в каталоге, фронтенд показывает текстом.
- **Даты** — строка `дд.мм.гггг`.

### `catalog.json`: категории и короткие карточки всех товаров

```json
{
  "source": "https://globaleffects.ru",
  "scrapedAt": "2026-09-25",
  "categories": [ … ],
  "products": [ … ]
}
```

`categories[]` — 17 разделов в порядке меню:

| Поле | Тип | Значение |
|---|---|---|
| `slug` | string | как в `/category/<slug>` |
| `group` | `"equipment"` \| `"consumables"` | «Оборудование» или «Расходные материалы» в меню и каталоге |
| `title` | string | название раздела |
| `count` | int | число товаров (счётчики в меню и чипсах) |
| `minPrice` | int | «от … ₽» в шапке категории |
| `cover` | string (URL) | картинка раздела в mega menu |
| `filters[]` | array | фасеты: `{ key, label, options: [{ value, count }] }`. `key` — название характеристики из `products[].specs`, `label` — подпись группы фильтра |
| `products[]` | int[] | id товаров раздела в порядке «По умолчанию» |

`products[]` — все товары, 316 штук:

| Поле | Тип | Значение |
|---|---|---|
| `id` | int | id товара (как `product_id` в `/cart/add`) |
| `slug` | string | как в `/product/<slug>` |
| `name` | string | название |
| `price` | int \| null | цена, ₽; `null` — по запросу |
| `availability` | string | см. общие правила |
| `category` | string | `slug` раздела |
| `type` | string | подтип для подписи на карточке (может быть `""`) |
| `thumb` | string (URL) | карточка 350×388 |
| `image` | string (URL) | крупно 570×500 (шапка категории, быстрый просмотр) |
| `alt` | string \| null | альтернативный текст картинки |
| `specs` | `[name, value][]` | характеристики; по ним работают фильтры и поиск |

### `products/<slug>.json`: полная карточка товара (один файл на товар)

Поля `id`, `slug`, `name`, `price`, `availability`, `category`, `type`, `image`, `thumb`, `specs` — как в `catalog.json`. Плюс:

| Поле | Тип | Значение |
|---|---|---|
| `gallery[]` | `{ full, thumb }[]` | фото товара (полноразмерное и превью 255×255) |
| `files[]` | `{ title, url }[]` | документы, `url` вида `/document/get?id=37` |
| `description` | string (HTML) | описание |
| `videos[]` | string[] | YouTube id |
| `related[]` | int[] | id «Рекомендуемых товаров» |

### `news.json`: новости, новые сверху

| Поле | Тип | Значение |
|---|---|---|
| `id` | int | `news_id` |
| `date` | string | `дд.мм.гггг` |
| `title` | string | заголовок |
| `image` | string (URL) | обложка |
| `thumb` | string (URL) | превью 255×255 |
| `excerpt` | string | короткий текст для списка |
| `body` | string (HTML) | полный текст |
| `videos[]` | string[] | YouTube id |
| `url` | string | адрес на сайте, `/news/view?news_id=<id>` |

### `blog.json`: «Наш блог»

| Поле | Тип | Значение |
|---|---|---|
| `id` | int | id материала |
| `slug` | string | как в `/blog/<slug>` |
| `title` | string | заголовок |
| `excerpt` | string | короткий текст для списка |
| `image`, `thumb` | string (URL) | обложка и превью 255×277 |
| `body` | string (HTML) | полный текст |
| `videos[]` | string[] | YouTube id |

На «О компании» нужны только `slug`, `title`, `excerpt`, `image` и `thumb`. Если файл тяжёлый, `body` можно отдавать отдельно на странице статьи.

### `gallery.json`: разделы фото- и видеогалереи

| Поле | Тип | Значение |
|---|---|---|
| `slug` | string | как в `/gallery/images/<slug>` |
| `title` | string | название раздела |
| `photos[]` | `{ src, thumb, w, h, origin, studio }[]` | `src` — фото до 1200 px по ширине, `thumb` — превью 520 px (WebP); `w`×`h` — размер `src`; `origin` — исходник на сайте; `studio` — студийное фото (`bool`) |
| `videos[]` | `{ id, thumb }[]` | YouTube id и превью |

### `pages.json`: текстовые страницы

```json
{ "delivery": { "slug": "delivery", "title": "Доставка", "body": "<p>…</p>" }, … }
```

Ключ и `slug` совпадают с `/page/<slug>`.

---

## 5. Существующие эндпоинты, которые использует фронтенд (не меняются)

| Функция | Запрос | Что проверить на backend |
|---|---|---|
| Корзина | `POST /cart/add {product_id, qty}`, `/cart/update {position_id, qty}`, `/cart/remove {position_id}`, `/cart/clear` → `{data:{items,count,cost,cost_full}, message}` | тело запроса JSON (`Content-Type: application/json`): в Yii нужен `JsonParser` для `request->parsers`. Токен — в заголовке `X-CSRF-Token` |
| Купить в 1 клик | добавить → перейти на `/cart/index` | — |
| Поиск, все результаты | `POST /search/results`, поле `ProductSearch[query]` + CSRF | — |
| Под заказ | `POST /product/demand`, `DemandProductForm[...]`, капча `/site/demand-captcha` | — |
| Запросить цену | `POST /product/price-request`, `PriceRequestForm[...]`, капча `/site/price-request-captcha` | — |
| Язык | `/site/set-locale?locale=en-US` | — |
| Документы | `/document/get?id=…`, `/catalog/catalog.pdf`, `/price/price.pdf` | — |

---

## 6. Чек-лист подключения

- [ ] `npm run build -- --base=/redesign/`, затем `dist/` → `web/redesign/`.
- [ ] Layout:
  - [ ] head, спрайт, шапка, подвал;
  - [ ] `data-env="production"`;
  - [ ] `Html::csrfMetaTags()`;
  - [ ] `window.GE_CART_INITIAL`;
  - [ ] `<body data-page>`.
- [ ] Views маршрутов из раздела 3: разметка `<main>` из шаблона и теги из манифеста.
- [ ] Данные из раздела 4: JSON того же формата из БД (или пути в `api.js`).
- [ ] `/cart/*` принимает JSON-тело.
- [ ] Перенаправления `/news` → `/page/about#news`, `/blog` → `/page/about#blog`; маршруты `/offers…` убраны.
- [ ] Чистка CMS:
  - [ ] 28 ссылок на снятые с продажи товары в описаниях, новостях и блоге;
  - [ ] упоминания `/offers/free-samples` в описаниях 7 товаров;
  - [ ] отсутствующее фото «Насадка-снеговик EASY Swirl Snowman».
- [ ] Проверка на стенде:
  - [ ] каждый маршрут из раздела 3 открывает нужный товар, раздел или статью;
  - [ ] корзина: добавление, количество, удаление, очистка;
  - [ ] формы с настоящей капчей;
  - [ ] поиск «Показать все».
