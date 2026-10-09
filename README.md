# GLOBAL EFFECTS — premium cinematic frontend

Редизайн презентационного слоя сайта **globaleffects.ru**: чёрный + красный + off-white,
сторителлинг на скролле, sticky-сцены, каталог и карточка товара.
Backend, API, база данных, заказы и авторизация **не затронуты**.

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # dist/
npm run preview  # http://127.0.0.1:4173
```

**Передача в backend (Yii2):** [`docs/BACKEND-HANDOFF.md`](docs/BACKEND-HANDOFF.md). Там описано подключение сборки
по `manifest.json`, шаблоны и маршруты, формат всех JSON-файлов и чек-лист.

**Онлайн-превью:** https://bomix666.github.io/GE_project/. Его собирает и публикует GitHub Actions
(`.github/workflows/pages.yml`) при каждом пуше в `main`. Сборка идёт с `--base=/GE_project/`: ссылки, данные и
медиа получают этот префикс через `withBase()` (`core/env.js`) и плагин `deployBase` в `vite.config.js`. С переменной
`GE_PREVIEW=1` страницы получают `noindex`, чтобы прототип не попадал в поиск рядом с globaleffects.ru. Локальная копия
этого превью: `GE_PREVIEW=1 npx vite build --base=/GE_project/ --outDir dist-pages`, затем
`npx vite preview --base=/GE_project/ --outDir dist-pages`.

Runtime-зависимостей нет: Vite используется только для сборки. Шрифты — фирменные FuturisC и HelveticaNeueCyr из `public/fonts/` (те же файлы и тот же адрес `/fonts/…`, что на действующем сайте); запасные Jost и Onest — самохостинг `@fontsource-variable`.
Стили подключены через `<link>` в `<head>` (`src/partials/head.html`), поэтому страница никогда не показывается без оформления.
Запуск в Windows: двойной клик по `start.cmd`. В PowerShell 5.1 команды пишутся по одной строке (там нет `&&`).
Сборка: JS приложения ≈ 11 КБ gzip, плюс чанки страниц по 1–4 КБ.

---

## 1. Что существует и как это связано

Исходников существующего сайта в проекте не было, поэтому «существующей системой» стал живой сайт:
**Yii2 (PHP, серверный рендер) + jQuery + AngularJS 1.x (`shop.cart`) + Bootstrap 3 + Swiper**.
Редизайн повторяет его маршруты, контент и контракты. Разметка страниц переносится в Yii-views один к одному,
а данные (каталог, товары, новости, блог, галерея) страницы получают JSON-файлами в формате из
[`docs/BACKEND-HANDOFF.md`](docs/BACKEND-HANDOFF.md). Их выгружает backend из существующей базы, менять её не нужно.

| Прототип | Yii-маршрут (production) | Что заменить в шаблоне |
|---|---|---|
| `src/partials/header.html` | layout: header, меню | шапка + mega menu + мобильное меню |
| `src/partials/footer.html` | layout: footer | подвал |
| `src/partials/icons.html` | layout, сразу после `<body>` | SVG-спрайт |
| `index.html` | `/` | главная |
| `catalog.html?c=<slug>` | `/category/<slug>` | листинг категории |
| `product.html?p=<slug>` | `/product/<slug>` | карточка товара |
| `gallery.html?cat=<slug>` | `/gallery/images/<slug>`, `/gallery/videos/<slug>` | галерея |
| `about.html` (+ `#news`, `#blog`, `#contacts`) | `/page/about`, `/contacts` | одна страница «О компании»: о компании, новости, блог, контакты и дилеры |
| `cart.html` | `/cart/index` | список корзины; **форма оформления остаётся существующей** |
| `news.html?id=<id>` | `/news/view?news_id=<id>` | статья новости (49, полные тексты); `news.html` без id → `about.html#news` |
| `blog.html?p=<slug>` | `/blog/<slug>` | материал «Нашего блога» (19); `blog.html` без slug → `about.html#blog` |
| `page.html?p=<slug>` | `/page/delivery`, `/page/politika-konfidencialnosti`, `/page/pravila-prodazi-tovarov` | текстовые страницы |

