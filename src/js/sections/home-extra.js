/**
 * Remaining home scenes, all fed by real data:
 *  catalog index (with cursor-following preview), flagship rail,
 *  projects (clients + drifting photo rows), video, news.
 */
import { qs, qsa, html, toHTML, esc, icon, formatPrice, plural, rafThrottle } from '../core/dom.js';
import { env } from '../core/env.js';
import { scene } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getCatalog, getGallery, getNews } from '../data/api.js';
import { clients, flagship } from '../data/content.js';
import { productCard } from '../components/product-card.js';
import { ytFacade, initYouTube } from '../components/youtube.js';
import { initRail } from '../components/rail.js';

/* ------------------------------------------------------- catalog index */
export async function initCatalogIndex() {
  const root = qs('[data-catalog-index]');
  if (!root) return;
  const catalog = await getCatalog();

  const col = (group, title) => {
    const cats = catalog.groups[group];
    const total = cats.reduce((s, c) => s + c.count, 0);
    return html`<section class="cindex__col" aria-labelledby="ci-${group}">
      <header class="cindex__head">
        <h3 class="cindex__group" id="ci-${group}">${title}</h3>
        <span class="label tabular">${total} ${plural(total, ['позиция', 'позиции', 'позиций'])}</span>
      </header>
      <ol class="cindex__list" role="list">
        ${cats.map((c, i) => {
          const cover = catalog.byId.get(c.products[0]);
          return html`<li>
            <a class="crow" href="${routes.category(c.slug)}" data-cover="${cover ? cover.image : ''}">
              <span class="crow__num tabular">${String(i + 1).padStart(2, '0')}</span>
              ${cover ? html`<img class="crow__thumb" src="${cover.thumb}" alt="" width="350" height="388" loading="lazy" />` : ''}
              <span class="crow__name">${c.title}</span>
              <span class="crow__meta tabular">${c.count}<span class="crow__from">${c.minPrice ? ` · от ${formatPrice(c.minPrice)}` : ''}</span></span>
              <span class="crow__arrow" aria-hidden="true">${icon('i-arrow', 20)}</span>
            </a>
          </li>`;
        })}
      </ol>
    </section>`;
  };

  qs('[data-cindex-cols]', root).innerHTML =
    toHTML(col('equipment', 'Оборудование')) + toHTML(col('consumables', 'Расходные материалы'));

  // Cursor-following preview (fine pointers only; transform-only)
  if (!env.finePointer) return;
  const preview = document.createElement('div');
  preview.className = 'cindex__preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.innerHTML = '<img alt="" width="570" height="500">';
  root.append(preview);
  const img = preview.querySelector('img');
  const bounds = { x: 0, y: 0 };
  const move = rafThrottle((x, y) => {
    preview.style.transform = `translate3d(${x - bounds.x}px, ${y - bounds.y}px, 0)`;
  });
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    bounds.x = r.left;
    bounds.y = r.top;
    move(e.clientX, e.clientY);
  });
  qsa('.crow', root).forEach((row) => {
    row.addEventListener('pointerenter', () => {
      if (!row.dataset.cover) return;
      if (img.getAttribute('src') !== row.dataset.cover) img.src = row.dataset.cover;
      preview.classList.add('is-on');
    });
    row.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
  });
}

/* --------------------------------------------------------- flagship rail */
export async function initFlagship() {
  const root = qs('[data-flagship]');
  if (!root) return;
  const catalog = await getCatalog();
  const list = qs('[data-rail-track]', root);
  list.innerHTML = catalog
    .pick(flagship)
    .map((p) => `<li class="rail-item">${toHTML(productCard(p, { variant: 'rail' }))}</li>`)
    .join('');
  initRail(root);
}

