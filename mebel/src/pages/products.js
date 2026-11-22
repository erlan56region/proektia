import { PRODUCTS, CATEGORIES, findCategory } from '../../data.js';
import { initPage, productCard, mountReveal } from '../site.js';

initPage();

const params = new URLSearchParams(location.search);
const state = {
  category: params.get('category') || 'all',
  sort: params.get('sort') || 'new',
};

const grid = document.querySelector('[data-grid]');
const filters = document.querySelector('[data-filters]');
const sortSel = document.querySelector('[data-sort]');
const titleEl = document.querySelector('[data-title]');
const subEl = document.querySelector('[data-subtitle]');
const crumbEl = document.querySelector('[data-crumb]');
const countEl = document.querySelector('[data-count]');
const emptyEl = document.querySelector('[data-empty]');

filters.innerHTML = [{ id: 'all', title: 'Все' }, ...CATEGORIES]
  .map((c) => `<button class="chip" type="button" data-cat="${c.id}">${c.title}</button>`).join('');

sortSel.value = state.sort;

function syncHead() {
  const cat = state.category === 'all' ? null : findCategory(state.category);
  const list = filtered();
  titleEl.textContent = cat ? cat.title : 'Продукция фабрики ТОК';
  subEl.textContent = cat
    ? cat.note + '. Модели серии можно посмотреть на странице серии — там собраны все конфигурации.'
    : 'Диваны, кровати, столы и сиденья собственного производства. Все цены — от фабрики, без наценки салонов.';
  crumbEl.textContent = cat ? cat.title : 'Продукция';
  countEl.textContent = `${list.length} ${plural(list.length, ['модель', 'модели', 'моделей'])}`;
  document.title = (cat ? cat.title : 'Каталог мебели') + ' — ТОК';
}

function plural(n, forms) {
  const a = Math.abs(n) % 100; const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

function filtered() {
  let list = PRODUCTS.filter((p) => state.category === 'all' || p.category === state.category);
  const s = state.sort;
  list = [...list];
  if (s === 'asc') list.sort((a, b) => a.price - b.price);
  else if (s === 'desc') list.sort((a, b) => b.price - a.price);
  else if (s === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  else list.sort((a, b) => (b.year - a.year) || (b.id - a.id));
  return list;
}

function render() {
  const list = filtered();
  grid.innerHTML = list.map(productCard).join('');
  emptyEl.hidden = list.length > 0;
  filters.querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-on', c.dataset.cat === state.category));
  syncHead();
  mountReveal();
}

function updateURL() {
  const q = new URLSearchParams();
  if (state.category !== 'all') q.set('category', state.category);
  if (state.sort !== 'new') q.set('sort', state.sort);
  const url = location.pathname + (q.toString() ? '?' + q.toString() : '');
  history.replaceState(null, '', url);
}

filters.addEventListener('click', (e) => {
  const b = e.target.closest('[data-cat]');
  if (!b) return;
  state.category = b.dataset.cat;
  updateURL();
  render();
  grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
sortSel.addEventListener('change', () => { state.sort = sortSel.value; updateURL(); render(); });

render();