**«О компании» — одна страница** (`about.html`): 01 О компании → 02 Новости → 03 Наш блог → 04 Контакты и дилеры.
Под первым экраном — липкая якорная навигация с подсветкой текущего блока. Ленты новостей и блога строятся
из тех же реальных данных (`renderList` / `renderBlogList` в `components/editorial.js`), а у каждой статьи остаётся свой
адрес (`/news/view?news_id=…`, `/blog/<slug>`) с хлебными крошками «Главная / О компании / Новости | Наш блог / …».
Пункты меню, мобильного меню и footer ведут на якоря этой страницы (`routes.newsList()` → `…#news`, `routes.blog()` → `…#blog`).
Со страницы убраны блоки «Сцены наших клиентов» и «Оборудование» (преимущества); их данные остаются в `data/content.js`.
В production маршруты `/news` и `/blog` — это backend: их стоит перенаправить на `/page/about#news` и `/page/about#blog`.

**Акции убраны из интерфейса** (страница, пункты меню, footer, ссылки). Ссылки на `/offers…` внутри текстов из CMS
превращаются в обычный текст (`localizeLinks()`). Со стороны backend остаются: маршруты `/offers`, `/offers/<slug>`,
форма `/offers/free-samples` и упоминания «бесплатных образцов» с адресом акции в описаниях 7 товаров снега и конфетти.

Все ссылки, включая ссылки внутри текстов из CMS, проходят через `resolve()` в `routes.js`.
Поэтому в прототипе они ведут на новые страницы, а в production — на прежние адреса.
На живой сайт в прототипе остаются только файлы и функции backend:
PDF каталога и прайса, документы `/document/get`, квиз «Подбор конфетти-машины».
Переключатель **EN** в прототипе показывает пояснение: английские тексты отдаёт существующий backend (`/site/set-locale`).

Переключение окружения — `src/js/core/env.js`: на `*.globaleffects.ru` или при `<html data-env="production">`
все ссылки идут через `src/js/core/routes.js` на реальные маршруты. Разметка partials содержит
`data-route`, поэтому одни и те же файлы работают в обоих режимах. Страницы понимают и адреса прототипа
(`product.html?p=<slug>`), и адреса сайта (`/product/<slug>`, `/category/<slug>`, `/blog/<slug>`, `/page/<slug>`,
`/news/view?news_id=…`, `/gallery/images/<slug>`): это делает `pageParams()` в `routes.js`. В `npm run dev` адреса
сайта открываются на нужном шаблоне, например `http://127.0.0.1:5173/product/<slug>`.

### Используемые контракты backend (без изменений)
| Функция | Контракт | Где в коде |
|---|---|---|
| Корзина | `POST /cart/add {product_id, qty}`, `/cart/update {position_id, qty}`, `/cart/remove {position_id}`, `/cart/clear` → `{data:{items,count,cost,cost_full}, message}` | `src/js/services/cart.js` (`YiiDriver`) |
| Начальное состояние корзины | то, что сейчас печатается как `shopCart.setData({...})` → `window.GE_CART_INITIAL` или `<script type="application/json" id="ge-cart-initial">` | там же |
| Купить в 1 клик | как `one_click()`: добавить → перейти на `/cart` | `services/actions.js` |
| Поиск (полные результаты) | `POST /search/results`, поле `ProductSearch[query]` + CSRF | `components/search-overlay.js` |
| Под заказ | `POST /product/demand`, `DemandProductForm[...]`, капча `/site/demand-captcha` | `components/request-form.js` |
| Запросить цену | `POST /product/price-request`, `PriceRequestForm[...]`, капча `/site/price-request-captcha` | там же |
| Язык | `/site/set-locale?locale=en-US` | partials |
| Документы | `/document/get?id=…`, `/catalog/catalog.pdf`, `/price/price.pdf` | карточка, footer |

В прототипе `LocalDriver` эмулирует ответы корзины в `localStorage` (та же форма данных),
а формы проходят валидацию и честно сообщают, что не отправлены.

## 2. Контент — только реальный
Снимок globaleffects.ru от **25.09.2026** (`tools/`): 17 категорий, 316 товаров с ценами,
наличием, характеристиками, документами, фото и «Рекомендуемыми товарами»; 86 фото галереи,
44 видео YouTube, новости, тексты «О компании», клиенты, 11 дилеров и шоу-румов.
Каждый факт в `src/js/data/content.js` подписан страницей-источником. Выдуманных цифр,
клиентов и сертификатов нет; счётчики на главной (позиции, города) вычисляются из данных.

### Плейсхолдеры (явно)
| Что | Статус | Как заменить |
|---|---|---|
| **Видео hero** `public/media/hero-global-effects.mp4` | файла нет, пока показывается фото-reel из реальных фото | положить MP4 по этому пути; рекомендуем H.264, 1920×1080, 10–20 с, цикл, без звука, ≤ 6 МБ; для телефонов — `data-src-mobile` (720p) |
| Логотип | используется реальный `logo.png` 190×61 (растр); вектора на сайте нет | заменить на SVG от владельца бренда |
| Капча в прототипе | заглушка «Код с сайта» | в production подгружается реальная капча |
| `catalog.html?q=` | поиск прототипа по снимку | в production «Показать все» уходит в `/search/results` |

