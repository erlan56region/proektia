// Каталог фабрики ТОК. Цены и описания соответствуют сериям на tok-mebel.ru.
export const NAV = [
  { id: 'products', label: 'Продукция' },
  { id: 'series', label: 'Серии' },
  { id: 'about', label: 'О фабрике' },
  { id: 'showrooms', label: 'Шоу-румы' },
  { id: 'news', label: 'Новости' },
  { id: 'contacts', label: 'Контакты' },
];

export const CATEGORIES = [
  { id: 'sofas', title: 'Диваны', image: 'images/hero-aspect.jpg', note: 'Модульные системы и компактные премиум-модели' },
  { id: 'beds', title: 'Кровати', image: 'images/hero-balloon.jpg', note: 'Эффект парения на цоколе 5 см' },
  { id: 'desks', title: 'Столы', image: 'images/hero-saturn.jpg', note: 'Инженерный мрамор, керамика, шпон дуба' },
  { id: 'stools', title: 'Сиденья', image: 'images/product-chair.jpg', note: 'Стулья, полубарные и барные элементы' },
  { id: 'bedside-tables', title: 'Предметы', image: 'images/product-coffee-table.jpg', note: 'Журнальные и прикроватные столы' },
];

const p = (o) => ({
  designer: 'Сергей Беляков',
  year: 2026,
  badge: 'новинка',
  ...o,
});

