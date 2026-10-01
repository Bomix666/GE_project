/**
 * Category listing — presentation over the real catalog data.
 * State lives in the URL (?c=…&color=Красный,Белый&stock=1&sort=price-asc)
 * so filters survive reloads, back/forward and sharing.
 * Production: the Yii category view renders the same markup; this module
 * only enhances filtering/sorting client-side (no endpoint changes).
 */
import { ready } from '../app.js';
import { qs, qsa, toHTML, esc, icon, formatPrice, plural, normalize, params, announce } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getCatalog, GROUP_TITLES, specValue } from '../data/api.js';
import { facetKeys, swatches } from '../data/content.js';
import { productCard, productSkeleton } from '../components/product-card.js';
import { createDialog } from '../components/dialog.js';
import { initRail } from '../components/rail.js';
import { fitHeading } from '../core/fit.js';

const PAGE = 24;
const keyToParam = facetKeys;
const paramToKey = Object.fromEntries(Object.entries(facetKeys).map(([k, v]) => [v, k]));

let catalog;
let state;
let limit = PAGE;
let base = [];
let facets = [];
let sheet;
let chips;

ready(async () => {
  const grid = qs('[data-grid]');
  grid.innerHTML = toHTML(productSkeleton(8));
  try {
    catalog = await getCatalog();
  } catch (e) {
    grid.innerHTML = `<div class="empty"><p class="h3">Каталог временно недоступен</p><p class="text-2">Обновите страницу или позвоните нам: <a href="tel:+74996505078">+7 (499) 650-50-78</a>.</p></div>`;
    grid.removeAttribute('aria-busy');
    return;
  }
  state = readState();
  setupPage();
  render();
  bind();
  window.addEventListener('popstate', () => {
    state = readState();
    setupPage();
    render();
  });
});

/* ------------------------------------------------------------ state */
function readState() {
  const p = params();
  const slug = p.get('c');
  const q = (p.get('q') || '').trim();
  const f = {};
  Object.keys(paramToKey).forEach((param) => {
    const v = p.get(param);
    if (v) f[paramToKey[param]] = v.split(',').filter(Boolean);
  });
  return {
    slug: slug && catalog.categories.has(slug) ? slug : q ? null : 'konfetti-masiny',
    q,
    f,
    stock: p.get('stock') === '1',
    sort: p.get('sort') || 'default',
  };
}

function writeState(push = false) {
  const p = new URLSearchParams();
  if (state.slug) p.set('c', state.slug);
  if (state.q) p.set('q', state.q);
  Object.entries(state.f).forEach(([k, vals]) => vals.length && p.set(keyToParam[k], vals.join(',')));
  if (state.stock) p.set('stock', '1');
  if (state.sort !== 'default') p.set('sort', state.sort);
  const url = `${location.pathname}?${p}`;
  history[push ? 'pushState' : 'replaceState'](null, '', url);
}

/* ------------------------------------------------------------ setup */
function setupPage() {
  limit = PAGE;
  const cat = state.slug ? catalog.categories.get(state.slug) : null;

  if (cat) {
    base = catalog.productsIn(cat.slug);
    facets = cat.filters;
    document.title = `${cat.title} — купить в каталоге GLOBAL EFFECTS`;
    qs('[data-cat-title]').textContent = cat.title;
    qs('[data-cat-group]').textContent = GROUP_TITLES[cat.group];
    qs('[data-cat-meta]').textContent = `${cat.count} ${plural(cat.count, ['товар', 'товара', 'товаров'])}${cat.minPrice ? ` · от ${formatPrice(cat.minPrice)}` : ''}`;
    qs('[data-crumbs]').innerHTML = `<li><a href="/">Главная</a></li><li><span>${GROUP_TITLES[cat.group]}</span></li><li><span aria-current="page">${esc(cat.title)}</span></li>`;
    qs('[data-cat-search]').hidden = true;
    const cover = base[0];
    qs('[data-cat-media]').innerHTML = cover
      ? `<img src="${esc(cover.image)}" alt="" width="570" height="500" fetchpriority="high"><span class="cat-hero__glow"></span>`
      : '';
    const siblings = catalog.groups[cat.group];
    qs('[data-chipscroll]').hidden = false;
    qs('[data-cat-siblings]').innerHTML = siblings
      .map(
        (s) =>
          `<li><a class="chip ${s.slug === cat.slug ? 'is-active' : ''}" href="${routes.category(s.slug)}" ${s.slug === cat.slug ? 'aria-current="page"' : ''}>${esc(s.title)} <span>${s.count}</span></a></li>`,
      )
      .join('');
    mountChips();
    applyRouteClicks();
  } else {
    // prototype-only search results (production keeps /search/results)
    const words = normalize(state.q).split(' ').filter(Boolean);
    base = catalog.products.filter((p) => {
      const hay = normalize(`${p.name} ${p.type} ${(catalog.categories.get(p.category) || {}).title || ''}`);
      return words.every((w) => hay.includes(w));
    });
    facets = [];
    document.title = `Поиск: ${state.q} — GLOBAL EFFECTS`;
    qs('[data-cat-title]').textContent = 'Поиск';
    qs('[data-cat-group]').textContent = `Запрос «${state.q}»`;
    qs('[data-cat-meta]').textContent = `${base.length} ${plural(base.length, ['результат', 'результата', 'результатов'])}`;
    qs('[data-crumbs]').innerHTML = `<li><a href="/">Главная</a></li><li><span aria-current="page">Поиск</span></li>`;
    const form = qs('[data-cat-search]');
    form.hidden = false;
    qs('input', form).value = state.q;
    qs('[data-cat-media]').innerHTML = '';
    qs('[data-cat-siblings]').innerHTML = '';
    qs('[data-chipscroll]').hidden = true;
  }
  fitHeading(qs('[data-cat-title]'));
}

