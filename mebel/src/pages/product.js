import { PRODUCTS, findProduct, findCategory, findSeries, productsOfSeries, money, CATEGORIES, SERIES } from '../../data.js';
import { initPage, productCard, mountReveal, toast, openLead, favorites, ICON } from '../site.js';

initPage();

const params = new URLSearchParams(location.search);
const slug = params.get('slug') || PRODUCTS[0].slug;
const p = findProduct(slug);
const host = document.querySelector('[data-pdp]');

if (!p) {
  host.innerHTML = `<div style="grid-column:1/-1;padding:60px 0">
      <h1>Модель не найдена</h1>
      <p class="lead" style="margin:16px 0 24px">Возможно, ссылка устарела. В каталоге собраны все актуальные модели.</p>
      <a class="btn" href="products.html">Перейти в каталог</a>
    </div>`;
} else {
  const cat = findCategory(p.category);
  const series = findSeries(p.series);
  document.title = `${p.name} — ${p.type.toLowerCase()} | ТОК`;
  const desc = document.querySelector('meta[name=description]');
  if (desc) desc.setAttribute('content', `${p.name} — ${p.type.toLowerCase()} фабрики ТОК. ${p.short} Цена ${money(p.price)}.`);
  document.querySelector('[data-crumb-cat]').textContent = cat ? cat.title : 'Продукция';
  document.querySelector('[data-crumb-name]').textContent = p.name;
  if (series) {
    const link = document.querySelector('[data-series-link]');
    link.href = `series.html?series=${series.id}`;
    link.textContent = `Серия ${series.title}`;
  }

  const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const finishes = p.finishes || [{ name: 'По каталогу обивки', color: '#cfc7b8' }];
  const isFav = favorites.has(p.id);

  host.innerHTML = `
    <div class="gallery">
      <div class="gallery__main">
        <img data-gmain src="${gallery[0]}" alt="${p.name} — ${p.type.toLowerCase()} ТОК">
        ${gallery.length > 1 ? `<div class="gallery__nav">
          <button type="button" data-gprev aria-label="Предыдущее фото">${ICON.arrowL}</button>
          <button type="button" data-gnext aria-label="Следующее фото">${ICON.arrowR}</button>
        </div>` : ''}
      </div>
      ${gallery.length > 1 ? `<div class="gallery__thumbs">${gallery.map((g, i) => `
        <button type="button" class="${i === 0 ? 'is-on' : ''}" data-gthumb="${i}" aria-label="Фото ${i + 1}"><img src="${g}" alt=""></button>`).join('')}
      </div>` : ''}
      <p class="muted" style="font-size:12px;margin-top:12px">Визуализация модели. Образцы обивки и материалов доступны в шоу-руме и по запросу.</p>
    </div>

    <div class="pdp__info">
      <span class="pdp__type">${cat ? cat.title : p.type} · ${p.type}</span>
      <h1>${p.name}</h1>
      <div class="pdp__meta">
        <span>Дизайнер: ${p.designer}</span>
        <span>Год создания: ${p.year}</span>
        ${series ? `<span>Серия: ${series.title}</span>` : ''}
      </div>
      <div class="pdp__price">${money(p.price)}<small>Цена зависит от обивки и конфигурации. Доставка и сборка рассчитываются отдельно.</small></div>

      <div class="finish-label"><span>Обивка / отделка</span><span data-finish-name>${finishes[0].name}</span></div>
      <div class="finish-row">
        ${finishes.map((f, i) => `<button class="finish ${i === 0 ? 'is-on' : ''}" type="button" data-finish="${f.name}" aria-label="${f.name}" title="${f.name}"><i style="background:${f.color}"></i></button>`).join('')}
      </div>

      <div class="pdp__actions">
        <button class="btn" type="button" data-lead="Заказать ${p.name}" data-lead-sub="Модель ${p.name}, ${p.type.toLowerCase()}. Менеджер уточнит конфигурацию, обивку и сроки.">Заказать</button>
        <button class="btn btn--ghost" type="button" data-lead="Примерка в интерьере" data-lead-sub="Привезём образцы обивки и 3D-визуализацию ${p.name} в вашу квартиру.">Примерить в интерьере</button>
      </div>
      <button class="pdp__fav" type="button" data-pdp-fav aria-pressed="${isFav}">
        <span data-pdp-fav-icon>${isFav ? ICON.heartFill : ICON.heart}</span>
        <span data-pdp-fav-text>${isFav ? 'В избранном' : 'В избранное'}</span>
      </button>
      <p class="pdp__note">Срок изготовления 8–10 недель. Возможна индивидуальная конфигурация: изменение размеров, глубины посадки, выбор обивки из каталога.</p>

      <div class="accordion" style="margin-top:26px">
        <details open>
          <summary>Описание</summary>
          <div class="accordion__body">${p.description.map((d) => `<p style="margin-bottom:10px">${d}</p>`).join('')}</div>
        </details>
        <details>
          <summary>Характеристики</summary>
          <div class="accordion__body">
            <dl class="spec-table" style="margin-top:0;border-top:0">
              ${Object.entries(p.specs).map(([k, v]) => `<div><dt>${k}</dt><b>${v}</b></div>`).join('')}
            </dl>
          </div>
        </details>
        <details>
          <summary>Доставка и сборка</summary>
          <div class="accordion__body">
            <p>Доставляем по Москве, Санкт-Петербургу и России. Сборку выполняют наши мастера: подъём, монтаж и расстановка входят в услугу.</p>
            <p style="margin-top:8px">Гарантия на каркас — 5 лет, на мягкие элементы — 3 года.</p>
          </div>
        </details>
        <details>
          <summary>Материалы</summary>
          <div class="accordion__body">
            <p>Каркас из клеёного массива, ППУ высокой эластичности, съёмные чехлы на молнии, декоративный кант, фурнитура скрытого монтажа. Текстиль и кожа — от фабрик Италии и России.</p>
          </div>
        </details>
      </div>
    </div>`;

  /* галерея */
  let gi = 0;
  const main = host.querySelector('[data-gmain]');
  const thumbs = [...host.querySelectorAll('[data-gthumb]')];
  const show = (i) => {
    gi = (i + gallery.length) % gallery.length;
    main.src = gallery[gi];
    thumbs.forEach((t, k) => t.classList.toggle('is-on', k === gi));
  };
  host.querySelector('[data-gprev]')?.addEventListener('click', () => show(gi - 1));
  host.querySelector('[data-gnext]')?.addEventListener('click', () => show(gi + 1));
  thumbs.forEach((t) => t.addEventListener('click', () => show(Number(t.dataset.gthumb))));

  /* обивка */
  const nameEl = host.querySelector('[data-finish-name]');
  host.querySelectorAll('[data-finish]').forEach((b) => b.addEventListener('click', () => {
    host.querySelectorAll('[data-finish]').forEach((x) => x.classList.remove('is-on'));
    b.classList.add('is-on');
    nameEl.textContent = b.dataset.finish;
    toast(`Обивка: ${b.dataset.finish}`);
  }));

  /* избранное */
  const favBtn = host.querySelector('[data-pdp-fav]');
  favBtn.addEventListener('click', () => {
    const on = favorites.toggle(p.id);
    favBtn.querySelector('[data-pdp-fav-text]').textContent = on ? 'В избранном' : 'В избранное';
    favBtn.querySelector('[data-pdp-fav-icon]').innerHTML = on ? ICON.heartFill : ICON.heart;
    favBtn.setAttribute('aria-pressed', String(on));
    toast(on ? 'Добавлено в избранное' : 'Удалено из избранного');
  });

  /* похожие */
  const relatedHost = document.querySelector('[data-related]');
  const related = [...productsOfSeries(p.series).filter((x) => x.id !== p.id)];
  if (related.length < 4) {
    PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id && !related.includes(x))
      .slice(0, 4 - related.length).forEach((x) => related.push(x));
  }
  relatedHost.innerHTML = related.slice(0, 4).map(productCard).join('');
  history.replaceState(null, '', 'product.html?slug=' + p.slug);
  mountReveal();
}
