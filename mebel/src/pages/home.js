import { CATEGORIES, PRODUCTS, SERIES, SHOWROOMS, NEWS, money } from '../../data.js';
import { initPage } from '../site.js';

initPage();

/* категории */
const catHost = document.querySelector('[data-categories]');
if (catHost) {
  catHost.innerHTML = CATEGORIES.map((c) => `
    <a class="tile reveal" href="catalog.html?category=${c.id}">
      <img src="${c.image}" alt="${c.title}" loading="lazy">
      <span class="tile__arrow">→</span>
      <span class="tile__body">
        <small>${PRODUCTS.filter((p) => p.category === c.id).length} моделей</small>
        <h3>${c.title}</h3>
        <p>${c.note}</p>
      </span>
    </a>`).join('');
}

/* новинки */
const newHost = document.querySelector('[data-new-products]');
if (newHost) {
  const picks = ['aspect-c1', 'saturn', 'baikal-nova', 'balloon-bed', 'aspect-c4', 'zefir']
    .map((s) => PRODUCTS.find((p) => p.slug === s)).filter(Boolean);
  newHost.innerHTML = picks.map((p) => `
    <a class="pcard reveal" href="product.html?slug=${p.slug}">
      <div class="pcard__media"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="pcard__badge">${p.badge}</span></div>
      <div class="pcard__body">
        <span class="pcard__type">${p.type}</span>
        <span class="pcard__name">${p.name}</span>
        <span class="pcard__price">${money(p.price)}</span>
      </div>
    </a>`).join('');
}

/* палитра материалов */
const swHost = document.querySelector('[data-swatches]');
if (swHost) {
  const swatches = [
    ['TDD 021', 'Букле, молочный', '#e6dccb'], ['LAN 618', 'Лён, песочный', '#d3c1a7'],
    ['CRB', 'Рогожка, греж', '#b9b1a3'], ['1069', 'Шпон дуба, натуральный', '#c19a6b'],
    ['ИН', 'Инженерный мрамор', '#d8d5cc'], ['1309', 'Кожа, карамель', '#a9713f'],
  ];
  swHost.innerHTML = swatches.map(([code, name, hex]) => `
    <div class="swatch"><i style="background:${hex}"></i><b>${code}</b><small>${name}</small></div>`).join('');
}

/* шоу-румы */
const roomsHost = document.querySelector('[data-rooms]');
if (roomsHost) {
  roomsHost.innerHTML = SHOWROOMS.map((r) => `
    <a class="room reveal" href="showrooms.html#${r.id}">
      <div class="room__media"><img src="${r.image}" alt="Шоу-рум ТОК ${r.name}" loading="lazy">${r.tour ? '<span class="room__tag">3D-тур</span>' : ''}</div>
      <div class="room__body">
        <span class="room__city">${r.city}</span>
        <h3>${r.name}</h3>
        <span class="room__area">${r.area} · ${r.hours}</span>
        <div class="room__list"><span>${r.phone}</span><span>${r.email}</span></div>
      </div>
    </a>`).join('');
}

/* новости */
const newsHost = document.querySelector('[data-news]');
if (newsHost) {
  newsHost.innerHTML = NEWS.slice(0, 3).map((n) => `
    <a class="post reveal" href="news.html#post-${n.id}">
      <div class="post__media"><img src="${n.image}" alt="${n.title}" loading="lazy"></div>
      <div class="post__body">
        <span class="post__date">${n.date}</span>
        <h3>${n.title}</h3>
        <p>${n.excerpt}</p>
      </div>
    </a>`).join('');
}

/* серии — быстрый переход */
const seriesHost = document.querySelector('[data-series-strip]');
if (seriesHost) seriesHost.innerHTML = SERIES.map((s) => `<a href="series.html?series=${s.id}">${s.title}</a>`).join('');
