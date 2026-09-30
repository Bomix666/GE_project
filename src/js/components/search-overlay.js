/**
 * Command-style search overlay (combobox + listbox pattern).
 * Opens with the header button, "/" or Ctrl/⌘+K. Arrow keys move through
 * results, Enter opens, Esc closes. Loaded lazily on first open.
 */
import { esc, formatPrice, plural, debounce } from '../core/dom.js';
import { routes } from '../core/routes.js';
import { createDialog } from './dialog.js';
import { search, recent, remember, buildIndex } from '../services/search.js';

let dialog;
let els;
let active = -1;
let lastQuery = '';

export function openSearch(trigger, initial = '') {
  if (!dialog) setup();
  buildIndex();
  dialog.show(trigger);
  els.input.value = initial;
  els.input.focus();
  update(initial);
}

function setup() {
  dialog = createDialog({ className: 'dlg--search dlg--fullbleed', label: 'Поиск по сайту' });
  dialog.setContent(`
    <div class="search">
      <div class="search__bar container">
        <form class="search__form" role="search" data-search-form>
          <svg class="search__icon" width="28" height="28" aria-hidden="true"><use href="#i-search"/></svg>
          <label class="visually-hidden" for="search-input">Поиск по каталогу, эффектам и новостям</label>
          <input class="search__input" id="search-input" type="search" autocomplete="off" spellcheck="false"
            placeholder="Конфетти-машина, криопушка, снег…" role="combobox" aria-expanded="false"
            aria-controls="search-list" aria-autocomplete="list" enterkeyhint="search">
          <button type="button" class="search__close" data-dialog-close><span>Esc</span><span class="visually-hidden">Закрыть поиск</span></button>
        </form>
      </div>
      <div class="search__results container" data-search-results></div>
      <p class="search__hint container text-3" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> выбор · <kbd>Enter</kbd> открыть · <kbd>Esc</kbd> закрыть</p>
      <p class="visually-hidden" role="status" aria-live="polite" data-search-status></p>
    </div>`);

  els = {
    form: dialog.el.querySelector('[data-search-form]'),
    input: dialog.el.querySelector('#search-input'),
    results: dialog.el.querySelector('[data-search-results]'),
    status: dialog.el.querySelector('[data-search-status]'),
  };

  const run = debounce((v) => update(v), 90);
  els.input.addEventListener('input', () => run(els.input.value));
  els.input.addEventListener('keydown', onKey);
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const opt = options()[active];
    if (opt) opt.click();
    else submitFull(els.input.value);
  });
  els.results.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-query]');
    if (chip) {
      els.input.value = chip.dataset.query;
      els.input.focus();
      update(chip.dataset.query);
      return;
    }
    const full = e.target.closest('[data-search-all]');
    if (full) submitFull(els.input.value);
    if (e.target.closest('a')) remember(els.input.value);
  });
}

const options = () => Array.from(els.results.querySelectorAll('[role="option"]'));

function setActive(i) {
  const list = options();
  active = list.length ? (i + list.length) % list.length : -1;
  list.forEach((o, k) => o.setAttribute('aria-selected', String(k === active)));
  const cur = list[active];
  if (cur) {
    els.input.setAttribute('aria-activedescendant', cur.id);
    cur.scrollIntoView({ block: 'nearest' });
  } else els.input.removeAttribute('aria-activedescendant');
}

function onKey(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setActive(active + 1);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setActive(active - 1);
  }
}