/* Category chips: scrollable row with arrows; the current category is
   always scrolled into view (it may be the 9th of 10). */
function mountChips() {
  const nav = qs('[data-chipscroll]');
  const track = qs('[data-cat-siblings]');
  chips ||= initRail(nav, { step: 'view' });
  const active = qs('.chip.is-active', track);
  if (active) {
    const left = active.parentElement.offsetLeft - (track.clientWidth - active.offsetWidth) / 2;
    track.style.scrollBehavior = 'auto'; // jump on load; arrows keep smooth scrolling
    track.scrollLeft = Math.max(0, left);
    track.style.scrollBehavior = '';
  }
  chips.update();
}

/* Category chips change the category but keep the page (no full reload) */
function applyRouteClicks() {
  qsa('[data-cat-siblings] a').forEach((a) =>
    a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname) return;
      e.preventDefault();
      state = { slug: url.searchParams.get('c'), q: '', f: {}, stock: false, sort: state.sort };
      writeState(true);
      setupPage();
      render();
      qs('#cat-title').scrollIntoView({ block: 'start' });
    }),
  );
}

/* ----------------------------------------------------------- filtering */
function matches(p, except) {
  if (state.stock && except !== '__stock' && p.availability !== 'in_stock') return false;
  for (const [key, vals] of Object.entries(state.f)) {
    if (key === except || !vals.length) continue;
    if (!vals.includes(specValue(p, key))) return false;
  }
  return true;
}

