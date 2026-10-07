/**
 * Editorial content of the redesign.
 *
 * RULE: every fact here is taken from globaleffects.ru (snapshot 2026-09-25).
 * The comment next to each block names the source page. Do not add numbers,
 * clients or claims that are not on the live site.
 */
import { withBase as media } from '../core/env.js';

export const company = {
  name: 'GLOBAL EFFECTS',
  since: 2007,
  // /page/about, /news (intro), footer
  tagline:
    'Производитель оборудования для спецэффектов, а также крупнейший поставщик конфетти, серпантина и искусственного снега на российском рынке с 2007 года.',
  // /page/about
  about:
    'GLOBAL EFFECTS — единственный производитель профессионального оборудования для спецэффектов в России, а также крупнейший поставщик расходных материалов (конфетти, искусственный снег, серпантин) по широте ассортимента.',
  aboutLine: 'Собственные разработки, своё производство и качественные комплектующие делают нас надежным поставщиком оборудования для любого мероприятия.',
  motto: 'Мы делаем спецэффекты, которые остаются в памяти.', // /page/about
  // homepage banner: "Сделано в России. Гарантия 3 года. Всегда в наличии."
  promises: ['Сделано в России', 'Гарантия 3 года', 'Всегда в наличии'],
  phone: '+7 (499) 650-50-78',
  phoneHref: 'tel:+74996505078',
  email: 'info@globaleffects.ru',
  hours: 'Пн–Пт 9:00–18:00',
  showroom: 'Москва, ул. Генерала Белова, д. 16, стр. 2, 3 этаж, офис 312',
  legal: '426065, г. Ижевск, ул. им. Петрова, 39А-4',
  warehouse: 'Основной склад готовой продукции — Владимирская область',
  shipping: 'Все отгрузки по России производятся транспортными компаниями из Москвы или из Орехово-Зуево',
  social: [
    { id: 'vk', label: 'ВКонтакте', href: 'https://vk.com/globaleffectsru' },
    { id: 'telegram', label: 'Telegram', href: 'https://t.me/global_effects' },
    { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/@GLOBALEFFECTS' },
  ],
};

/** /page/about — «В числе наших постоянных клиентов» */
export const clients = [
  'Большой театр',
  'Первый канал',
  'Радио Рекорд («Пиратская станция»)',
  'Королевский цирк Гии Эрадзе',
  'Мюзиклы «Золушка», «Призрак оперы», «Русалочка»',
  'Церемония закрытия FIFA-2018',
];

/** /page/about — «У наших клиентов разные задачи» */
export const clientTasks = [
  'От детских утренников, корпоративов и свадеб до выступлений звёзд мировой величины на больших площадках',
  'Театральные представления',
  'Создание декораций для съёмочных площадок',
  'Прокат или продажа оборудования для спецэффектов',
];

/** /page/about — «Оборудование для спецэффектов GLOBAL EFFECTS» */
export const equipmentValues = [
  { icon: 'i-factory', title: 'Легко настроить', text: 'И просто использовать. Технические специалисты компании готовы ответить на ваши вопросы.' },
  { icon: 'i-shield', title: 'Безопасно', text: 'Подтверждено сертификатами и испытаниями.' },
  { icon: 'i-box', title: 'Гарантия и сервис', text: 'Гарантия и сервисное обслуживание оборудования.' },
];

/** /page/about — «Компания GLOBAL EFFECTS предлагает» (services, not promotions) */
export const services = [
  {
    title: 'Оборудование собственного производства',
    items: [
      'Конфетти-машины: от компактных для небольшого торжества до больших стадионных пушек',
      'Стационарные и ручные криопушки для помещений и открытых площадок',
      'Генераторы пены, снега, мыльных пузырей',
      'Установки имитации пламени',
      'Система сброса занавеса',
    ],
    link: { label: 'Каталог оборудования', route: 'category', arg: 'konfetti-masiny' },
  },
  {
    title: 'Конфетти и серпантин',
    items: ['Крупнейший в России поставщик конфетти и серпантина', 'Сотни видов в наличии — помогаем подобрать материал под конкретную задачу'],
    link: { label: 'Смотреть конфетти', route: 'category', arg: 'konfetti' },
  },
  {
    title: 'Искусственный снег',
    items: ['Большой выбор снега собственного производства', 'Падающие снежные хлопья', 'Снег для интерьера, витрин, подарков, ландшафтного дизайна и съёмочных декораций'],
    link: { label: 'Смотреть снег', route: 'category', arg: 'iskusstvennyj-sneg' },
  },
  {
    title: 'Аренда оборудования',
    items: [
      'Генераторы пены, снега и мыльных пузырей',
      'Конфетти-машины и конфетти-пушки',
      'Ручные и стационарные генераторы криоэффектов',
      'Установки искусственного пламени, генераторы тяжёлого дыма и тумана, летающих облаков-логотипов',
    ],
    link: { label: 'Связаться с нами', route: 'contacts' },
  },
];

/**
 * Six effects of the cinematic section.
 * Copy is condensed from the product pages named in `source`.
 */
export const effects = [
  {
    slug: 'confetti',
    num: '01',
    title: 'Конфетти и серпантин',
    short: 'Конфетти',
    icon: 'ifx-confetti',
    image: { src: media('/media/scenes/fx-confetti.webp'), sm: media('/media/scenes/fx-confetti-sm.webp'), w: 1280, h: 720, alt: 'Залп конфетти над сценой концерта' },
    text: 'Конфетти-машины собственного производства — от компактных для небольшого торжества до больших стадионных пушек с управлением DMX.',
    facts: ['EASY Confetti — выдув до 8–10 м', 'Power-550 — до 15 м, площадь до 90 м²', 'Stadium Shot DMX — серпантин 10–20 м'],
    source: '/page/about, /product/…easy-confetti, /product/…power-550, /product/…stadium-shot-dmx',
    equipment: 'konfetti-masiny',
    consumables: ['konfetti', 'serpantin', 'stvoly'],
    featured: [8, 10, 516],
    gallery: 'konfetti',
  },
  {
    slug: 'cryo',
    num: '02',
    title: 'Криоэффекты',
    short: 'Криоэффекты',
    icon: 'ifx-cryo',
    image: { src: media('/media/scenes/fx-cryo.webp'), sm: media('/media/scenes/fx-cryo-sm.webp'), w: 1280, h: 720, alt: 'Столбы холодного белого дыма на концертной сцене' },
    text: 'Плотные вертикальные столбы холодного белого дыма, которые быстро рассеиваются: не требуют уборки и не оставляют следов.',
    facts: ['CO2 GUN — ручная, столб до 8 м', 'CO2 JET — шлейф 8–10 м', 'CO2 JET DMX/POWER — синхронизация по DMX'],
    source: '/blog/kriopuski-global-effects, /product/…co2-gun, /product/…co2-jet',
    equipment: 'krioeffekty-2',
    consumables: ['aksessuary'],
    consumablesFilter: { purpose: 'Для криопушек' },
    featured: [19, 423, 449],
    gallery: 'krioeffekty',
  },
  {
    slug: 'smoke',
    num: '03',
    title: 'Тяжелый дым',
    short: 'Тяжелый дым',
    icon: 'ifx-smoke',
    image: { src: media('/media/scenes/fx-smoke.webp'), sm: media('/media/scenes/fx-smoke-sm.webp'), w: 660, h: 413, alt: 'Сцена спектакля в стелющемся тяжёлом дыме' },
    text: 'Плотный низкостелющийся дым, который остаётся у поверхности сцены и не поднимается сразу вверх.',
    facts: ['FreezeFog Pro — до 150 м² за 30 секунд', 'Всё необходимое — в одном кофре', 'FreezeFog II — сухой густой белый дым'],
    source: '/product/…freezefog-pro, /product/…freezefog-ii',
    equipment: 'tazelyj-dym',
    consumables: ['zidkosti'],
    featured: [254, 25, 489],
    gallery: 'tazelyj-dym',
  },
  {
    slug: 'foam',
    num: '04',
    title: 'Пена',
    short: 'Пена',
    icon: 'ifx-foam',
    image: { src: media('/media/scenes/fx-foam.webp'), sm: media('/media/scenes/fx-foam-sm.webp'), w: 1000, h: 667, alt: 'Пенная вечеринка под открытым небом' },
    text: 'Генераторы пены для вечеринок в зале и пенных дискотек на открытом воздухе. Работают от 220 В, насос и шланг в комплекте.',
    facts: ['EASY Foam — 20–30 м² до пояса', 'Foam Eco — 50 м² до шеи', 'Foam Jet Power-550 — выброс до 7 м, 100 м²'],
    source: '/product/…easy-foam, /product/…foam-eco, /product/…foam-jet-power-550',
    equipment: 'pena-2',
    consumables: ['zidkosti'],
    featured: [253, 22, 21],
    gallery: 'pena',
  },
  {
    slug: 'flame',
    num: '05',
    title: 'Имитация пламени',
    short: 'Пламя',
    icon: 'ifx-flame',
    image: { src: media('/media/scenes/fx-flame.webp'), sm: media('/media/scenes/fx-flame-sm.webp'), w: 1280, h: 720, alt: 'Установки имитации пламени у сцены' },
    text: 'Установки создают эффект настоящего огня, а фонарь DMX RGB позволяет менять его цвет по вашему желанию.',
    facts: ['EASY Flame DMX RGB — язык пламени 2,5 м', 'Power-550 Flame — пламя до 3,5 м', 'Подготовка к работе — 5 минут'],
    source: '/product/…easy-flame-dmx-rgb, /product/…power-550-flame-dmx-rgb',
    equipment: 'imitacia-plameni-2',
    consumables: ['linejka-easyfx'],
    featured: [432, 433, 476],
    gallery: 'imitacia-plameni',
  },
  {
    slug: 'snow',
    num: '06',
    title: 'Искусственный снег',
    short: 'Снег',
    icon: 'ifx-snow',
    image: { src: media('/media/scenes/fx-snow.webp'), sm: media('/media/scenes/fx-snow-sm.webp'), w: 744, h: 478, alt: 'Снегопад на ледовом шоу' },
    text: 'Большой выбор искусственного снега собственного производства и машины для снежного занавеса на театральной сцене.',
    facts: ['Snow Drop DMX — снежный занавес, ≈30 мин на малых оборотах', 'EASY Swirl — снег и конфетти сверху', 'Снег для декораций и съёмок'],
    source: '/page/about, /product/…snow-drop-dmx, /product/…easy-swirl',
    equipment: 'konfetti-masiny',
    equipmentFilter: { type: 'Подвесные конфетти-машины' },
    consumables: ['iskusstvennyj-sneg', 'effekty-v-balloncikah'],
    featured: [453, 12, 8],
    gallery: 'iskusstvennyj-sneg',
  },
  {
    slug: 'curtain',
    num: '07',
    title: 'Сброс занавеса',
    short: 'Занавес',
    icon: 'ifx-curtain',
    // photo from the Kabuki Drop DMX product page (no local copy: served by the site, like product photos)
    image: { src: 'https://globaleffects.ru/storage/web/images/tKoEyeMh2WY0DPMOLx_sod_ivvwGebLIHkQ5fP1I.jpg', sm: 'https://globaleffects.ru/storage/web/images/tKoEyeMh2WY0DPMOLx_sod_ivvwGebLIHkQ5fP1I.jpg', w: 1000, h: 495, alt: 'Красный занавес падает над сценой большого шоу' },
    text: 'Система Kabuki Drop для сброса занавесов, знамён, воздушных шаров и других элементов шоу. Ткань крепится в регулируемый зажим — без люверсов и крючков: занавес падает естественно и красиво, без зацепов.',
    facts: ['Kabuki Drop — сброс при подаче электропитания', 'Kabuki Drop DMX — управление по DMX, есть режим 220 В', 'Система из 10 элементов в кейсе'],
    source: '/product/…kabuki-drop, /product/…kabuki-drop-dmx, /product/…kabuki-drop-10-st-v-kejse',
    equipment: 'sistema-sbrosa-zanavesa',
    consumables: [],
    featured: [356, 472, 357],
  },
];

/**
 * "How an effect is made" chains: effect → how it works → equipment →
 * consumables → result. Each step references real products/categories.
 */
export const stories = [
  {
    slug: 'confetti',
    tab: 'Конфетти',
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Конфетти над залом',
        text: 'Финальный залп концерта, выход артиста, первый танец — конфетти превращает момент в кадр, который зрители снимают на телефоны.',
        image: { src: media('/media/scenes/story-effect.webp'), w: 1000, h: 668, alt: 'Зрители концерта под дождём из конфетти' },
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Поток воздуха, а не взрыв',
        text: 'Выдувная машина подаёт конфетти потоком воздуха. Материал можно досыпать прямо во время работы — выдув продолжается без пауз.',
        specs: [
          ['Дальность выдува', 'до 8–10 м'],
          ['Покрытие одной машиной', 'до 50 м²'],
          ['Подключение', '220 В, установка 5 мин'],
          ['Уровень звука', '63 дБ(А)'],
        ],
        note: 'Данные: EASY Confetti',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Машины GLOBAL EFFECTS',
        products: [8, 10, 516],
        category: 'konfetti-masiny',
      },
      {
        kind: 'consumables',
        label: 'Расходные материалы',
        title: 'Конфетти, серпантин, стволы',
        text: 'В короб EASY Confetti помещается 1–2 кг бумажного конфетти или снега, металлизированного — 3–4 кг.',
        products: [75, 136, 92],
        categories: ['konfetti', 'serpantin', 'stvoly'],
      },
      {
        kind: 'result',
        label: 'Результат на сцене',
        title: 'Кадр, который остаётся в памяти',
        image: { src: media('/media/scenes/story-result.webp'), w: 750, h: 500, alt: 'Сцена концерта в облаке конфетти' },
        gallery: 'konfetti',
      },
    ],
  },
  {
    slug: 'cryo',
    tab: 'Криоэффекты',
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Белые столбы над сценой',
        text: 'Плотный белый столб дыма CO₂ после выпуска быстро исчезает, а модели с DMX синхронизируются с музыкой и световым шоу.',
        image: { src: media('/media/scenes/fx-cryo-2.webp'), w: 1000, h: 667, alt: 'Криоэффекты на концерте' },
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Жидкий CO₂ под давлением',
        text: 'Клапан высокого давления выпускает жидкую углекислоту через форсунку. Высота шлейфа зависит от влажности воздуха.',
        specs: [
          ['Шлейф CO2 JET', '8–10 м'],
          ['Один баллон 40 л', '≈ 30 пусков по 2–3 с'],
          ['Управление', 'DMX (JET DMX/POWER)'],
          ['Гарантия', '3 года'],
        ],
        note: 'Данные: CO2 JET, CO2 JET DMX/POWER',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Ручные и стационарные криопушки',
        products: [19, 423, 449],
        category: 'krioeffekty-2',
      },
      {
        kind: 'consumables',
        label: 'Расходники и аксессуары',
        title: 'Баллон, шланг, переходник',
        text: 'Для работы нужен баллон CO₂ с сифонной трубкой и шланг высокого давления — шланги и переходники есть в каталоге аксессуаров.',
        products: [],
        productsQuery: { category: 'aksessuary', spec: ['Аксессуары', 'Для криопушек'], limit: 3 },
        categories: ['aksessuary'],
      },
      {
        kind: 'result',
        label: 'Результат на сцене',
        title: 'Сцена в движении',
        image: { src: media('/media/scenes/hero-cryo-columns.webp'), w: 1280, h: 720, alt: 'Столбы криоэффектов на концерте' },
        gallery: 'krioeffekty',
      },
    ],
  },
];

