/**
 * Mega menu: full-width dark surface under the header.
 *  - click / Enter toggles, hover-intent on fine pointers;
 *  - Esc closes and returns focus to the trigger; focus leaving closes;
 *  - catalog preview swaps image + meta on hover/focus of a category.
 */
import { qs, qsa, formatPrice, plural } from '../core/dom.js';
import { env } from '../core/env.js';
import { getCatalog, getNews, getBlog } from '../data/api.js';

const OPEN_DELAY = 90;
const CLOSE_DELAY = 220;

export function initMegaMenu() {
  const header = qs('[data-header]');
  const scrim = qs('[data-mega-scrim]');
  if (!header) return;

  const triggers = qsa('[data-mega-trigger]', header);
  const panels = new Map(qsa('[data-mega-panel]', header).map((p) => [p.dataset.megaPanel, p]));
  let current = null;
  let openTimer;
  let closeTimer;

  const setOpen = (name, { focusFirst = false } = {}) => {
    if (current === name) return;
    const prev = current;
    current = name;

    triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.megaTrigger === name)));
    panels.forEach((panel, key) => {
      if (key === name) {
        if (key === 'about') hydrateAboutPanel(panel);
        // images load on first open only (menus are closed on most visits)
        qsa('img[data-src]', panel).forEach((img) => {
          if (!img.dataset.src) return; // filled from data (about panel)
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        });
        panel.hidden = false;
        // switching menus → no exit/enter flash
        panel.classList.toggle('is-instant', Boolean(prev));
        requestAnimationFrame(() => panel.classList.add('is-open'));
      } else if (!panel.hidden) {
        panel.classList.remove('is-open');
        const hide = () => {
          if (current !== key) panel.hidden = true;
        };
        if (name) hide();
        else setTimeout(hide, 200);
      }
    });

    header.classList.toggle('has-open-menu', Boolean(name));
    if (scrim) {
      if (name) {
        scrim.hidden = false;
        requestAnimationFrame(() => scrim.classList.add('is-on'));
      } else {
        scrim.classList.remove('is-on');
        setTimeout(() => {
          if (!current) scrim.hidden = true;
        }, 220);
      }
    }
    if (name && focusFirst) {
      const first = qs('a, button', panels.get(name));
      first && first.focus();
    }
  };

  const close = (returnFocus = false) => {
    const trigger = triggers.find((t) => t.dataset.megaTrigger === current);
    setOpen(null);
    if (returnFocus && trigger) trigger.focus();
  };

  triggers.forEach((trigger) => {
    const name = trigger.dataset.megaTrigger;
    trigger.addEventListener('click', () => (current === name ? close() : setOpen(name)));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(name, { focusFirst: true });
      }
      // an open panel comes right after its trigger in the Tab order
      if (e.key === 'Tab' && !e.shiftKey && current === name) {
        const first = focusables(panels.get(name))[0];
        if (first) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    trigger.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !env.finePointer) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      openTimer = setTimeout(() => setOpen(name), current ? 0 : OPEN_DELAY);
    });
  });

  header.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(openTimer);
    closeTimer = setTimeout(() => close(), CLOSE_DELAY);
  });
  header.addEventListener('pointerenter', () => clearTimeout(closeTimer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && current) close(true);
  });
  scrim && scrim.addEventListener('click', () => close());
  header.addEventListener('focusout', (e) => {
    if (current && e.relatedTarget && !header.contains(e.relatedTarget)) close();
  });
  panels.forEach((panel) =>
    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) close();
    }),
  );
  // Tab out of a panel continues with the header item after its trigger; Shift+Tab goes back to the trigger
  panels.forEach((panel, key) =>
    panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables(panel);
      const trigger = triggers.find((t) => t.dataset.megaTrigger === key);
      if (e.shiftKey && document.activeElement === items[0]) {
        e.preventDefault();
        trigger.focus();
      } else if (!e.shiftKey && document.activeElement === items[items.length - 1]) {
        e.preventDefault();
        const bar = focusables(header).filter((el) => !el.closest('[data-mega-panel]'));
        const next = bar[bar.indexOf(trigger) + 1];
        close();
        (next || trigger).focus();
      }
    }),
  );

  hydrateCatalogPanel(panels.get('catalog'));
}

const focusables = (root) => qsa('a[href], button:not([disabled]), input', root).filter((el) => el.offsetParent !== null);

/** «О компании» panel: latest real news / blog material, loaded on first open. */
let aboutHydrated = false;
async function hydrateAboutPanel(panel) {
  if (aboutHydrated) return;
  aboutHydrated = true;
  try {
    const [news, blog] = await Promise.all([getNews(), getBlog()]);
    const fill = (key, list, label) => {
      const img = qs(`[data-about-img="${key}"]`, panel);
      const meta = qs(`[data-about-meta="${key}"]`, panel);
      const first = list[0];
      if (!first) return;
      img.src = first.image || first.thumb;
      img.removeAttribute('data-src');
      meta.textContent = `${list.length} ${plural(list.length, label)}${first.date ? ` · последняя ${first.date}` : ''}`;
    };
    fill('news', news, ['публикация', 'публикации', 'публикаций']);
    fill('blog', blog, ['материал', 'материала', 'материалов']);
  } catch {
    aboutHydrated = false;
  }
}

/** Counts + live preview from real catalog data. */
async function hydrateCatalogPanel(panel) {
  if (!panel) return;
  let catalog;
  try {
    catalog = await getCatalog();
  } catch {
    return;
  }

  qsa('[data-cat-count]', document).forEach((el) => {
    const cat = catalog.categories.get(el.dataset.catCount);
    if (cat) el.textContent = cat.count;
  });
  qsa('[data-group-count]', panel).forEach((el) => {
    const n = catalog.groups[el.dataset.groupCount].reduce((s, c) => s + c.count, 0);
    el.textContent = `${n} ${plural(n, ['позиция', 'позиции', 'позиций'])}`;
  });

  const preview = qs('[data-mega-preview]', panel);
  if (!preview) return;
  const img = qs('[data-preview-img]', preview);
  const title = qs('[data-preview-title]', preview);
  const group = qs('[data-preview-group]', preview);
  const meta = qs('[data-preview-meta]', preview);
  const links = qsa('[data-preview]', panel);

  const show = (slug) => {
    const cat = catalog.categories.get(slug);
    if (!cat) return;
    links.forEach((l) => l.classList.toggle('is-current', l.dataset.preview === slug));
    const cover = catalog.byId.get(cat.products[0]);
    title.textContent = cat.title;
    group.textContent = cat.group === 'equipment' ? 'Оборудование' : 'Расходные материалы';
    meta.textContent = `${cat.count} ${plural(cat.count, ['товар', 'товара', 'товаров'])}${cat.minPrice ? ` · от ${formatPrice(cat.minPrice)}` : ''}`;
    if (img.hasAttribute('data-src')) img.dataset.src = cover ? cover.image : img.dataset.src;
    else if (cover && img.getAttribute('src') !== cover.image) {
      preview.classList.add('is-swapping');
      const next = new Image();
      next.onload = () => {
        img.src = cover.image;
        preview.classList.remove('is-swapping');
      };
      next.src = cover.image;
    }
  };

  links.forEach((link) => {
    link.addEventListener('pointerenter', () => show(link.dataset.preview));
    link.addEventListener('focus', () => show(link.dataset.preview));
  });
  show('konfetti-masiny');
}
