/**
 * Shared renderers for News and Blog (list + article), built on the live
 * site's own texts. Links inside CMS text are routed to redesigned pages.
 */
import { qs, html, raw, toHTML, icon, esc, plural } from '../core/dom.js';
import { localizeLinks, unlinkMissingProducts, routes } from '../core/routes.js';
import { getCatalog } from '../data/api.js';
import { ytFacade, initYouTube } from './youtube.js';

const iso = (d) => (d ? d.split('.').reverse().join('-') : '');

/** `level` sets the heading level of item titles (3 when the list sits inside a page section). */
export function renderList(root, items, { href, label, pageSize = 12, level = 2, emptyText = 'Материалов пока нет.' }) {
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
        <a class="ed-lead__link ed-lead__media" href="${href(lead)}" tabindex="-1" aria-hidden="true"><img src="${lead.image}" alt="" width="1200" height="750" loading="lazy" decoding="async" /></a>
        <div class="ed-lead__body">
          ${lead.date ? html`<time class="ed-date tabular" datetime="${iso(lead.date)}">${lead.date}</time>` : ''}
          ${raw(`<h${level} class="ed-lead__title">`)}<a class="ed-lead__link" href="${href(lead)}">${lead.title}</a>${raw(`</h${level}>`)}
          ${lead.excerpt ? html`<p class="text-2">${lead.excerpt}</p>` : ''}
          <a class="btn btn--ghost" href="${href(lead)}"><span class="btn__label">Читать</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
        </div>
      </article>`) +
      `<h${level} class="visually-hidden">${esc(label)}</h${level}><ul class="ed-grid" role="list">${rest.slice(0, shown).map(card).join('')}</ul>` +
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
      <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="${routes.home()}">Главная</a></li><li><a href="${routes.about()}">О компании</a></li><li><a href="${back.href}">${back.label}</a></li><li><span aria-current="page">${item.title}</span></li></ol></nav>
      <header class="art__head">
        <p class="eyebrow"><span>${eyebrow}${item.date ? html` · <time datetime="${iso(item.date)}">${item.date}</time>` : ''}</span></p>
        <h1 class="art__title" id="art-title" data-fit>${item.title}</h1>
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
          ${cta ? html`<div class="art__cta"><p>${cta.text}</p><a class="btn btn--primary btn--md" href="${cta.href}"><span class="btn__label">${cta.label}</span><span class="btn__icon" aria-hidden="true">${icon(cta.icon || 'i-arrow', 18)}</span></a></div>` : ''}
        </aside>
      </div>
    </div>
  </article>`);
  const body = qs('[data-art-body]', root);
  body.innerHTML = item.body; // sanitized at build time (tools/)
  localizeLinks(body);
  // discontinued products mentioned in old texts → plain text (the catalog is cached by the header search)
  getCatalog()
    .then((catalog) => unlinkMissingProducts(body, catalog.bySlug))
    .catch(() => {});
  initYouTube(root);
}

/* ------------------------------------------------------------------ Blog
   «Наш блог» — editorial, not a card grid: a feature with a large cover,
   an asymmetric mosaic, then a numbered index of every other material.
   Only real fields are shown (the live blog has no dates or topics).      */

// The live excerpts often repeat the title in capitals — drop that echo
const cleanExcerpt = (p) => {
  const t = (p.excerpt || '').replace(/\s+/g, ' ').trim();
  const head = p.title.toUpperCase();
  return t.toUpperCase().startsWith(head) ? t.slice(head.length).trim() : t;
};