/** Dealers & showrooms — /contacts (live site). */
export const dealers = [
  { city: 'Москва', name: 'GLOBAL EFFECTS — шоу-рум', address: 'ул. Генерала Белова, д. 16, стр. 2', phone: '+7 (499) 650-50-78', hours: 'Пн–Пт 09:00–18:00', site: 'globaleffects.ru', type: 'Шоу-рум' },
  { city: 'Москва', name: 'Acctech', address: 'Туполевская набережная, 15', phone: '+7 (495) 966-18-17', hours: 'Пн–Пт 09:00–19:00, Сб 10:00–19:00', site: 'acctech.ru', type: 'Шоу-рум' },
  { city: 'Москва', name: 'Stage Effects', address: 'Хлебозаводский проезд, 7А', phone: '+7 (926) 829-93-44', type: 'Аренда и продажа' },
  { city: 'Москва', name: 'Magic Effects', address: 'Сиреневый бульвар, 83', phone: '+7 (905) 747-61-76', hours: 'Ежедневно 08:00–23:00', site: 'magiceffects.ru', type: 'Аренда и продажа' },
  { city: 'Санкт-Петербург', name: 'USTAGE GROUP', address: 'ул. Харченко, 18, офис 142', phone: '8-812-409-49-91', hours: 'Пн–Пт 10:00–19:00', site: 'ustage-group.ru', type: 'Шоу-рум' },
  { city: 'Санкт-Петербург', name: 'Special Effects', address: 'Салтыковская дорога, 18, офис 5', phone: '+7 (911) 900-51-11', hours: 'Ежедневно 07:00–23:00', site: 'special-effects.ru', type: 'Аренда и продажа' },
  { city: 'Санкт-Петербург', name: 'Danceeffects', address: 'Транспортный переулок, 6', phone: '+7 (812) 309-78-38', hours: 'Пн–Пт 11:00–19:00', site: 'danceeffects.ru', type: 'Аренда и продажа' },
  { city: 'Санкт-Петербург', name: 'STAGEFX', address: 'пр. Обуховской Обороны, 119', phone: '+7 (965) 780-89-88', type: 'Аренда и продажа' },
  { city: 'Сочи', name: 'Праздникмастер', address: 'ул. Гагарина, 82', phone: '+7 (918) 320-10-56', site: 'prazdnikmaster.ru', type: 'Продажа' },
  { city: 'Симферополь', name: 'Праздникмастер', address: 'ул. Москалёва, 9', phone: '+7 (989) 295-59-24', site: 'prazdnikmaster.ru', type: 'Продажа' },
  { city: 'Краснодар', name: 'Праздникмастер', address: 'ул. Васнецова, 39/1', phone: '+7 (988) 356-28-17', site: 'prazdnikmaster.ru', type: 'Продажа' },
];