/* -------------------------------------------------------------- projects */
export async function initProjects() {
  const root = qs('[data-projects]');
  if (!root) return;

  qs('[data-clients]', root).innerHTML = clients.map((c) => `<li>${c}</li>`).join('');

  const gallery = await getGallery();
  const by = Object.fromEntries(gallery.map((g) => [g.slug, g]));
  const pick = (slug, idx) => idx.map((i) => by[slug] && by[slug].photos[i] && { ...by[slug].photos[i], cat: by[slug].title, slug }).filter(Boolean);
  const rowA = [...pick('konfetti', [1, 3, 5, 8]), ...pick('krioeffekty', [2, 5, 7]), ...pick('iskusstvennyj-sneg', [19])];
  const rowB = [...pick('krioeffekty', [3, 12]), ...pick('konfetti', [9, 15, 12]), ...pick('tazelyj-dym', [0]), ...pick('iskusstvennyj-sneg', [21, 5])];

  const tile = (ph) =>
    `<li class="drift__item"><a class="drift__link" href="${esc(routes.gallery(ph.slug))}" aria-label="Галерея: ${esc(ph.cat)}">
      <img src="${esc(ph.thumb)}" srcset="${esc(ph.thumb)} 520w, ${esc(ph.src)} ${Number(ph.w)}w" sizes="${Math.round((ph.w / ph.h) * 360)}px"
        alt="" width="${Math.round((ph.w / ph.h) * 360)}" height="360" loading="lazy" decoding="async">
      <span class="drift__cap">${esc(ph.cat)}</span></a></li>`;
  qs('[data-drift-a]', root).innerHTML = rowA.map(tile).join('');
  qs('[data-drift-b]', root).innerHTML = rowB.map(tile).join('');

  if (!env.reducedMotion) scene(qs('[data-drift]', root), { mode: 'through' });
}

/* ------------------------------------------------------------------ video */
export async function initVideos() {
  const root = qs('[data-videos]');
  if (!root) return;
  const gallery = await getGallery();
  const find = (slug, id) => {
    const g = gallery.find((x) => x.slug === slug);
    const v = g && g.videos.find((x) => x.id === id);
    return v ? { ...v, cat: g.title } : null;
  };
  const list = [
    find('krioeffekty', 'AXmYWZ8KnxI'),
    find('konfetti', '5nHXXnFxWug'),
    find('imitacia-plameni', 'vapbhhGwmtU'),
  ].filter(Boolean);
  qs('[data-video-grid]', root).innerHTML = list
    .map((v, i) => `<li class="vgrid__item ${i === 0 ? 'vgrid__item--lead' : ''}">${ytFacade(v.id, { thumb: v.thumb, title: `${v.cat} — видео GLOBAL EFFECTS`, label: v.cat })}</li>`)
    .join('');
  initYouTube(root);
}

/* ------------------------------------------------------------------- news */
export async function initNews() {
  const root = qs('[data-news]');
  if (!root) return;
  const news = await getNews();
  const [lead, ...rest] = news;
  qs('[data-news-list]', root).innerHTML =
    toHTML(html`<article class="news-lead">
      <a class="news-lead__link" href="${routes.news(lead.url)}">
        <span class="news-lead__media"><img src="${lead.image}" alt="" loading="lazy" decoding="async" width="1200" height="675" /></span>
        <span class="news-lead__body">
          <time class="news__date tabular" datetime="${lead.date.split('.').reverse().join('-')}">${lead.date}</time>
          <span class="news-lead__title">${lead.title}</span>
          <span class="news__more">Читать ${icon('i-arrow', 18)}</span>
        </span>
      </a>
    </article>`) +
    `<ol class="news-list" role="list">${rest
      .slice(0, 4)
      .map((n) =>
        toHTML(html`<li><a class="news-item" href="${routes.news(n.url)}">
          <time class="news__date tabular" datetime="${n.date.split('.').reverse().join('-')}">${n.date}</time>
          <span class="news-item__title">${n.title}</span>
          <img class="news-item__thumb" src="${n.thumb}" alt="" width="255" height="255" loading="lazy" />
          <span class="news-item__arrow" aria-hidden="true">${icon('i-arrow-up-right', 20)}</span>
        </a></li>`),
      )
      .join('')}</ol>`;
}
