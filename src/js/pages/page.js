/** Text pages from the live CMS: delivery, privacy policy, sales rules. */
import { ready } from '../app.js';
import { qs, esc, params } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes, localizeLinks } from '../core/routes.js';
import { getPages } from '../data/api.js';
import { renderMissing } from '../components/editorial.js';

const NAV = [
  ['delivery', 'Доставка'],
  ['pravila-prodazi-tovarov', 'Правила продажи товаров'],
  ['politika-konfidencialnosti', 'Политика конфиденциальности'],
];

ready(async () => {
  const root = qs('[data-ed-root]');
  const pages = await getPages();
  const slug = params().get('p') || 'delivery';
  const page = pages[slug];
  if (!page) {
    renderMissing(root, { title: 'Страница не найдена', back: { href: '/', all: 'На главную' } });
    root.removeAttribute('aria-busy');
    return;
  }
  document.title = `${page.title} — GLOBAL EFFECTS`;
  root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
      <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><span aria-current="page">${esc(page.title)}</span></li></ol></nav>
      <div class="ed-hero__grid"><h1 class="ed-hero__title" id="ed-title" data-reveal="mask"><span class="line"><span>${esc(page.title)}</span></span></h1></div>
    </div></section>
    <div class="container textpage__grid">
      <nav class="textpage__nav" aria-label="Покупателям"><p class="label">Покупателям</p><ul role="list">${NAV.map(
        ([s, t]) => `<li><a href="${routes.page(`/page/${s}`)}" ${s === slug ? 'aria-current="page"' : ''}>${t}</a></li>`,
      ).join('')}</ul></nav>
      <div class="prose" data-text></div>
    </div>`;
  const body = qs('[data-text]', root);
  body.innerHTML = page.body; // sanitized at build time (tools/)
  localizeLinks(body);
  root.removeAttribute('aria-busy');
  reveal();
});
