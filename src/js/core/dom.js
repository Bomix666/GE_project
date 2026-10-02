/** Small DOM + formatting helpers shared by every component. */

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

/** Tagged template that escapes interpolations unless wrapped with raw(). */
const RAW = Symbol('raw');
export const raw = (html) => ({ [RAW]: true, html: String(html ?? '') });
export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) out += renderValue(values[i]);
  });
  return raw(out);
}
function renderValue(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(renderValue).join('');
  if (typeof v === 'object' && v[RAW]) return v.html;
  return esc(v);
}
export const toHTML = (tpl) => (tpl && tpl[RAW] ? tpl.html : esc(tpl));

export function fromHTML(markup) {
  const t = document.createElement('template');
  t.innerHTML = toHTML(markup).trim();
  return t.content.firstElementChild;
}

export const icon = (id, size = 20, cls = '') =>
  raw(`<svg class="${cls}" width="${size}" height="${size}" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`);

const priceFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
export const formatPrice = (n) => (n == null ? '' : `${priceFmt.format(n)} ₽`);

/** Russian plural: plural(5, ['товар', 'товара', 'товаров']) */
export function plural(n, forms) {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function rafThrottle(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}

/* ---------- Scroll lock (used by dialogs, drawer, menus) ---------- */
let lockCount = 0;
export function lockScroll() {
  lockCount += 1;
  document.documentElement.classList.add('is-locked');
}
export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (!lockCount) document.documentElement.classList.remove('is-locked');
}

/** Normalize text for search/matching: lowercase, ё→е, collapse spaces. */
export const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"“”„()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Search words: punctuation and emoji around a word are ignored («снег!», «🔥 конфетти»). */
export const searchTokens = (s) =>
  normalize(s)
    .split(' ')
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);

export const params = () => new URLSearchParams(location.search);

export function announce(message) {
  const region = qs('[data-sr-announcer]') || createAnnouncer();
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}
function createAnnouncer() {
  const el = document.createElement('div');
  el.className = 'visually-hidden';
  el.setAttribute('data-sr-announcer', '');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  document.body.append(el);
  return el;
}