async function update(value) {
  lastQuery = value;
  active = -1;
  els.input.removeAttribute('aria-activedescendant');
  const q = value.trim();

  if (!q) {
    const rec = recent();
    els.input.setAttribute('aria-expanded', 'false');
    els.results.innerHTML = `
      ${rec.length ? `<section class="sgroup"><h3 class="sgroup__title">Недавние запросы</h3><div class="chips">${rec
        .map((r) => `<button type="button" class="chip" data-query="${esc(r)}">${esc(r)}</button>`)
        .join('')}</div></section>` : ''}
      <section class="sgroup">
        <h3 class="sgroup__title">Разделы каталога</h3>
        <div class="chips">
          ${[
            ['konfetti-masiny', 'Конфетти-машины'],
            ['krioeffekty-2', 'Криоэффекты'],
            ['tazelyj-dym', 'Тяжелый дым'],
            ['pena-2', 'Пена'],
            ['imitacia-plameni-2', 'Имитация пламени'],
            ['konfetti', 'Конфетти'],
            ['serpantin', 'Серпантин'],
            ['iskusstvennyj-sneg', 'Искусственный снег'],
          ]
            .map(([s, t]) => `<a class="chip" href="${routes.category(s)}">${t}</a>`)
            .join('')}
        </div>
      </section>`;
    els.status.textContent = '';
    return;
  }

  const res = await search(q);
  if (value !== lastQuery) return; // stale
  els.input.setAttribute('aria-expanded', 'true');

  if (!res.total && !res.categories.length && !res.news.length) {
    els.results.innerHTML = `<div class="search__empty">
        <p class="h3">По запросу «${esc(q)}» ничего не нашлось</p>
        <p class="text-2">Проверьте написание или попробуйте искать по названию эффекта: «конфетти», «криопушка», «снег».</p>
        <button type="button" class="btn btn--secondary btn--md" data-search-all><span class="btn__label">Искать по всему сайту</span><span class="btn__icon" aria-hidden="true"><svg width="18" height="18"><use href="#i-arrow"/></svg></span></button>
      </div>`;
    els.status.textContent = 'Ничего не найдено';
    return;
  }

  let n = 0;
  const opt = (inner, href, cls = '') => `<a class="sopt ${cls}" id="sopt-${n++}" role="option" aria-selected="false" href="${href}">${inner}</a>`;
  els.results.innerHTML = `
    <div id="search-list" role="listbox" aria-label="Результаты поиска" class="search__grid">
      ${res.products.length ? `<section class="sgroup sgroup--products" role="group" aria-label="Товары">
        <h3 class="sgroup__title" aria-hidden="true">Товары <span class="tabular">${res.total}</span></h3>
        ${res.products
          .map((p) =>
            opt(
              `<img src="${esc(p.thumb)}" alt="" width="56" height="62" loading="lazy">
               <span class="sopt__main"><span class="sopt__name">${highlight(p.name, q)}</span><span class="sopt__meta">${esc(p.type || '')}</span></span>
               <span class="sopt__price tabular">${p.price ? formatPrice(p.price) : 'По запросу'}</span>`,
              routes.product(p.slug),
              'sopt--product',
            ),
          )
          .join('')}
      </section>` : ''}
      <div class="search__side">
        ${res.categories.length ? `<section class="sgroup" role="group" aria-label="Категории">
          <h3 class="sgroup__title" aria-hidden="true">Категории</h3>
          ${res.categories.map((c) => opt(`<span class="sopt__name">${esc(c.title)}</span><span class="sopt__meta tabular">${c.count}</span>`, routes.category(c.slug))).join('')}
        </section>` : ''}
        ${res.news.length ? `<section class="sgroup" role="group" aria-label="Новости">
          <h3 class="sgroup__title" aria-hidden="true">Новости</h3>
          ${res.news.map((x) => opt(`<span class="sopt__name">${esc(x.title)}</span><span class="sopt__meta tabular">${esc(x.date)}</span>`, routes.news(x.url))).join('')}
        </section>` : ''}
      </div>
    </div>
    ${res.total > res.products.length ? `<button type="button" class="search__all" data-search-all>Показать все ${res.total} ${plural(res.total, ['результат', 'результата', 'результатов'])}<svg width="18" height="18" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ''}`;
  els.status.textContent = `Найдено ${res.total} ${plural(res.total, ['товар', 'товара', 'товаров'])}`;
}

function highlight(text, q) {
  const safe = esc(text);
  const words = q.split(/\s+/).filter((w) => w.length > 1).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (!words.length) return safe;
  return safe.replace(new RegExp(`(${words.join('|')})`, 'gi'), '<mark>$1</mark>');
}

/** Hand the query to the existing backend search (or the prototype's catalog search). */
function submitFull(q) {
  const value = q.trim();
  if (!value) return;
  remember(value);
  const r = routes.searchResults(value);
  const form = document.createElement('form');
  form.method = r.method;
  form.action = r.action;
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = r.field;
  input.value = r.value;
  form.append(input);
  const csrf = document.querySelector('meta[name="csrf-token"]');
  const param = document.querySelector('meta[name="csrf-param"]');
  if (r.method === 'post' && csrf && param) {
    const t = document.createElement('input');
    t.type = 'hidden';
    t.name = param.content;
    t.value = csrf.content;
    form.append(t);
  }
  document.body.append(form);
  form.submit();
}