function sorted(list) {
  const out = [...list];
  const price = (p) => (p.price == null ? Infinity : p.price);
  if (state.sort === 'price-asc') out.sort((a, b) => price(a) - price(b));
  if (state.sort === 'price-desc') out.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
  if (state.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return out;
}

function render() {
  const results = sorted(base.filter((p) => matches(p)));
  renderFilters();
  renderChips();
  renderGrid(results);
  qs('[data-sort]').value = state.sort;
}

function renderGrid(results) {
  const grid = qs('[data-grid]');
  const count = qs('[data-count]');
  const cat = state.slug ? catalog.categories.get(state.slug) : null;
  count.textContent = `${results.length} ${plural(results.length, ['товар', 'товара', 'товаров'])}`;
  grid.removeAttribute('aria-busy');

  if (!results.length) {
    grid.innerHTML = `<div class="empty">
      <p class="h3">Ничего не нашлось</p>
      <p class="text-2">${state.q && !cat ? 'Попробуйте другое название или откройте раздел каталога.' : 'Под выбранные фильтры товаров нет. Снимите часть фильтров.'}</p>
      ${hasActive() ? '<button type="button" class="btn btn--secondary btn--md" data-reset><span class="btn__label">Сбросить фильтры</span></button>' : ''}
    </div>`;
    qs('[data-more-wrap]').hidden = true;
    return;
  }

  const shown = results.slice(0, limit);
  grid.innerHTML = shown.map((p, i) => toHTML(productCard(p, { categoryTitle: cat ? cat.title : '', eager: i < 4 }))).join('');
  const more = qs('[data-more-wrap]');
  more.hidden = results.length <= limit;
  qs('[data-shown]').textContent = `Показано ${shown.length} из ${results.length}`;
  qs('[data-shown-bar]').style.transform = `scaleX(${shown.length / results.length})`;
  reveal(grid);
}

const hasActive = () => state.stock || Object.values(state.f).some((v) => v.length);

function renderChips() {
  const wrap = qs('[data-active-chips]');
  const chips = [];
  Object.entries(state.f).forEach(([key, vals]) =>
    vals.forEach((v) =>
      chips.push(`<button type="button" class="chip is-active" data-remove-facet="${esc(key)}" data-value="${esc(v)}" aria-label="Убрать фильтр ${esc(v)}">${esc(v)} ${toHTML(icon('i-close', 14))}</button>`),
    ),
  );
  if (state.stock) chips.push(`<button type="button" class="chip is-active" data-remove-stock aria-label="Убрать фильтр: только в наличии">В наличии ${toHTML(icon('i-close', 14))}</button>`);
  if (chips.length > 1) chips.push('<button type="button" class="chip chip--reset" data-reset>Сбросить всё</button>');
  wrap.innerHTML = chips.join('');
  const n = Object.values(state.f).reduce((s, v) => s + v.length, 0) + (state.stock ? 1 : 0);
  qs('[data-filters-badge]').textContent = n ? `· ${n}` : '';
}

function renderFilters() {
  const root = qs('[data-filters]');
  const cat = state.slug ? catalog.categories.get(state.slug) : null;
  const groups = [];

  // Category tree (links, deep-linkable)
  const tree = ['equipment', 'consumables']
    .map(
      (g) => `<div class="ftree__group"><p class="ftree__title">${GROUP_TITLES[g]}</p><ul role="list">${catalog.groups[g]
        .map(
          (c) =>
            `<li><a class="ftree__link ${cat && c.slug === cat.slug ? 'is-current' : ''}" href="${routes.category(c.slug)}" ${cat && c.slug === cat.slug ? 'aria-current="page"' : ''}><span>${esc(c.title)}</span><em class="tabular">${c.count}</em></a></li>`,
        )
        .join('')}</ul></div>`,
    )
    .join('');
  groups.push(fgroup('Категория', `<nav class="ftree" aria-label="Категории каталога">${tree}</nav>`, { open: !cat || facets.length === 0, id: 'f-cat' }));

  // Availability
  const inStock = base.filter((p) => matches(p, '__stock') && p.availability === 'in_stock').length;
  groups.push(
    fgroup(
      'Наличие',
      `<label class="check"><input type="checkbox" data-stock ${state.stock ? 'checked' : ''}><span class="check__box" aria-hidden="true"></span><span class="check__label">Только в наличии</span><em class="tabular">${inStock}</em></label>`,
      { open: true, id: 'f-stock' },
    ),
  );

  // Real spec facets
  facets.forEach((facet, fi) => {
    const selected = state.f[facet.key] || [];
    const options = facet.options.map((o) => ({
      ...o,
      live: base.filter((p) => matches(p, facet.key) && specValue(p, facet.key) === o.value).length,
    }));
    const isColor = facet.key === 'Цвет';
    const visible = 8;
    const body = `<ul class="fopts ${isColor ? 'fopts--color' : ''}" role="list">${options
      .map((o, i) => {
        const id = `f-${fi}-${i}`;
        const checked = selected.includes(o.value);
        const disabled = !o.live && !checked;
        return `<li ${i >= visible ? 'data-extra hidden' : ''}><label class="check ${disabled ? 'is-disabled' : ''}" for="${id}">
          <input type="checkbox" id="${id}" data-facet="${esc(facet.key)}" value="${esc(o.value)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
          <span class="check__box" aria-hidden="true"></span>
          ${isColor ? `<span class="swatch" style="background:${swatches[o.value] || 'var(--surface-4)'}" aria-hidden="true"></span>` : ''}
          <span class="check__label">${esc(o.value)}</span><em class="tabular">${o.live}</em>
        </label></li>`;
      })
      .join('')}</ul>${options.length > visible ? `<button type="button" class="fmore" data-fmore aria-expanded="false">Показать ещё ${options.length - visible}</button>` : ''}`;
    groups.push(fgroup(facet.label, body, { open: true, id: `f-${fi}`, count: selected.length }));
  });

  root.innerHTML = `<div class="filters__head"><p class="filters__title">Фильтры</p>${hasActive() ? '<button type="button" class="filters__reset" data-reset>Сбросить</button>' : ''}</div>${groups.join('')}`;
}

function fgroup(title, body, { open = true, id, count = 0 } = {}) {
  return `<details class="fgroup" ${open ? 'open' : ''} id="${id}">
    <summary class="fgroup__sum"><span>${esc(title)}${count ? ` <b class="tabular">${count}</b>` : ''}</span>${toHTML(icon('i-chevron-down', 18))}</summary>
    <div class="fgroup__body">${body}</div>
  </details>`;
}

/* ------------------------------------------------------------- events */
function bind() {
  const filters = qs('[data-filters]');

  filters.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('[data-facet]')) {
      const key = t.dataset.facet;
      const vals = new Set(state.f[key] || []);
      if (t.checked) vals.add(t.value);
      else vals.delete(t.value);
      state.f[key] = [...vals];
    } else if (t.matches('[data-stock]')) {
      state.stock = t.checked;
    } else return;
    const focusId = t.id;
    update();
    // keep keyboard position after re-render
    if (focusId) document.getElementById(focusId)?.focus();
    else qs('[data-stock]', filters)?.focus();
  });

  filters.addEventListener('click', (e) => {
    const more = e.target.closest('[data-fmore]');
    if (more) {
      const open = more.getAttribute('aria-expanded') === 'true';
      qsa('[data-extra]', more.parentElement).forEach((li) => (li.hidden = open));
      more.setAttribute('aria-expanded', String(!open));
      more.textContent = open ? more.textContent.replace('Скрыть', 'Показать ещё') : 'Скрыть';
    }
  });

  document.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove-facet]');
    if (rm) {
      const k = rm.dataset.removeFacet;
      state.f[k] = (state.f[k] || []).filter((v) => v !== rm.dataset.value);
      update();
      return;
    }
    if (e.target.closest('[data-remove-stock]')) {
      state.stock = false;
      update();
      return;
    }
    if (e.target.closest('[data-reset]')) {
      state.f = {};
      state.stock = false;
      update();
      announce('Фильтры сброшены');
      return;
    }
    if (e.target.closest('[data-more]')) {
      const before = limit;
      limit += PAGE;
      const results = sorted(base.filter((p) => matches(p)));
      renderGrid(results);
      // move focus to the first newly shown card for keyboard users
      const next = qsa('[data-grid] .pcard__link')[before];
      if (next) next.focus({ preventScroll: true });
      announce(`Показано ${Math.min(limit, results.length)} из ${results.length}`);
    }
  });

  qs('[data-sort]').addEventListener('change', (e) => {
    state.sort = e.target.value;
    update();
  });

  qs('[data-cat-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    state.q = qs('#cat-q').value.trim();
    writeState(true);
    setupPage();
    render();
  });

  // Mobile: filters move into a bottom sheet dialog
  qs('[data-filters-open]').addEventListener('click', (e) => openSheet(e.currentTarget));
}

