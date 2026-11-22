// Общие компоненты и утилиты сайта ТОК.
import { NAV, PRODUCTS, money } from '../data.js';

/* ---------- иконки ---------- */
export const ICON = {
  search: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="10.8" cy="10.8" r="6.6"/><path d="m15.8 15.8 4 4"/></svg>',
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7.2-4.6-7.2-9.4A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.2 2.9C19.2 15.4 12 20 12 20Z"/></svg>',
  heartFill: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20s-7.2-4.6-7.2-9.4A4.2 4.2 0 0 1 12 7.7a4.2 4.2 0 0 1 7.2 2.9C19.2 15.4 12 20 12 20Z"/></svg>',
  phone: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.2 3.5h3l1.5 4-2.1 1.6a12 12 0 0 0 5.3 5.3l1.6-2.1 4 1.5v3a2 2 0 0 1-2.2 2A16.7 16.7 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z"/></svg>',
  close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrowL: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 6l-6 6 6 6"/></svg>',
  arrowR: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 6l6 6-6 6"/></svg>',
  menu: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};

const path = location.pathname.split('/').pop() || 'index.html';

/* ---------- шапка ---------- */
export function mountHeader() {
  const host = document.querySelector('[data-header]');
  if (!host) return;
  host.className = 'site-header';
  host.innerHTML = `
    <div class="wrap header-inner">
      <a class="logo" href="index.html" aria-label="ТОК — на главную">
        <b>ТОК</b><span>фабрика дизайнерской мебели</span>
      </a>
      <nav class="main-nav" aria-label="Основная навигация">
        ${NAV.map((n) => `<a href="${n.id}.html" class="${path === n.id + '.html' || (n.id === 'products' && path === 'catalog.html') ? 'is-active' : ''}">${n.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <a class="icon-btn" href="contacts.html" aria-label="Позвонить" title="Связаться с фабрикой">${ICON.phone}</a>
        <button class="icon-btn" type="button" data-open-drawer aria-label="Открыть меню">${ICON.menu}</button>
        <a class="btn btn--small" href="contacts.html">Заказать проект</a>
      </div>
    </div>`;
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer__scrim" data-close-drawer></div>
    <aside class="drawer__panel" aria-label="Меню">
      <div class="drawer__head">
        <span class="logo"><b>ТОК</b></span>
        <button class="icon-btn" type="button" data-close-drawer aria-label="Закрыть меню">${ICON.close}</button>
      </div>
      <nav>${NAV.map((n) => `<a href="${n.id}.html">${n.label}</a>`).join('')}</nav>
      <div class="drawer__foot">
        <a href="tel:+79119200499">+7 (911) 920-04-99</a>
        <a href="mailto:sales@tok-mebel.ru">sales@tok-mebel.ru</a>
        <span class="muted" style="font-size:12px">Шоу-румы в Москве и Санкт-Петербурге</span>
      </div>
    </aside>`;
  document.body.append(drawer);
  const toggle = (open) => drawer.classList.toggle('is-open', open);
  host.querySelectorAll('[data-open-drawer]').forEach((b) => b.addEventListener('click', () => toggle(true)));
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close-drawer]')) toggle(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  const onScroll = () => host.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- подвал ---------- */
export function mountFooter() {
  const host = document.querySelector('[data-footer]');
  if (!host) return;
  host.className = 'site-footer';
  host.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a class="logo" href="index.html"><b>ТОК</b><span>фабрика дизайнерской мебели</span></a>
          <p class="footer-about">Основана в 2019 году в Санкт-Петербурге. Собственное производство полного цикла, премиальные материалы и контроль качества на каждом этапе.</p>
        </div>
        <div class="footer-col">
          <h4>Продукция</h4>
          <a href="catalog.html?category=sofas">Диваны</a>
          <a href="catalog.html?category=beds">Кровати</a>
          <a href="catalog.html?category=desks">Столы</a>
          <a href="catalog.html?category=stools">Сиденья</a>
        </div>
        <div class="footer-col">
          <h4>Фабрика</h4>
          <a href="about.html">О компании</a>
          <a href="series.html">Серии</a>
          <a href="news.html">Новости</a>
          <a href="showrooms.html">Шоу-румы</a>
        </div>
        <div class="footer-col">
          <h4>Контакты</h4>
          <a href="tel:+79119200499">+7 (911) 920-04-99</a>
          <a href="tel:+79006377770">+7 (900) 637-77-70</a>
          <a href="mailto:sales@tok-mebel.ru">sales@tok-mebel.ru</a>
          <span>с 10:00 до 20:00</span>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2018–<span data-year>2026</span> ООО «Ток Мебель». Все права защищены.</span>
        <a href="legal.html" style="color:inherit">Политика конфиденциальности</a>
        <span>Москва · Санкт-Петербург</span>
      </div>
    </div>`;
}

/* ---------- появление при скролле ---------- */
export function mountReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting) {
        en.target.style.transitionDelay = `${Math.min(i * 60, 240)}ms`;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach((i) => io.observe(i));
}

/* ---------- тосты ---------- */
let toastEl;
export function toast(text, ms = 3200) {
  if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.append(toastEl); }
  toastEl.textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('is-on'), ms);
}

/* ---------- избранное ---------- */
const FAV_KEY = 'tok:favorites';
export const favorites = {
  all: () => { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; } },
  has(id) { return this.all().includes(id); },
  toggle(id) {
    const list = this.all(); const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(list)); } catch { /* приватный режим */ }
    return i < 0;
  },
};

/* ---------- карточка товара ---------- */
export function productCard(p) {
  const on = favorites.has(p.id);
  return `
  <article class="pcard reveal">
    <a class="pcard__media" href="product.html?slug=${p.slug}" aria-label="${p.name}">
      <img src="${p.image}" alt="${p.name} — ${p.type.toLowerCase()} ТОК" loading="lazy">
      ${p.badge ? `<span class="pcard__badge">${p.badge}</span>` : ''}
      <span class="pcard__hover-cta">Смотреть модель</span>
    </a>
    <button class="pcard__fav ${on ? 'is-on' : ''}" type="button" data-fav="${p.id}" aria-label="В избранное" aria-pressed="${on}">${on ? ICON.heartFill : ICON.heart}</button>
    <div class="pcard__body">
      <span class="pcard__type">${p.type}</span>
      <a class="pcard__name" href="product.html?slug=${p.slug}">${p.name}</a>
      <span class="pcard__price">${money(p.price)}</span>
      <p class="pcard__short">${p.short}</p>
    </div>
  </article>`;
}

export function bindFavorites(root = document) {
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    const id = Number(b.dataset.fav);
    const added = favorites.toggle(id);
    b.classList.toggle('is-on', added);
    b.setAttribute('aria-pressed', String(added));
    b.innerHTML = added ? ICON.heartFill : ICON.heart;
    const p = PRODUCTS.find((x) => x.id === id);
    toast(added ? `«${p ? p.name : 'Модель'}» добавлена в избранное` : 'Удалено из избранного');
  });
}

/* ---------- модальное окно заявки ---------- */
export function openLead(title = 'Обсудить проект', subtitle = 'Менеджер фабрики свяжется с вами в течение рабочего дня.') {
  const prev = document.querySelector('[data-lead-modal]');
  if (prev) prev.remove();
  const el = document.createElement('div');
  el.className = 'drawer is-open';
  el.setAttribute('data-lead-modal', '');
  el.innerHTML = `
    <div class="drawer__scrim" data-close-lead></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="${title}" style="width:min(460px,92vw)">
      <div class="drawer__head">
        <span class="kicker">Заявка</span>
        <button class="icon-btn" type="button" data-close-lead aria-label="Закрыть">${ICON.close}</button>
      </div>
      <div>
        <h2 style="font-size:34px">${title}</h2>
        <p class="muted" style="font-size:13.5px;margin-top:10px">${subtitle}</p>
      </div>
      <form class="form" novalidate>
        <div class="field"><label for="ld-name">Имя</label><input id="ld-name" name="name" required autocomplete="name" placeholder="Как к вам обращаться"></div>
        <div class="field"><label for="ld-phone">Телефон</label><input id="ld-phone" name="phone" required inputmode="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__"></div>
        <div class="field"><label for="ld-city">Шоу-рум</label>
          <select id="ld-city" name="city">
            <option>Москва · ЖК ЗИЛарт</option>
            <option>Москва · Artplay</option>
            <option>Санкт-Петербург · Design District</option>
            <option>Онлайн, по видеосвязи</option>
          </select>
        </div>
        <label class="consent"><input type="checkbox" required> Согласен на обработку персональных данных</label>
        <button class="btn" type="submit">Отправить заявку</button>
        <p class="form-status" role="status"></p>
      </form>
    </aside>`;
  document.body.append(el);
  document.body.style.overflow = 'hidden';
  const close = () => { el.remove(); document.body.style.overflow = ''; };
  el.addEventListener('click', (e) => { if (e.target.closest('[data-close-lead]')) close(); });
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
  const form = el.querySelector('form');
  const status = el.querySelector('.form-status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name=name]').value.trim();
    const digits = form.querySelector('[name=phone]').value.replace(/\D/g, '');
    if (name.length < 2) { status.textContent = 'Укажите имя.'; form.querySelector('[name=name]').focus(); return; }
    if (digits.length < 10) { status.textContent = 'Укажите телефон полностью.'; form.querySelector('[name=phone]').focus(); return; }
    if (!form.querySelector('input[type=checkbox]').checked) { status.textContent = 'Нужно согласие на обработку данных.'; return; }
    status.textContent = 'Отправляем…';
    setTimeout(() => { close(); toast('Спасибо! Заявка принята — менеджер свяжется с вами.'); }, 500);
  });
  setTimeout(() => form.querySelector('input')?.focus(), 120);
}

export function bindLeadButtons() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lead]');
    if (b) {
      e.preventDefault();
      openLead(b.dataset.lead || undefined, b.dataset.leadSub || undefined);
    }
  });
}

/* ---------- инициализация ---------- */
export function initPage() {
  mountHeader();
  mountFooter();
  bindFavorites();
  bindLeadButtons();
  mountReveal();
  markCurrentYear();
}

/* ---------- юридические страницы ---------- */
function markCurrentYear() {
  const now = new Date();
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = now.getFullYear(); });
}
