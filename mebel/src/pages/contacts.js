import { initPage, toast } from '../site.js';

initPage();

const form = document.querySelector('[data-contact-form]');
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
    toast('Спасибо! Заявка принята — менеджер свяжется с вами.');
  }, 600);
});
