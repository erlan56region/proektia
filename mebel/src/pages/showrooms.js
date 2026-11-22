import { SHOWROOMS } from '../../data.js';
import { initPage, mountReveal, toast } from '../site.js';

initPage();

document.querySelector('[data-rooms-full]').innerHTML = SHOWROOMS.map((r) => `
  <article class="room room--wide reveal" id="${r.id}">
    <div class="room__media">
      <img src="${r.image}" alt="Шоу-рум ТОК ${r.name}" loading="lazy">
      ${r.tour ? '<span class="room__tag">3D-тур</span>' : ''}
    </div>
    <div class="room__body">
      <span class="room__city">${r.city}</span>
      <h3>${r.name}</h3>
      <span class="room__area">${r.area} · ${r.hours}</span>
      <p class="muted" style="font-size:13.5px;margin-top:6px">${r.address}</p>
      <div class="room__list">
        <a href="tel:${r.phone.replace(/[^\d+]/g, '')}">${r.phone}</a>
        <a href="mailto:${r.email}">${r.email}</a>
      </div>
      <div class="room__foot">
        <button class="btn btn--small" type="button" data-lead="Визит в шоу-рум ${r.name}" data-lead-sub="Шоу-рум ${r.name}, ${r.city}. Менеджер подтвердит удобное время.">Записаться</button>
        <a class="btn btn--small btn--ghost" href="${r.map}" target="_blank" rel="noopener">На карте</a>
      </div>
    </div>
  </article>`).join('');

mountReveal();

const form = document.querySelector('[data-visit-form]');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const status = form.querySelector('.form-status');
  const name = form.querySelector('[name=name]').value.trim();
  const digits = form.querySelector('[name=phone]').value.replace(/\D/g, '');
  if (name.length < 2) { status.textContent = 'Укажите имя.'; form.querySelector('[name=name]').focus(); return; }
  if (digits.length < 10) { status.textContent = 'Укажите телефон полностью.'; form.querySelector('[name=phone]').focus(); return; }
  if (!form.querySelector('input[type=checkbox]').checked) { status.textContent = 'Нужно согласие на обработку данных.'; return; }
  status.textContent = 'Отправляем…';
  setTimeout(() => {
    form.reset();
    status.textContent = '';
    toast('Заявка отправлена. Менеджер свяжется с вами в течение рабочего дня.');
  }, 600);
});