/** `level` sets the heading level; `indexLimit` folds the numbered index behind a «Показать все» button. */
export function renderBlogList(root, posts, { href, level = 2, indexLimit = Infinity }) {
  const n = posts.length;
  const num = (i) => String(i + 1).padStart(2, '0');
  const hOpen = (attrs) => raw(`<h${level} ${attrs}>`);
  const hClose = raw(`</h${level}>`);
  const [lead, ...rest] = posts;
  const mosaic = rest.slice(0, 5);
  const index = rest.slice(5);
  const folded = index.length - indexLimit;

  root.innerHTML = toHTML(html`
    <article class="bl-feature" aria-labelledby="bl-feature-title">
      <a class="bl-feature__media" href="${href(lead)}" tabindex="-1" aria-hidden="true">
        <img src="${lead.image}" alt="" width="1600" height="900" loading="lazy" decoding="async" />
      </a>
      <div class="bl-feature__body">
        <p class="bl-num tabular"><b>${num(0)}</b> / ${String(n).padStart(2, '0')}</p>
        ${hOpen('class="bl-feature__title" id="bl-feature-title"')}<a href="${href(lead)}">${lead.title}</a>${hClose}
        <p class="bl-feature__excerpt">${cleanExcerpt(lead)}</p>
        <a class="btn btn--primary btn--md" href="${href(lead)}"><span class="btn__label">Читать материал</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 18)}${icon('i-arrow', 18)}</span></a>
      </div>
    </article>

    ${hOpen('class="visually-hidden"')}Материалы блога${hClose}
    <ul class="bl-mosaic" role="list">
      ${mosaic.map(
        (p, i) => html`<li class="bl-mosaic__item ${i === 0 ? 'bl-mosaic__item--wide' : ''}">
          <a class="bl-card" href="${href(p)}">
            <span class="bl-card__media"><img src="${i === 0 ? p.image : p.thumb || p.image}" alt="" width="${i === 0 ? 1200 : 510}" height="${i === 0 ? 675 : 554}" loading="lazy" decoding="async" /></span>
            <span class="bl-num tabular"><b>${num(i + 1)}</b></span>
            <span class="bl-card__title">${p.title}</span>
            <span class="bl-card__excerpt">${cleanExcerpt(p)}</span>
          </a>
        </li>`,
      )}
    </ul>

    ${index.length
      ? html`<section class="bl-index" aria-labelledby="bl-index-title">
          <div class="bl-index__head">${hOpen('class="bl-index__title" id="bl-index-title"')}Все материалы${hClose}<span class="label tabular">${n} ${plural(n, ['материал', 'материала', 'материалов'])}</span></div>
          <ol class="bl-index__list" role="list" id="bl-index-list">
            ${index.map(
              (p, i) => html`<li ${raw(i >= indexLimit ? 'hidden data-bl-folded' : '')}><a class="bl-row" href="${href(p)}">
                <span class="bl-row__num tabular">${num(i + 1 + mosaic.length)}</span>
                <span class="bl-row__text"><span class="bl-row__title">${p.title}</span><span class="bl-row__excerpt">${cleanExcerpt(p)}</span></span>
                <img class="bl-row__thumb" src="${p.thumb || p.image}" alt="" width="255" height="277" loading="lazy" decoding="async" />
                <span class="bl-row__arrow" aria-hidden="true">${icon('i-arrow', 20)}</span>
              </a></li>`,
            )}
          </ol>
          ${folded > 0
            ? html`<div class="ed-more"><button type="button" class="btn btn--secondary btn--lg" aria-controls="bl-index-list" aria-expanded="false" data-bl-unfold><span class="btn__label">Показать ещё ${folded}</span><span class="btn__icon" aria-hidden="true">${icon('i-plus', 18)}</span></button></div>`
            : ''}
        </section>`
      : ''}`);

  const unfold = qs('[data-bl-unfold]', root);
  unfold?.addEventListener('click', () => {
    const rows = root.querySelectorAll('[data-bl-folded]');
    rows.forEach((li) => (li.hidden = false));
    rows[0]?.querySelector('a').focus({ preventScroll: true });
    unfold.closest('.ed-more').remove();
  });
}

export function renderMissing(root, { title, back }) {
  root.innerHTML = `<section class="container ed-missing"><p class="eyebrow">Ошибка 404</p><h1 class="h1">${esc(title)}</h1>
    <a class="btn btn--primary btn--lg" href="${back.href}"><span class="btn__label">${esc(back.all)}</span><span class="btn__icon" aria-hidden="true">${toHTML(icon('i-arrow', 20))}</span></a></section>`;
}