/** Hero photo reel (real event photos, graded). Replaced by the MP4 when it exists. */
export const heroReel = [
  { src: media('/media/scenes/hero-cryo-stadium.webp'), sm: media('/media/scenes/hero-cryo-stadium-sm.webp'), label: 'Криоэффекты' },
  { src: media('/media/scenes/hero-confetti-crowd.webp'), sm: media('/media/scenes/hero-confetti-crowd-sm.webp'), label: 'Конфетти' },
  { src: media('/media/scenes/hero-cryo-columns.webp'), sm: media('/media/scenes/hero-cryo-columns-sm.webp'), label: 'Криоэффекты' },
  { src: media('/media/scenes/hero-confetti-arena.webp'), sm: media('/media/scenes/hero-confetti-arena-sm.webp'), label: 'Конфетти' },
];

/** Flagship equipment shown in the home rail (ids from /data/catalog.json). */
export const flagship = [8, 516, 449, 19, 254, 25, 253, 21, 433, 453, 12, 472];

/** Map a category to the consumables that belong to it (product page cross-sell). */
export const consumablesFor = {
  'konfetti-masiny': ['konfetti', 'serpantin'],
  'krioeffekty-2': ['aksessuary'],
  'tazelyj-dym': ['zidkosti'],
  'pena-2': ['zidkosti'],
  'imitacia-plameni-2': ['linejka-easyfx'],
  'linejka-easyfx': ['konfetti', 'iskusstvennyj-sneg'],
  'linejka-power-550': ['konfetti', 'iskusstvennyj-sneg'],
  komplekty: ['konfetti', 'stvoly'],
};

