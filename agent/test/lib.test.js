import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, rowsToObjects, columnLetter } from '../lib/csv.js';
import { parseDuckDuckGo, htmlToText, isPrivateUrl, todayStamp } from '../lib/util.js';

test('CSV: кавычки, двойные кавычки и точки с запятой', () => {
  const rows = parseCsv('Задача;Статус\n"Отчёт, неделя";открыта\n"Слово ""кавычки""";выполнено');
  assert.equal(rows[0][0], 'Задача');
  assert.equal(rows[1][0], 'Отчёт, неделя');
  assert.equal(rows[2][0], 'Слово "кавычки"');
  const objects = rowsToObjects(rows);
  assert.equal(objects[0].статус, 'открыта');
  assert.equal(objects[0].__row, 2);
});

test('columnLetter: номер столбца A..AA', () => {
  assert.equal(columnLetter(0), 'A');
  assert.equal(columnLetter(25), 'Z');
  assert.equal(columnLetter(26), 'AA');
});

test('DDG parser: ссылка, заголовок и сниппет', () => {
  const html = `<div class="result results_links">
    <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fnews">CoffeeIT — <b>новости</b></a>
    <a class="result__snippet">Описание &amp; детали</a>
  </div>`;
  const [result] = parseDuckDuckGo(html, 5);
  assert.equal(result.url, 'https://example.com/news');
  assert.equal(result.title, 'CoffeeIT — новости');
  assert.equal(result.snippet, 'Описание & детали');
});

test('утилиты: HTML в текст, приватные URL и дата', () => {
  assert.equal(htmlToText('<p>Привет <b>мир</b></p><script>x()</script>'), 'Привет мир');
  assert.equal(isPrivateUrl('http://localhost:11434'), true);
  assert.equal(isPrivateUrl('https://example.com'), false);
  assert.match(todayStamp(new Date('2026-11-21T10:00:00Z')), /^2026-11-21$/);
});