## 3. Структура
```
index.html catalog.html product.html gallery.html about.html cart.html
src/partials/        header, footer, icons (подключаются через <!-- @include -->)
src/styles/          tokens → base → components → sections → pages (CSS страниц грузится отдельно)
src/js/app.js        shell: header, mega menu, мобильное меню, поиск, корзина, reveal
src/js/core/         env, routes, dom-хелперы, motion (reveal + scene engine), video
src/js/data/         api (JSON), content (редакционный контент с источниками)
src/js/services/     cart (Yii/Local драйверы), search, actions (делегированные действия)
src/js/components/   product-card, cart-drawer, dialog, toast, search-overlay, quick-view,
                     request-form, lightbox, youtube, rail, chapter-rail, header, mega-menu,
                     editorial (ленты и статьи новостей/блога)
src/js/sections/     hero, effects, story, home-extra
src/js/pages/        точки входа страниц
public/data/         снимок каталога / галереи / новостей
public/media/        сцены в естественных цветах, галерея (WebP 1200 + 520), превью видео, бренд
design-system/       MASTER.md — дизайн-система
tools/               скрипты снимка и сборки сцен
```

**Типографика.** Одна шкала на весь сайт: токены `--fs-*`, `--section-y`, `--btn-h-lg` в `tokens.css` равны шкале главной,
которую `sections/home.css` дополнительно закрепляет только для главной. Заголовки страниц (каталог, товар, корзина, галерея,
статьи) уменьшены в тех же пропорциях; основной текст остаётся 16–17 px.

## 4. Главная — «фильм» из сцен
1. **Hero:** полноэкранное видео (или reel реальных фото с паузой) → при скролле медиа темнеет и приближается, заголовок уходит вверх, красная линия «доезжает» до следующей сцены.
2. **Эффекты 01–07** наплывают поверх hero: сетка из семи карточек (фото, название, ссылки «Оборудование» и «Расходники» в каталог). Якоря `/#fx-cryo` ведут на карточку.
3. **Как рождается эффект:** горизонтальная лента со стрелками (на телефоне — свайпом) «эффект → как создаётся → оборудование → расходники → результат» (вкладки: конфетти, криоэффекты).
4. Индекс каталога с превью у курсора → полоса PDF/образцов → rail оборудования → клиенты, дрейфующий ряд фото и видео (загружаются по клику) → CTA → footer.

Блоки «О GLOBAL EFFECTS» и «Новости» на главной не дублируются: они живут на странице «О компании».

## 5. Проверки
- **Функции:** mega menu (hover-intent, клавиатура, Esc), мобильное меню, поиск (`/`, Ctrl/⌘+K, стрелки, Enter), фильтры/сортировка/наличие с состоянием в URL и back/forward, шторка фильтров, «Показать ещё», быстрый просмотр, добавление в корзину с подтверждением, drawer с изменением количества, «Купить в 1 клик», страница товара (галерея, лайтбокс, разделы, рекомендуемые и расходники, липкая панель покупки), галерея с фильтром и лайтбоксом, deep links `/#fx-cryo`.
- **Responsive:** 375 / 768 / 1024 / 1440 / 2100+; горизонтального скролла нет.
- **Доступность (WCAG 2.1/2.2 AA):** автоматическая проверка всех страниц (alt, имена, подписи, заголовки, дубликаты id), расчёт контраста токенов (все пары ≥ 4.5:1 для текста, ≥ 3:1 для границ полей), `prefers-reduced-motion`.
- **Производительность:** анимации только через transform/opacity, один rAF-цикл без чтения layout, lazy-изображения, видео только рядом с viewport и с паузой вне экрана, YouTube — фасад без запросов до клика, CSS и JS разбиты по страницам.

## 6. Что дальше
- Получить реальное видео hero и векторный логотип.
- Подключить в Yii по [`docs/BACKEND-HANDOFF.md`](docs/BACKEND-HANDOFF.md): views маршрутов, layout, данные в формате JSON-контракта, `window.GE_CART_INITIAL` вместо `shopCart.setData`.
- Сверить формат позиции корзины на живом ответе `/cart/add` (поля `slug`/`url` для ссылки на товар).
- Прогнать ручную проверку с NVDA/VoiceOver и в Safari iOS.