export const PRODUCTS = [
  p({
    id: 1275, slug: 'aspect-c1', name: 'Аспект c1', type: 'Диван', category: 'sofas', series: 'aspect',
    price: 669200, image: 'images/hero-aspect.jpg', gallery: ['images/hero-aspect.jpg', 'images/product-aspect.jpg', 'images/showroom.jpg'],
    short: 'Модульная система с декоративным кантиком и посадкой без ножек.',
    description: [
      'Серия АСПЕКТ создана для тех, кто ценит свободу планировочных решений. Модульная система и компактная посадка позволяют не жертвовать комфортом даже в небольших пространствах — и при этом сохранять масштаб и выразительность в просторных помещениях.',
      'Выразительный силуэт формируется за счёт декоративных кантиков и продуманной геометрии: крепление элементов к нижней части модуля создаёт эффектный «разрез», придавая мебели лёгкость и современный характер.',
      'Интеграция журнальных столиков с модулями даёт свободу в создании композиций — вы собираете интерьер под свой ритм жизни.',
    ],
    specs: { 'Габариты, см': 'L 320 × D 105 × H 68', 'Высота сиденья, см': '38', 'Каркас': 'Клеёный массив бука', 'Наполнение': 'ППУ HR 3530 + мембрана', 'Обивка': 'Букле, рогожка, велюр, лён', 'Основание': 'Платик на скрытом цоколе' },
    finishes: [{ name: 'Молочный букле', color: '#e6dccb' }, { name: 'Песочный лён', color: '#d3c1a7' }, { name: 'Тёплый серый', color: '#b7afa3' }, { name: 'Карамель', color: '#b98a5e' }, { name: 'Шалфей', color: '#9aa38d' }],
  }),
  p({ id: 1277, slug: 'aspect-c2', name: 'Аспект c2', type: 'Диван', category: 'sofas', series: 'aspect', price: 614700, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg', 'images/hero-aspect.jpg'],
    short: 'Длинная композиция с шезлонгом и низкой спинкой.', description: ['Модули Аспект собираются в конфигурацию под конкретную комнату. Нижний «разрез» визуально приподнимает корпус над полом.', 'Шезлонг можно перенести в другой модуль — крепление не требует инструмента.'],
    specs: { 'Габариты, см': 'L 360 × D 150 × H 68', 'Высота сиденья, см': '38', 'Модули': '3 сиденья + шезлонг', 'Каркас': 'Клеёный массив бука', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1279, slug: 'aspect-c3', name: 'Аспект c3', type: 'Диван', category: 'sofas', series: 'aspect', price: 576700, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Угловая композиция с интегрированным столиком.', description: ['В серию Аспект встроены журнальные столики-модули: они крепятся к посадочным элементам и повторяют их геометрию.'],
    specs: { 'Габариты, см': 'L 340 × D 190 × H 68', 'Высота сиденья, см': '38', 'Модули': 'Угол + 2 сиденья + столик', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1281, slug: 'aspect-c4', name: 'Аспект c4', type: 'Диван', category: 'sofas', series: 'aspect', price: 359600, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Двухместный модуль для небольших гостиных.', description: ['Компактная посадка при сохранении глубины и мягкости: Аспект c4 — самый доступный вход в серию.'],
    specs: { 'Габариты, см': 'L 190 × D 105 × H 68', 'Высота сиденья, см': '38', 'Модули': '2 сиденья', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1283, slug: 'aspect-c5', name: 'Аспект c5', type: 'Диван', category: 'sofas', series: 'aspect', price: 463600, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg'],
    short: 'П-образная композиция для разговоров.', description: ['Замкнутая композиция создаёт камерную зону в большом пространстве.'],
    specs: { 'Габариты, см': 'L 330 × D 250 × H 68', 'Модули': '5 элементов', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1401, slug: 'aspect-c6', name: 'Аспект c6', type: 'Диван', category: 'sofas', series: 'aspect', price: 453800, image: 'images/hero-aspect.jpg', gallery: ['images/hero-aspect.jpg'],
    short: 'Линейная конфигурация с тремя модулями.', description: ['Классическая линейная сборка серии Аспект: три сиденья, две спинки, тонкий кантик по контуру.'],
    specs: { 'Габариты, см': 'L 290 × D 105 × H 68', 'Модули': '3 сиденья + 2 спинки', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1403, slug: 'aspect-c7', name: 'Аспект c7', type: 'Диван', category: 'sofas', series: 'aspect', price: 508500, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg'],
    short: 'Композиция с двумя шезлонгами.', description: ['Симметричная конфигурация с шезлонгами по краям — для просмотра кино и долгих вечеров.'],
    specs: { 'Габариты, см': 'L 400 × D 150 × H 68', 'Модули': '4 сиденья + 2 шезлонга', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1405, slug: 'aspect-c8', name: 'Аспект c8', type: 'Диван', category: 'sofas', series: 'aspect', price: 495300, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Островная композиция в центре комнаты.', description: ['Двусторонняя композиция: одинаково выразительна с любой стороны.'],
    specs: { 'Габариты, см': 'L 260 × D 180 × H 68', 'Модули': '4 сиденья, двусторонняя', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1407, slug: 'aspect-c9', name: 'Аспект c9', type: 'Диван', category: 'sofas', series: 'aspect', price: 362200, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Компактный диван-модуль с высокой спинкой.', description: ['Высокая спинка и узкая посадка — решение для чтения у окна.'],
    specs: { 'Габариты, см': 'L 210 × D 100 × H 76', 'Модули': '2 сиденья', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1409, slug: 'aspect-c10', name: 'Аспект c10', type: 'Диван', category: 'sofas', series: 'aspect', price: 310600, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg'],
    short: 'Минимальная конфигурация серии.', description: ['Один модуль и одна спинка — база, из которой начинается любая композиция.'],
    specs: { 'Габариты, см': 'L 105 × D 105 × H 68', 'Модули': '1 сиденье', 'Обивка': 'Букле, рогожка, велюр, лён' } }),
  p({ id: 1411, slug: 'aspect-md', name: 'Аспект md', type: 'Диван', category: 'sofas', series: 'aspect', price: 208300, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Отдельный модуль-сиденье Аспект.', description: ['Дополнительный модуль: докупается к готовой композиции или используется как самостоятельное место.'],
    specs: { 'Габариты, см': 'L 90 × D 90 × H 68', 'Модули': '1 сиденье', 'Обивка': 'Букле, рогожка, велюр, лён' } }),

  p({ id: 1219, slug: 'balloon-bed', name: 'Баллон', type: 'Кровать на цоколе', category: 'beds', series: 'balloon', price: 211900, image: 'images/hero-balloon.jpg', gallery: ['images/hero-balloon.jpg', 'images/product-bed.jpg'],
    short: 'Эффект парения на цоколе 5 см и объёмное изголовье.', description: ['Кровати серии БАЛЛОН созданы как альтернативное решение для любителей высоких матрасов. Цоколь высотой всего 5 см обеспечивает едва заметный, но выразительный эффект парения, подчёркивая лёгкость и современность образа.', 'Отсутствие ножек акцентирует внимание на монолитности силуэта, а сочетание текстильной обивки и объёмного изголовья придаёт модели гармоничную завершённость. Уникальный элемент изделия — декоративный кант, образующий замкнутый контур, который объединяет мягкие элементы кровати.'],
    specs: { 'Габариты, см': 'L 220 × D 190 × H 110', 'Спальное место': '160 × 200 / 180 × 200', 'Цоколь': '5 см, текстильная обивка', 'Изголовье': 'Объёмное, съёмный чехол', 'Обивка': 'Букле, рогожка, велюр' },
    finishes: [{ name: 'Песочный', color: '#cbb394' }, { name: 'Молочный', color: '#e8e0d3' }, { name: 'Графит', color: '#7c7b75' }, { name: 'Олива', color: '#8e9380' }] }),
  p({ id: 259, slug: 'balloon-c2', name: 'Баллон c2', type: 'Диван', category: 'sofas', series: 'balloon', price: 1042400, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg', 'images/showroom.jpg'],
    short: 'Большая модульная композиция с мягким контуром.', description: ['Модульная серия Баллон: округлые объёмы, кант по контуру и возможность собрать композицию под помещение.'],
    specs: { 'Габариты, см': 'L 420 × D 180 × H 72', 'Модули': '6 элементов', 'Обивка': 'Букле, рогожка, велюр' } }),
  p({ id: 287, slug: 'balloon-c1', name: 'Баллон c1', type: 'Диван', category: 'sofas', series: 'balloon', price: 489700, image: 'images/product-aspect.jpg', gallery: ['images/product-aspect.jpg'],
    short: 'Компактная модульная сборка Баллон.', description: ['Три мягких объёма, объединённых общим кантом.'],
    specs: { 'Габариты, см': 'L 250 × D 105 × H 72', 'Модули': '3 элемента', 'Обивка': 'Букле, рогожка, велюр' } }),
  p({ id: 295, slug: 'balloon-c6', name: 'Баллон c6', type: 'Диван', category: 'sofas', series: 'balloon', price: 462700, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg'],
    short: 'Угловая композиция с широким шезлонгом.', description: ['Шезлонг 105 см и мягкая спинка: композиция для ежедневного отдыха.'],
    specs: { 'Габариты, см': 'L 300 × D 180 × H 72', 'Модули': '4 элемента', 'Обивка': 'Букле, рогожка, велюр' } }),
  p({ id: 299, slug: 'balloon-c8', name: 'Баллон c8', type: 'Диван', category: 'sofas', series: 'balloon', price: 394300, image: 'images/hero-aspect.jpg', gallery: ['images/hero-aspect.jpg'],
    short: 'Самый компактный диван серии Баллон.', description: ['Мягкий двухместный диван с характерным округлым силуэтом.'],
    specs: { 'Габариты, см': 'L 195 × D 100 × H 72', 'Модули': '2 элемента', 'Обивка': 'Букле, рогожка, велюр' } }),
  p({ id: 1029, slug: 'karman-mt', name: 'Карман МТ', type: 'Диван', category: 'sofas', series: 'karman', price: 583000, image: 'images/hero-aspect.jpg', gallery: ['images/hero-aspect.jpg'],
    short: 'Компактная премиум-коллекция.', description: ['Карман МТ — компактная премиум-коллекция с выразительной геометрией подлокотника.'],
    specs: { 'Габариты, см': 'L 240 × D 98 × H 72', 'Обивка': 'Велюр, рогожка, букле' } }),
  p({ id: 53, slug: 'takt-c1', name: 'Такт c1', type: 'Диван', category: 'sofas', series: 'takt', price: 441000, image: 'images/product-sofa.jpg', gallery: ['images/product-sofa.jpg'],
    short: 'Модульная серия с ритмичной стёжкой.', description: ['Такт — серия, в которой ритм стёжки задаёт характер всей композиции.'],
    specs: { 'Габариты, см': 'L 300 × D 105 × H 70', 'Обивка': 'Рогожка, букле, велюр' } }),

  p({ id: 1045, slug: 'saturn', name: 'Сатурн', type: 'Стол нераздвижной', category: 'desks', series: 'saturn', price: 301400, image: 'images/hero-saturn.jpg', gallery: ['images/hero-saturn.jpg', 'images/product-coffee-table.jpg'],
    short: 'Монументальный стол с опорой из инженерного мрамора.', description: ['Серия монументальных столов САТУРН с мраморной опорой и обтекаемой формой столешницы. Лаконичный и современный, он не перегружает интерьер благодаря комплиментарному сочетанию оттенков столешницы и подстолья.', 'Устойчивая опора выполнена из нового материала, разработанного ТОК, — инженерного мрамора с естественным и предсказуемым рисунком камня. Изделие представлено в нескольких вариациях: с использованием натуральной или искусственной кожи для подстолья, с керамической столешницей или МДФ с покрытием из шпона дуба.'],
    specs: { 'Габариты, см': 'L 220 × W 110 × H 75', 'Столешница': 'Керамика / МДФ шпон дуба', 'Опора': 'Инженерный мрамор, кожа', 'Кромка': 'Скруглённая, 30 мм' },
    finishes: [{ name: 'Тёплый греж', color: '#c9c1b2' }, { name: 'Слоновая кость', color: '#e4ddd0' }, { name: 'Дымчатый камень', color: '#9d9c96' }, { name: 'Тёмный дуб', color: '#6d5a46' }] }),
  p({ id: 1043, slug: 'dopamin', name: 'Дофамин', type: 'Стол', category: 'desks', series: 'dopamin', price: 91700, image: 'images/product-coffee-table.jpg', gallery: ['images/product-coffee-table.jpg'],
    short: 'Стол с ярким цветовым акцентом.', description: ['Дофамин — небольшой стол, который добавляет интерьеру цвет без лишнего шума.'],
    specs: { 'Габариты, см': 'L 120 × W 70 × H 74', 'Столешница': 'МДФ, эмаль', 'Опора': 'Металл, порошковая окраска' } }),
  p({ id: 1039, slug: 'orbita', name: 'Орбита', type: 'Стол', category: 'bedside-tables', series: 'orbita', price: 94200, image: 'images/product-coffee-table.jpg', gallery: ['images/product-coffee-table.jpg'],
    short: 'Журнальный стол с круглой столешницей.', description: ['Орбита — журнальный стол, который легко перемещается и работает в любой композиции.'],
    specs: { 'Габариты, см': 'Ø 60 × H 42', 'Столешница': 'Инженерный мрамор', 'Опора': 'Металл' } }),
  p({ id: 1041, slug: 'proton', name: 'Протон', type: 'Стол', category: 'bedside-tables', series: 'proton', price: 119500, image: 'images/product-coffee-table.jpg', gallery: ['images/product-coffee-table.jpg'],
    short: 'Журнальный стол на скульптурной опоре.', description: ['Скульптурная опора и тонкая столешница — контраст массы и легкости.'],
    specs: { 'Габариты, см': 'Ø 80 × H 35', 'Столешница': 'Керамика', 'Опора': 'Инженерный мрамор' } }),
  p({ id: 1031, slug: 'spot', name: 'Спот', type: 'Стол', category: 'bedside-tables', series: 'spot', price: 98500, image: 'images/product-coffee-table.jpg', gallery: ['images/product-coffee-table.jpg'],
    short: 'Прикроватный стол с мягким светом.', description: ['Спот — небольшой стол, в который встроена лампа с тёплым рассеянным светом.'],
    specs: { 'Габариты, см': 'Ø 45 × H 52', 'Материал': 'Шпон дуба, металл', 'Свет': 'LED 2700K, диммер' } }),

  p({ id: 1255, slug: 'baikal-nova', name: 'Байкал нова', type: 'Стул', category: 'stools', series: 'baikal', price: 47400, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg', 'images/workshop.jpg'],
    short: 'Стул с «парящей» спинкой на массиве дуба.', description: ['Новое прочтение легендарной формы Нова. Мы переосмыслили дизайн нашего любимого стула.', 'Представьте стул, который кажется невесомым. Благодаря уникальной конструкции «парящей» спинки, он не перегружает пространство, а лишь деликатно подчеркивает его геометрию. Его так легко переместить по комнате — достаточно одного движения руки, чтобы изменить композицию.', 'Мы уделили внимание каждой детали, которую вы можете почувствовать. Массив дуба в основании дарит ощущение надежности и связи с природой, а многослойная мягкая обивка создает эффект «обволакивающего облака».'],
    specs: { 'Габариты, см': 'W 56 × D 55 × H 78', 'Высота сиденья, см': '47', 'Каркас': 'Массив дуба, масло-воск', 'Обивка': 'Рогожка, букле, кожа' },
    finishes: [{ name: 'Шалфей', color: '#97a088' }, { name: 'Карамель', color: '#b1834f' }, { name: 'Молочный', color: '#e5ddd0' }, { name: 'Графит', color: '#76756f' }] }),
  p({ id: 857, slug: 'baikal-nova-mt', name: 'Байкал нова МТ', type: 'Стул', category: 'stools', series: 'baikal', price: 52900, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg'],
    short: 'Версия Байкал нова с мягким чехлом.', description: ['МТ-версия добавляет съёмный текстильный чехол на спинку.'],
    specs: { 'Габариты, см': 'W 56 × D 55 × H 78', 'Каркас': 'Массив дуба', 'Обивка': 'Съёмный чехол' } }),
  p({ id: 1047, slug: 'zefir', name: 'Зефир', type: 'Стул', category: 'stools', series: 'zefir', price: 45000, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg'],
    short: 'Мягкий стул для столовой.', description: ['Округлое сиденье и тонкий каркас — стул, который не спорит с интерьером.'],
    specs: { 'Габариты, см': 'W 52 × D 53 × H 80', 'Каркас': 'Массив бука', 'Обивка': 'Рогожка' } }),
  p({ id: 1049, slug: 'element-polubar', name: 'Элемент полубарный', type: 'Полубарный стул', category: 'stools', series: 'element', price: 28900, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg'],
    short: 'Полубарный стул с высокой посадкой.', description: ['Элемент — серия лаконичных стульев для кухонного острова.'],
    specs: { 'Высота, см': '85', 'Высота сиденья, см': '63', 'Каркас': 'Металл, порошковая окраска' } }),
  p({ id: 1051, slug: 'element-bar', name: 'Элемент барный', type: 'Барный стул', category: 'stools', series: 'element', price: 29900, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg'],
    short: 'Барный стул с опорой для ног.', description: ['Барная версия Элемента повторяет геометрию серии и выдерживает ежедневную нагрузку.'],
    specs: { 'Высота, см': '105', 'Высота сиденья, см': '78', 'Каркас': 'Металл' } }),
  p({ id: 1217, slug: 'element', name: 'Элемент', type: 'Стул', category: 'stools', series: 'element', price: 27500, image: 'images/product-chair.jpg', gallery: ['images/product-chair.jpg'],
    short: 'Базовый стул серии Элемент.', description: ['Простая форма, честные материалы, аккуратная сборка.'],
    specs: { 'Высота, см': '82', 'Каркас': 'Металл', 'Обивка': 'Рогожка' } }),
];

export const SERIES = [
  { id: 'aspect', title: 'Аспект', subtitle: 'Модульная серия', tagline: 'Создайте свою уникальную конфигурацию', image: 'images/hero-aspect.jpg', description: 'Свобода планировочных решений, компактная посадка и декоративные кантики, создающие эффектный «разрез» в нижней части модуля.' },
  { id: 'balloon', title: 'Баллон', subtitle: 'Модульная серия', tagline: 'Выразительный эффект парения', image: 'images/hero-balloon.jpg', description: 'Округлые объёмы и цоколь 5 см, благодаря которому мебель будто отрывается от пола.' },
  { id: 'takt', title: 'Такт', subtitle: 'Модульная серия', tagline: 'Создайте свою уникальную конфигурацию', image: 'images/product-sofa.jpg', description: 'Серия, в которой ритм стёжки задаёт характер всей композиции.' },
  { id: 'saturn', title: 'Сатурн', subtitle: 'Столы', tagline: 'Инженерное совершенство', image: 'images/hero-saturn.jpg', description: 'Монументальные столы с опорой из инженерного мрамора и обтекаемой столешницей.' },
  { id: 'baikal', title: 'Байкал Нова', subtitle: 'Сиденья', tagline: 'Новое прочтение легенды', image: 'images/product-chair.jpg', description: 'Стул с «парящей» спинкой на массиве дуба.' },
  { id: 'karman', title: 'Карман МТ', subtitle: 'Диваны', tagline: 'Компактная премиум-коллекция', image: 'images/product-aspect.jpg', description: 'Компактная премиум-коллекция для небольших гостиных.' },
];

export const SHOWROOMS = [
  { id: 'design-district', city: 'Санкт-Петербург', name: 'Design District', area: '630 м²', phone: '+7 (911) 920-04-99', email: 'sales@tok-mebel.ru', hours: 'с 10:00 до 20:00', image: 'images/showroom.jpg', tour: true, address: 'Санкт-Петербург, Красногвардейская пл., Design District', map: 'https://yandex.ru/maps/-/CHuMJ8o7' },
  { id: 'zilart', city: 'Москва', name: 'ЖК ЗИЛарт', area: '495 м²', phone: '+7 (900) 637-77-70', email: 'sales@tok-mebel.ru', hours: 'с 10:00 до 20:00', image: 'images/hero-aspect.jpg', tour: true, address: 'Москва, ЖК ЗИЛарт, флагманский шоу-рум', map: 'https://yandex.ru/maps/org/tok/46002374429/' },
  { id: 'artplay', city: 'Москва', name: 'Artplay', area: '142 м²', phone: '+7 (911) 100-37-77', email: 'sales@tok-mebel.ru', hours: 'с 10:00 до 20:00', image: 'images/product-aspect.jpg', tour: false, address: 'Москва, дизайн-завод Artplay', map: 'https://yandex.ru/maps/-/CDU4UB62' },
];

export const NEWS = [
  { id: 31, date: '12 марта 2026', title: 'ТОК на выставке ARTDOM 2026: видео-обзор стенда', excerpt: 'Показываем стенд фабрики — новые модели Аспект, Баллон и интеграции. Разговор о материалах и о том, как рождаются серии.', image: 'images/showroom.jpg' },
  { id: 29, date: '18 февраля 2026', title: 'Презентация флагманского шоу-рума ТОК в ЖК ЗИЛАРТ', excerpt: 'Премиальный вечер в уникальных интерьерах: 495 м², новые сценарии жизни с мебелью ТОК.', image: 'images/hero-aspect.jpg' },
  { id: 9, date: '27 января 2026', title: 'ТОК разыскивает дизайнеров', excerpt: 'Открытый конкурс для авторов интерьеров: оставьте заявку на нашем сайте и предложите свой проект.', image: 'images/workshop.jpg' },
  { id: 24, date: '9 декабря 2025', title: 'Новая серия АСПЕКТ', excerpt: 'Модульная система для тех, кто ценит свободу планировочных решений. Дизайнер — Сергей Беляков.', image: 'images/product-sofa.jpg' },
];

export const ANCHORS = {
  about: [
    'Наша компания основана в 2019 году в Санкт-Петербурге. Тогда встретились четыре человека с определенными способностями: придумывать, проектировать, производить, управлять. Это соединилось в единый пазл под названием ТОК.',
    'Собственное производство полного цикла позволяет нам расширять возможности дизайна и контролировать качество на всех этапах. Каждая деталь проходит через заботливые руки профессионалов.',
    'Мы делаем ТОК – Товары Отличного Качества, потому что нами движет миссия: «Изменить к лучшему представление о российской дизайнерской мебели».',
  ],
};

export const money = (v) => 'от ' + v.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₽';

export const findProduct = (slug) => PRODUCTS.find((x) => x.slug === slug);
export const productsOfCategory = (cat) => PRODUCTS.filter((x) => x.category === cat);
export const productsOfSeries = (series) => PRODUCTS.filter((x) => x.series === series);
export const findSeries = (id) => SERIES.find((x) => x.id === id);
export const findCategory = (id) => CATEGORIES.find((x) => x.id === id);
