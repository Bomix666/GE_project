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
 * The effects of the home grid: each one leads to its equipment and consumables.
 */
export const effects = [
  {
    slug: 'confetti',
    num: '01',
    title: 'Конфетти и серпантин',
    image: { src: media('/media/scenes/fx-confetti.webp'), sm: media('/media/scenes/fx-confetti-sm.webp'), w: 1280, h: 720, alt: 'Залп конфетти над сценой концерта' },
    equipment: 'konfetti-masiny',
    consumables: ['konfetti', 'serpantin', 'stvoly'],
    gallery: 'konfetti',
  },
  {
    slug: 'cryo',
    num: '02',
    title: 'Криоэффекты',
    image: { src: media('/media/scenes/fx-cryo.webp'), sm: media('/media/scenes/fx-cryo-sm.webp'), w: 1280, h: 720, alt: 'Столбы холодного белого дыма на концертной сцене' },
    equipment: 'krioeffekty-2',
    consumables: ['aksessuary'],
    consumablesFilter: { purpose: 'Для криопушек' },
    gallery: 'krioeffekty',
  },
  {
    slug: 'smoke',
    num: '03',
    title: 'Тяжелый дым',
    image: { src: media('/media/scenes/fx-smoke.webp'), sm: media('/media/scenes/fx-smoke-sm.webp'), w: 960, h: 540, alt: 'Тяжёлый дым стелется по сцене концерта' },
    equipment: 'tazelyj-dym',
    consumables: ['zidkosti'],
    gallery: 'tazelyj-dym',
  },
  {
    slug: 'foam',
    num: '04',
    title: 'Пена',
    image: { src: media('/media/scenes/fx-foam.webp'), sm: media('/media/scenes/fx-foam-sm.webp'), w: 1000, h: 667, alt: 'Пенная вечеринка под открытым небом' },
    equipment: 'pena-2',
    consumables: ['zidkosti'],
    gallery: 'pena',
  },
  {
    slug: 'flame',
    num: '05',
    title: 'Имитация пламени',
    image: { src: media('/media/scenes/fx-flame.webp'), sm: media('/media/scenes/fx-flame-sm.webp'), w: 1280, h: 720, alt: 'Установки имитации пламени у сцены' },
    equipment: 'imitacia-plameni-2',
    consumables: ['linejka-easyfx'],
    gallery: 'imitacia-plameni',
  },
  {
    slug: 'snow',
    num: '06',
    title: 'Искусственный снег',
    image: { src: media('/media/scenes/fx-snow.webp'), sm: media('/media/scenes/fx-snow-sm.webp'), w: 744, h: 478, alt: 'Снегопад на ледовом шоу' },
    equipment: 'konfetti-masiny',
    equipmentFilter: { type: 'Подвесные конфетти-машины' },
    consumables: ['iskusstvennyj-sneg', 'effekty-v-balloncikah'],
    gallery: 'iskusstvennyj-sneg',
  },
  {
    slug: 'curtain',
    num: '07',
    title: 'Сброс занавеса',
    // photo from the Kabuki Drop DMX product page (no local copy: served by the site, like product photos)
    image: { src: 'https://globaleffects.ru/storage/web/images/tKoEyeMh2WY0DPMOLx_sod_ivvwGebLIHkQ5fP1I.jpg', sm: 'https://globaleffects.ru/storage/web/images/tKoEyeMh2WY0DPMOLx_sod_ivvwGebLIHkQ5fP1I.jpg', w: 1000, h: 495, alt: 'Красный занавес падает над сценой большого шоу' },
    equipment: 'sistema-sbrosa-zanavesa',
    consumables: [],
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
        image: { src: media('/media/scenes/story-effect.webp'), w: 1535, h: 1025, alt: 'Зрители концерта под дождём из конфетти' },
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Поток воздуха, а не взрыв',
        text: 'Выдувная машина подаёт конфетти потоком воздуха. Материал можно досыпать прямо во время работы — выдув продолжается без пауз.',
        specs: [
          ['Дальность выдува', 'до 8–10 м'],
          ['Покрытие одной машиной', 'до 50 м²'],
          ['Продолжительность', 'без ограничений'],
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
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'Пять минут до первого залпа',
        text: 'Машине нужна только розетка 220 В. Интенсивность подачи и угол наклона оператор регулирует вручную.',
        specs: [
          ['Установка', '5 мин'],
          ['Подключение', '220 В'],
          ['Расход', '≈ 1 кг за 2–3 мин'],
        ],
        note: 'Данные: EASY Confetti',
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
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'Сертифицированный баллон и прочный шланг',
        text: 'Баллоны — только с сифонной трубкой и от надёжной заправочной станции. На выходе до −70 °C: обычные резиновые шланги теряют эластичность и трескаются, нужен шланг высокого давления.',
        specs: [
          ['Один баллон 40 л', '≈ 30 пусков по 2–3 с'],
          ['Температура на выходе', 'до −70 °C'],
          ['Несколько криопушек', 'соединяются кабелем последовательно'],
        ],
        note: 'Данные: CO2 JET, блог GLOBAL EFFECTS',
      },
      {
        kind: 'result',
        label: 'Результат на сцене',
        title: 'Сцена в движении',
        image: { src: media('/media/scenes/hero-cryo-columns.webp'), w: 1672, h: 941, alt: 'Столбы криоэффектов на концерте' },
        gallery: 'krioeffekty',
      },
    ],
  },
  {
    slug: 'smoke',
    tab: 'Тяжёлый дым',
    // No photo of the result yet (the gallery's theatre shots are of unconfirmed authorship): the chain ends
    // with the client's own test from the FreezeFog Pro news, the gallery opens from the first panel.
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Дым, который стелется по полу',
        text: 'Плотный белый слой остаётся у поверхности сцены и не поднимается сразу вверх — для концертов, театральных постановок, свадеб и шоу.',
        image: { src: media('/media/scenes/fx-smoke.webp'), w: 960, h: 540, alt: 'Тяжёлый дым стелется по сцене концерта' },
        gallery: 'tazelyj-dym',
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Дым, охлаждённый CO₂',
        text: 'Дым из дым-машины проходит через охлаждение жидкой углекислотой, становится тяжелее воздуха и выходит через гофрированный рукав прямо у пола.',
        specs: [
          ['Заполнение', 'до 150 м² за 30 с'],
          ['Расход жидкого CO₂', '≈ 6 л/мин'],
          ['Мощность', '3 кВт, 220–240 В'],
        ],
        note: 'Данные: FreezeFog Pro. Результат зависит от движения воздуха, температуры и размеров зала',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Генераторы и установки охлаждения',
        products: [254, 25, 489],
        category: 'tazelyj-dym',
      },
      {
        kind: 'consumables',
        label: 'Расходные материалы',
        title: 'Жидкость и баллон CO₂',
        text: 'Нужны сертифицированная жидкость для тяжёлого дыма и баллон жидкого CO₂ с сифонной трубкой (20 или 40 л). Баллоны продают заправочные станции.',
        products: [179],
        categories: ['zidkosti'],
      },
      {
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'Всё в одном кофре',
        text: 'Дым-машина, охлаждение, рукав, шланг CO₂ и коммутация уже в кофре на колёсах. На площадке — подключить питание и баллон, вывести рукав в нужную точку.',
        specs: [
          ['Рукав', '5 м'],
          ['Шланг CO₂', '3 м'],
          ['Кофр', '850 × 570 × 800 мм, 40 кг'],
        ],
        note: 'Данные: FreezeFog Pro',
      },
      {
        kind: 'how',
        label: 'Результат теста',
        title: 'Зал 300 м² — меньше чем за 2 минуты',
        text: 'После нагрева дым-машины первые 10 секунд — 100% интенсивности, затем 70%.',
        specs: [
          ['Площадь зала', '300 м²'],
          ['Время заполнения', 'менее 2 мин'],
          ['Баллон CO₂ 40 л', '≈ 6,5 мин работы'],
        ],
        note: 'Тест GLOBAL EFFECTS, новость от 21.09.2026',
      },
    ],
  },  {
    slug: 'snow',
    tab: 'Снег',
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Снегопад над сценой',
        text: 'Бесшумный занавес из искусственного снега — для театральных постановок, выставочных залов, галерей и показов мод.',
        image: { src: media('/media/gallery/iskusstvennyj-sneg_20.webp'), w: 1000, h: 419, alt: 'Снег падает на сцену во время спектакля' },
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Машина над сценой',
        text: 'Подвесная машина висит на ферме или штанкете и выпускает снег сверху: EASY Swirl выдувает его, Snow Drop высыпает через пластины с отверстиями 15 мм.',
        specs: [
          ['Диаметр выдува EASY Swirl', '4–5 м'],
          ['Высота потолков', 'от 4–5 м'],
          ['Snow Drop на малых оборотах', 'около 30 мин'],
          ['Управление', 'DMX'],
        ],
        note: 'Данные: EASY Swirl, Snow Drop DMX',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Подвесные машины GLOBAL EFFECTS',
        products: [12, 453, 364],
        category: 'konfetti-masiny',
      },
      {
        kind: 'consumables',
        label: 'Расходные материалы',
        title: 'Снег для выдува и для декораций',
        text: 'Для падающего снега — «Хлопья», «Снегопад», «Метель», для декораций — «Изморозь» и «Шорох». 1 кг «Хлопьев» хватает на 2 минуты непрерывного выдува.',
        products: [42, 40, 39],
        categories: ['iskusstvennyj-sneg'],
      },
      {
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'Загрузка без снятия с фермы',
        text: 'Крышку открывают прямо на ферме и досыпают снег, не снимая машину. Не направляйте выдув в лицо: снег лёгкий.',
        specs: [
          ['Короб EASY Swirl', '3–4 кг снега'],
          ['Полный короб EASY Swirl', '2–3 мин на максимуме, до 10 мин на малых оборотах'],
          ['Несколько Snow Drop', 'соединяются последовательно'],
        ],
        note: 'Данные: EASY Swirl, Snow Drop DMX, снег «Хлопья»',
      },
      {
        kind: 'result',
        label: 'Результат на сцене',
        title: 'Зима на сцене',
        image: { src: media('/media/gallery/iskusstvennyj-sneg_18.webp'), w: 1000, h: 1000, alt: 'Балетная сцена под падающим снегом' },
        gallery: 'iskusstvennyj-sneg',
      },
    ],
  },
  {
    slug: 'serpantin',
    tab: 'Серпантин',
    effect: 'confetti', // its card on the home grid is «Конфетти и серпантин»
    // No large photo of the result yet: the chain ends with the launch, the gallery opens from the first panel.
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Ленты над залом',
        text: 'Длинные ленты красиво раскрываются в воздухе — и в небольших залах, и на стадионах.',
        image: { src: media('/media/video/4VNDEz5df5A.webp'), w: 960, h: 540, alt: 'Серпантин над сценой концерта' },
        gallery: 'serpantin',
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Сжатый воздух в стволе',
        text: 'В пушку ставят одноразовый ствол со встроенным баллоном сжатого воздуха, заряженный бумажным или металлизированным серпантином. Дальность зависит от длины ствола.',
        specs: [
          ['Ствол 40 см', 'серпантин до 10 м'],
          ['Ствол 80 см', 'серпантин до 20 м'],
          ['Угол наклона для серпантина', '45–60°'],
        ],
        note: 'Данные: EASY Shot, новость «С помощью каких конфетти-пушек запускают серпантин?»',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Пушки для серпантина',
        text: 'EASY Shot запускается с пульта, Power Shot — при подаче 220 В, Power Shot DMX — по DMX вместе со светом.',
        products: [373, 368, 369],
        category: 'konfetti-masiny',
      },
      {
        kind: 'consumables',
        label: 'Расходные материалы',
        title: 'Серпантин и стволы',
        text: 'Стволы бывают 40 и 80 см, пустые или уже заряженные; серпантин — бумажный или металлизированный.',
        products: [155, 329, 7],
        categories: ['serpantin', 'stvoly'],
      },
      {
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'Без розетки, с пульта',
        text: 'EASY Shot работает от аккумуляторов — для площадок, где нет электричества. Несколько пушек программируются на один пульт.',
        specs: [
          ['Пульт ДУ в комплекте', 'до 30 м'],
          ['Пульт на 15 каналов', 'до 500 м'],
          ['Питание', '3 аккумулятора 18650'],
        ],
        note: 'Данные: EASY Shot',
      },
    ],
  },
  {
    slug: 'curtain',
    tab: 'Сброс занавеса',
    steps: [
      {
        kind: 'effect',
        label: 'Эффект',
        title: 'Занавес падает в нужный момент',
        text: 'До определённого момента драпировка скрывает сцену, а в самый торжественный — открывает товар, артистов или презентацию.',
        image: { src: 'https://globaleffects.ru/storage/web/images/tKoEyeMh2WY0DPMOLx_sod_ivvwGebLIHkQ5fP1I.jpg', w: 1000, h: 495, alt: 'Красный занавес падает над сценой большого шоу' },
      },
      {
        kind: 'how',
        label: 'Как создаётся',
        title: 'Зажим без люверсов',
        text: 'Элементы держат ткань зажимом — без люверсов и крючков — и отпускают её при подаче питания (Kabuki Drop) или по команде DMX (Kabuki Drop DMX).',
        specs: [
          ['Шёлк', 'до 4 кг на элемент'],
          ['Стандартная ткань', 'до 8 кг на элемент'],
          ['Бархат', 'до 10 кг на элемент'],
          ['Шаг крепления', 'не более 1 м'],
        ],
        note: 'Данные: Kabuki Drop, Kabuki Drop DMX',
      },
      {
        kind: 'equipment',
        label: 'Оборудование',
        title: 'Системы Kabuki Drop',
        products: [357, 486, 472],
        category: 'sistema-sbrosa-zanavesa',
      },
      {
        kind: 'how',
        label: 'Подготовка и запуск',
        title: 'На ферму любого диаметра',
        text: 'Струбцина меняется под ферму, ткань подойдёт любой толщины, элементы соединяются последовательно. Чтобы сдвинуть занавес, достаточно разжать струбцины.',
        specs: [
          ['Элемент Kabuki Drop', '1,8 кг'],
          ['Питание', '110–220 В'],
          ['Лёгкая ткань между элементами', 'до 2–3 м'],
          ['Сетевые и соединительные кабели', 'в комплект не входят'],
        ],
        note: 'Данные: Kabuki Drop, Kabuki Drop DMX',
      },
      {
        kind: 'result',
        label: 'Результат на сцене',
        title: 'Не только занавес: знамёна и шары',
        image: { src: 'https://globaleffects.ru/storage/web/images/1aFGhd0_X-nhYTzTybIWNoTWWi2QWvX_EPO2Lru9.jpg', w: 1000, h: 563, alt: 'Воздушные шары падают на зал во время концерта' },
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

/** Categories whose `specs` are selection parameters (catalogue filters, equipment picker:
 *  «Тип зала», «Дальность», «Высота потолков»…), not the model's technical data. They stay
 *  in the data for filters and search but are not shown as «Характеристики»; the real
 *  specifications of these products are in their descriptions. */
export const specsAreSelectionOnly = ['konfetti-masiny'];

/** /category/podbor-konfetti-mashin — «Подбор конфетти машин»: the five questions of the live quiz.
 *  An answer is a value of the machine's selection parameter `key` (catalog specs hold every value
 *  the live filter knows). Answers to one question combine with OR, the questions with AND — as on the site. */
export const picker = {
  category: 'konfetti-masiny',
  lead: 'Не уверены, какую конфетти-машину выбрать? Ответьте на 5 вопросов — и мы порекомендуем вам тип конфетти-машины для вашего мероприятия.',
  questions: [
    {
      key: 'Тип зала',
      multiple: true,
      text: 'В каком помещении планируете использовать конфетти-машину?',
      hint: 'Вы можете выбрать несколько вариантов ответов. Если вашего варианта нет в списке — подберите наиболее близкий.',
      options: ['Ночной клуб', 'Ресторан', 'Дворец культуры', 'Концертный зал', 'Актовый зал', 'Театр', 'Стадион или арена', 'Цирк', 'Улица'],
    },
    {
      key: 'Эффект',
      multiple: true,
      text: 'Какой эффект вам нужен?',
      hint: 'Вы можете выбрать несколько вариантов ответов.',
      options: ['Выстрел конфетти', 'Плавный выдув конфетти', 'Выстрел серпантином', 'Мощный выброс конфетти', 'Выстрел футболками'],
    },
    {
      key: 'Продолжительность',
      multiple: true,
      text: 'Сколько по времени должен длиться эффект?',
      hint: 'Вы можете выбрать несколько вариантов ответов.',
      options: ['Залп конфетти или серпантина', 'Непрерывно 2-5 минут', 'Непрерывно 5-10 минут', 'Непрерывно 10-30 минут', 'Более 30 минут'],
    },
    {
      key: 'Управление',
      multiple: false,
      text: 'Какое управление конфетти-машиной вас устроит?',
      hint: 'Нужно выбрать один вариант ответа.',
      options: ['220В', 'DMX', 'Нет возможности подключения'],
    },
    {
      key: 'Высота потолков',
      multiple: false,
      text: 'Высота потолков в вашем помещении?',
      hint: 'Нужно выбрать один вариант ответа.',
      options: ['До 5 метров', 'До 10 метров', 'До 25 метров'],
    },
  ],
};

/** Machines that fit the answers: { key: [values] }; an unanswered question does not narrow. */
export const pickMachines = (products, answers) =>
  products.filter((p) =>
    Object.entries(answers).every(([key, values]) => !values.length || p.specs.some(([k, v]) => k === key && values.includes(v))),
  );

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
