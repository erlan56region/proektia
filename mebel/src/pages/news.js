import { NEWS } from '../../data.js';
import { initPage, mountReveal } from '../site.js';

initPage();

document.querySelector('[data-news-list]').innerHTML = NEWS.map((n) => `
  <article class="news-row reveal" id="post-${n.id}">
    <img src="${n.image}" alt="${n.title}" loading="lazy">
    <div>
      <h3>${n.title}</h3>
      <p>${n.excerpt}</p>
    </div>
    <time datetime="${n.date}">${n.date}</time>
  </article>`).join('');

mountReveal();
