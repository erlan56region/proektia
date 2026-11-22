import { SERIES, PRODUCTS, findSeries, productsOfSeries, money } from '../../data.js';
import { initPage, mountReveal, ICON } from '../site.js';

initPage();

const params = new URLSearchParams(location.search);
const id = params.get('series');
const list = document.querySelector('[data-series-list]');
const titleEl = document.querySelector('[data-series-title]');
const subEl = document.querySelector('[data-series-sub]');
const crumbs = document.querySelector('.crumbs');

function item(s, i) {
  const items = productsOfSeries(s.id);
  const minPrice = items.length ? Math.min(...items.map((x) => x.price)) : null;
  return `
    <article class="series-item reveal" id="${s.id}">
      <a class="series-item__media" href="series.html?series=${s.id}">
        <img src="${s.image}" alt="Серия ${s.title}" loading="lazy">
      </a>
      <div>
        <span class="series-item__num">${String(i + 1).padStart(2, '0')} — ${s.subtitle}</span>
        <h2><a href="series.html?series=${s.id}">${s.title}</a></h2>
        <p class="series-item__tag">${s.tagline}</p>
        <p>${s.description}</p>
        <div class="series-item__chips">
          <span class="chip">${items.length} ${items.length === 1 ? 'модель' : 'модели'}</span>
          ${minPrice ? `<span class="chip">${money(minPrice)}</span>` : ''}
          <a class="chip" href="series.html?series=${s.id}">Смотреть серию →</a>
        </div>
      </div>
    </article>`;
}

const current = id ? findSeries(id) : null;

if (current) {
  const items = productsOfSeries(current.id);
  document.title = `${current.title} — ${current.subtitle} | ТОК`;
  titleEl.textContent = current.title;
  subEl.textContent = current.description;
  crumbs.insertAdjacentHTML('beforeend', '<span class="sep">/</span><span>' + current.title + '</span>');
  list.innerHTML = `
    <div class="series-head reveal">
      <a class="back-link" href="series.html">${ICON.arrowL} Все серии</a>
      <span class="kicker">${items.length} моделей в серии</span>
    </div>
    <div class="grid-products">${items.map((p) => `
      <a class="pcard" href="product.html?slug=${p.slug}">
        <div class="pcard__media"><img src="${p.image}" alt="${p.name}" loading="lazy">${p.badge ? `<span class="pcard__badge">${p.badge}</span>` : ''}</div>
        <div class="pcard__body">
          <span class="pcard__type">${p.type}</span>
          <span class="pcard__name">${p.name}</span>
          <span class="pcard__price">${money(p.price)}</span>
          <span class="pcard__short">${p.short}</span>
        </div>
      </a>`).join('')}
    </div>`;
  document.querySelector('.cta h2').textContent = `Соберите свою композицию ${current.title}`;
  document.querySelector('.cta p').textContent = 'Модули серии можно комбинировать бесконечно: дизайнер фабрики поможет собрать композицию под размеры вашего помещения и покажет образцы обивки.';
  document.querySelector('.cta .kicker').textContent = 'Индивидуальная конфигурация';
  document.querySelector('[data-lead]').dataset.lead = `Конфигурация ${current.title}`;
} else {
  list.innerHTML = SERIES.map(item).join('');
}

mountReveal();
