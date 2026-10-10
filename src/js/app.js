/**
 * Shell shared by every page: fonts, styles, header, menus, search, cart,
 * delegated actions, reveal. Page modules import this first.
 */

import './core/env.js';
import { qsa } from './core/dom.js';
import { applyRoutes } from './core/routes.js';
import { reveal } from './core/motion.js';
import { fitAll } from './core/fit.js';
import { initHeader } from './components/header.js';
import { initMegaMenu } from './components/mega-menu.js';
import { initMobileMenu } from './components/mobile-menu.js';
import { initCart } from './components/cart-drawer.js';
import { initActions } from './services/actions.js';
import { PRODUCTION } from './core/env.js';
import { toast } from './components/toast.js';

function initSearchTriggers() {
  const open = (trigger, initial) =>
    import('./components/search-overlay.js').then((m) => m.openSearch(trigger, initial));

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-search-open]');
    if (t) open(t);
  });
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest?.('input, textarea, select, [contenteditable="true"]'); // the target can be the document itself
    if (document.querySelector('dialog[open]')) return;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open(document.querySelector('[data-search-open]'));
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      open(document.querySelector('[data-search-open]'));
    }
  });
  // Warm the chunk on intent
  qsa('[data-search-open]').forEach((b) =>
    b.addEventListener('pointerenter', () => import('./components/search-overlay.js'), { once: true }),
  );
}

/* The language switch is a backend feature (/site/set-locale → English content
   from the CMS). The prototype has the Russian version only, so it stays here. */
function initLocaleSwitch() {
  if (PRODUCTION) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-route="locale"]');
    if (!a) return;
    e.preventDefault();
    toast({
      title: 'English version',
      text: 'Переключение языка работает на рабочем сайте: английские тексты отдаёт существующий backend. В прототипе — русская версия.',
      timeout: 6000,
    });
  });
}

/* Product photos are hotlinked from the CMS, which resizes a photo on its first
   request and can answer late or with an error. A failed image is asked for once
   more; if that fails too it must not leave a broken-image box: the image hides
   and its frame shows a neutral placeholder. */
document.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (!img.dataset.retried && img.currentSrc) {
      img.dataset.retried = '1';
      setTimeout(() => (img.src = img.currentSrc), 1500);
      return;
    }
    img.classList.add('is-broken');
  },
  true,
);
document.addEventListener(
  'load',
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && (img.dataset.retried || img.classList.contains('is-broken'))) {
      delete img.dataset.retried; // a reused <img> (lightbox, quick view) starts clean
      img.classList.remove('is-broken');
    }
  },
  true,
);

applyRoutes();
initLocaleSwitch();
initHeader();
initMegaMenu();
initMobileMenu();
initCart();
initActions();
initSearchTriggers();
qsa('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

export function ready(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

ready(() => {
  reveal();
  fitAll();
});
