/**
 * Shared renderers for News and Blog (list + article), built on the live
 * site's own texts. Links inside CMS text are routed to redesigned pages.
 */
import { qs, html, raw, toHTML, icon, esc } from '../core/dom.js';
import { localizeLinks } from '../core/routes.js';
import { ytFacade, initYouTube } from './youtube.js';

const iso = (d) => (d ? d.split('.').reverse().join('-') : '');

export function renderList(root, items, { href, label, pageSize = 12, emptyText = 'Материалов пока нет.' }) {
  if (!items.length) {
    root.innerHTML = `<p class="text-2">${esc(emptyText)}</p>`;
    return;
  }
  const [lead, ...rest] = items;
  let shown = pageSize;

  const card = (n) =>
    toHTML(html`<li><a class="ed-card__link" href="${href(n)}">
      <span class="ed-card__media"><img src="${n.thumb || n.image}" alt="" width="255" height="255" loading="lazy" decoding="async" /></span>
      ${n.date ? html`<time class="ed-date tabular" datetime="${iso(n.date)}">${n.date}</time>` : ''}
      <span class="ed-card__title">${n.title}</span>
      ${n.excerpt ? html`<span class="ed-card__excerpt">${n.excerpt}</span>` : ''}
    </a></li>`);

  const draw = () => {
    root.innerHTML =
      toHTML(html`<article class="ed-lead">
        <a class="ed-lead__link ed-lead__media" href="${href(lead)}" tabindex="-1" aria-hidden="true"><img src="${lead.image}" alt="" width="1200" height="750" decoding="async" /></a>
        <div class="ed-lead__body">
          ${lead.date ? html`<time class="ed-date tabular" datetime="${iso(lead.date)}">${lead.date}</time>` : ''}
          <h2 class="ed-lead__title"><a class="ed-lead__link" href="${href(lead)}">${lead.title}</a></h2>
          ${lead.excerpt ? html`<p class="text-2">${lead.excerpt}</p>` : ''}
          <a class="btn btn--ghost" href="${href(lead)}"><span class="btn__label">Читать</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
        </div>
      </article>`) +
      `<h2 class="visually-hidden">${esc(label)}</h2><ul class="ed-grid" role="list">${rest.slice(0, shown).map(card).join('')}</ul>` +
      (rest.length > shown
        ? `<div class="ed-more"><p class="text-3 tabular">Показано ${shown + 1} из ${items.length}</p><button type="button" class="btn btn--secondary btn--lg" data-ed-more><span class="btn__label">Показать ещё</span><span class="btn__icon" aria-hidden="true">${toHTML(icon('i-plus', 18))}</span></button></div>`
        : '');
  };
  draw();
  root.addEventListener('click', (e) => {
    if (!e.target.closest('[data-ed-more]')) return;
    const before = shown;
    shown += pageSize;
    draw();
    root.querySelectorAll('.ed-card__link')[before]?.focus({ preventScroll: true });
  });
}

export function renderArticle(root, item, { eyebrow, back, siblings = [], siblingHref, cta }) {
  document.title = `${item.title} — GLOBAL EFFECTS`;
  root.innerHTML = toHTML(html`<article class="art" aria-labelledby="art-title">
    <div class="container">
      <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><a href="${back.href}">${back.label}</a></li><li><span aria-current="page">${item.title}</span></li></ol></nav>
      <header class="art__head">
        <p class="eyebrow"><span>${eyebrow}${item.date ? html` · <time datetime="${iso(item.date)}">${item.date}</time>` : ''}</span></p>
        <h1 class="art__title" id="art-title">${item.title}</h1>
      </header>
      ${item.image ? html`<figure class="art__media"><img src="${item.image}" alt="" decoding="async" fetchpriority="high" /></figure>` : ''}
      <div class="art__grid">
        <div>
          <div class="art__body prose" data-art-body></div>
          ${item.videos && item.videos.length
            ? html`<ul class="art__videos" role="list">${item.videos.map((id) =>
                raw(`<li>${ytFacade(id, { thumb: item.image, title: item.title, label: 'Видео' })}</li>`),
              )}</ul>`
            : ''}
        </div>
        <aside class="art__aside" aria-label="Ещё материалы">
          ${siblings.length
            ? html`<div><p class="label">Читайте также</p><ul class="art__nav" role="list">${siblings.map(
                (s) => html`<li><a href="${siblingHref(s)}">${s.date ? html`<time class="ed-date tabular" datetime="${iso(s.date)}">${s.date}</time>` : ''}<span>${s.title}</span></a></li>`,
              )}</ul></div>`
            : ''}
          <a class="btn btn--ghost" href="${back.href}"><span class="btn__label">${back.all}</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
          ${cta ? html`<div class="art__cta"><p>${cta.text}</p><a class="btn btn--primary btn--md" href="${cta.href}"><span class="btn__label">${cta.label}</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 18)}</span></a></div>` : ''}
        </aside>
      </div>
    </div>
  </article>`);
  const body = qs('[data-art-body]', root);
  body.innerHTML = item.body; // sanitized at build time (tools/)
  localizeLinks(body);
  initYouTube(root);
}

export function renderMissing(root, { title, back }) {
  root.innerHTML = `<section class="container ed-missing"><p class="eyebrow">Ошибка 404</p><h1 class="h1">${esc(title)}</h1>
    <a class="btn btn--primary btn--lg" href="${back.href}"><span class="btn__label">${esc(back.all)}</span><span class="btn__icon" aria-hidden="true">${toHTML(icon('i-arrow', 20))}</span></a></section>`;
}