/** Human names for spec filter keys ↔ URL params. */
export const facetKeys = {
  'Оборудование': 'type',
  'Цвет': 'color',
  'Форма': 'shape',
  'Материал': 'material',
  'Размер': 'size',
  'Использование': 'use',
  'Аксессуары': 'purpose',
  'Тип стволов': 'tube',
};

/** Swatch colours for the real «Цвет» values (visual aid only — label always shown). */
export const swatches = {
  'Белый': '#f4f2ef',
  'Голубой': '#7cc4ef',
  'Жёлтый': '#f5d020',
  'Красный': '#ec1c23',
  'Оранжевый': '#f57c20',
  'Розовый': '#f28cb8',
  'Салатовый': '#9bdc3c',
  'Зелёный': '#1f9d55',
  'Фиолетовый': '#8a4fd8',
  'Черный': '#111111',
  'Синий': '#2459d8',
  'Золотой': 'linear-gradient(135deg,#8a6a1f,#f3d27a 45%,#9c7a26)',
  'Серебряный': 'linear-gradient(135deg,#6f7378,#e9ecef 45%,#8a8f94)',
  'Разноцветный': 'conic-gradient(#ec1c23,#f5d020,#1f9d55,#2459d8,#8a4fd8,#ec1c23)',
  'Мульти': 'conic-gradient(#ec1c23,#f5d020,#1f9d55,#2459d8,#8a4fd8,#ec1c23)',
  'Бирюзовый': '#1fc2b5',
};
