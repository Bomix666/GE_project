/**
 * Remaining home scenes, all fed by real data:
 *  catalog index (with cursor-following preview), flagship rail,
 *  projects (clients, a drifting photo row, video).
 */
import { qs, qsa, html, toHTML, esc, icon, formatPrice, plural, rafThrottle } from '../core/dom.js';
import { env } from '../core/env.js';
import { scene } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getCatalog, getGallery } from '../data/api.js';
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
            <a class="crow" href="${routes.category(c.slug)}" data-cover="${cover ? cover.thumb : ''}">
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

  // Cursor-following preview (fine pointers only; transform-only).
  // It shows the 350×388 card photo — the file the catalog lists already use, so it is
  // warm on the CMS — and only once the file is in the browser: no empty box while a
  // photo loads, and none at all when it cannot load.
  if (!env.finePointer) return;
  const preview = document.createElement('div');
  preview.className = 'cindex__preview';
  preview.setAttribute('aria-hidden', 'true');
  preview.innerHTML = '<img alt="" width="350" height="388" decoding="async">';
  root.append(preview);
  const img = preview.querySelector('img');
  const GAP = 32; // pointer → preview
  const bounds = { x: 0, y: 0 };
  const move = rafThrottle((x, y) => {
    // beside the pointer, flipped to its left near the right edge of the window
    const flip = x + GAP + preview.offsetWidth > document.documentElement.clientWidth - 16;
    const dx = flip ? -(GAP + preview.offsetWidth) : GAP;
    preview.style.transform = `translate3d(${x - bounds.x + dx}px, ${y - bounds.y}px, 0)`;
  });
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    bounds.x = r.left;
    bounds.y = r.top;
    move(e.clientX, e.clientY);
  });

  const loads = new Map(); // src → Promise<boolean>
  const load = (src) => {
    if (!loads.has(src)) {
      loads.set(
        src,
        new Promise((resolve) => {
          const probe = new Image();
          probe.onload = () => resolve(true);
          probe.onerror = () => {
            loads.delete(src); // a failed file is tried again on the next hover
            resolve(false);
          };
          probe.src = src;
        }),
      );
    }
    return loads.get(src);
  };

  // Warm every cover just before the block scrolls into view
  const warm = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      warm.disconnect();
      qsa('.crow[data-cover]', root).forEach((row) => row.dataset.cover && load(row.dataset.cover));
    },
    { rootMargin: '600px 0px' },
  );
  warm.observe(root);

  let current = null;
  qsa('.crow', root).forEach((row) => {
    row.addEventListener('pointerenter', async () => {
      current = row;
      const src = row.dataset.cover;
      const ok = src ? await load(src) : false;
      if (current !== row) return; // the pointer has moved on while it loaded
      if (!ok) return preview.classList.remove('is-on');
      if (img.getAttribute('src') !== src) {
        img.src = src;
        await img.decode().catch(() => {}); // never fade in on the previous row's photo
        if (current !== row) return;
      }
      preview.classList.add('is-on');
    });
    row.addEventListener('pointerleave', () => {
      if (current === row) current = null;
      preview.classList.remove('is-on');
    });
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
  const row = [...pick('konfetti', [1, 3, 5, 8]), ...pick('krioeffekty', [2, 5, 7]), ...pick('iskusstvennyj-sneg', [19])];

  const tile = (ph) =>
    `<li class="drift__item"><a class="drift__link" href="${esc(routes.gallery(ph.slug))}" aria-label="Галерея: ${esc(ph.cat)}">
      <img src="${esc(ph.thumb)}" srcset="${esc(ph.thumb)} 520w, ${esc(ph.src)} ${Number(ph.w)}w" sizes="${Math.round((ph.w / ph.h) * 360)}px"
        alt="" width="${Math.round((ph.w / ph.h) * 360)}" height="360" loading="lazy" decoding="async">
      <span class="drift__cap">${esc(ph.cat)}</span></a></li>`;
  qs('[data-drift-row]', root).innerHTML = row.map(tile).join('');

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
    .map((v) => `<li>${ytFacade(v.id, { thumb: v.thumb, title: `${v.cat} — видео GLOBAL EFFECTS`, label: v.cat })}</li>`)
    .join('');
  initYouTube(root);
}