function update() {
  limit = PAGE;
  writeState();
  render();
  const n = base.filter((p) => matches(p)).length;
  announce(`Найдено ${n} ${plural(n, ['товар', 'товара', 'товаров'])}`);
  if (sheet) qs('[data-sheet-apply]', sheet.el).textContent = `Показать ${n} ${plural(n, ['товар', 'товара', 'товаров'])}`;
}

function openSheet(trigger) {
  const filters = qs('[data-filters]');
  const home = qs('[data-filters-home]');
  if (!sheet) {
    sheet = createDialog({
      className: 'dlg--sheet',
      label: 'Фильтры',
      onClose: () => home.append(qs('[data-filters]')),
    });
    sheet.setContent(`<div class="sheet">
      <div class="sheet__head"><p class="h3">Фильтры</p><button type="button" class="icon-btn" data-dialog-close aria-label="Закрыть фильтры">${toHTML(icon('i-close', 22))}</button></div>
      <div class="sheet__body" data-sheet-body></div>
      <div class="sheet__foot"><button type="button" class="btn btn--primary btn--lg btn--block" data-dialog-close><span class="btn__label" data-sheet-apply>Показать</span></button></div>
    </div>`);
  }
  qs('[data-sheet-body]', sheet.el).append(filters);
  const n = base.filter((p) => matches(p)).length;
  qs('[data-sheet-apply]', sheet.el).textContent = `Показать ${n} ${plural(n, ['товар', 'товара', 'товаров'])}`;
  sheet.show(trigger);
}
