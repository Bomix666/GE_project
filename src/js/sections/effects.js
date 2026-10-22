/**
 * Effects: a grid of cards, 01 → 07. A card leads to the effect's equipment
 * and consumables in the catalogue; deep links (#fx-cryo) land on the card,
 * links to #effects bring the whole block into view.
 */
import { qs, html, toHTML, icon } from '../core/dom.js';
import { env } from '../core/env.js';
import { routes } from '../core/routes.js';
import { getCatalog } from '../data/api.js';
import { effects } from '../data/content.js';

export async function initEffects() {
  const grid = qs('[data-fx-grid]');
  if (!grid) return;

  let catalog = null;
  try {
    catalog = await getCatalog();
  } catch {
    /* the cards still lead to the equipment */
  }

  grid.innerHTML = effects.map((fx) => toHTML(card(fx, catalog))).join('');

  // the cards did not exist yet when the browser looked for the #fx-… anchor
  const target = document.getElementById(location.hash.slice(1));
  if (grid.contains(target)) target.scrollIntoView();
  else if (location.hash === '#effects') showEffects('auto');

  // «Смотреть эффекты» and the menu's «Эффекты» on this page
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#effects"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.href);
    if (url.pathname !== location.pathname || url.hash !== '#effects') return;
    e.preventDefault();
    history.pushState(null, '', '#effects');
    showEffects(env.reducedMotion ? 'auto' : 'smooth');
  });
}

/* The section rises over the hero with a long transparent top, so the anchor alone left a screen
   of black above the heading. The heading and the seven cards come to the middle of the screen,
   or to its top when they are taller than it; scrolling up, the header comes back, so it gets room. */
function showEffects(behavior) {
  const section = qs('#effects');
  const top = qs('.chapter', section).getBoundingClientRect().top + window.scrollY;
  const bottom = qs('[data-fx-grid]', section).getBoundingClientRect().bottom + window.scrollY;
  const header = qs('[data-header]');
  const room = 16 + (top < window.scrollY && header ? header.offsetHeight : 0);
  window.scrollTo({ top: top - Math.max(room, (window.innerHeight - (bottom - top)) / 2), behavior });
}

function card(fx, catalog) {
  const cons = catalog ? catalog.categories.get(fx.consumables[0]) : null;
  const img = fx.image;

  return html`<li class="fxcard" id="fx-${fx.slug}">
    <img src="${img.src}" srcset="${img.sm} 720w, ${img.src} ${img.w}w" sizes="(min-width: 1024px) 50vw, 100vw"
      width="${img.w}" height="${img.h}" alt="${img.alt}" loading="lazy" decoding="async" />
    <div class="fxcard__body">
      <span class="fxcard__num tabular" aria-hidden="true">${fx.num}</span>
      <h3 class="fxcard__title">${fx.title}</h3>
      <p class="fxcard__links">
        <a class="fxcard__go" href="${routes.categoryFiltered(fx.equipment, fx.equipmentFilter)}">Оборудование ${icon('i-arrow', 16)}</a>
        ${cons
          ? html`<a href="${routes.categoryFiltered(cons.slug, fx.consumablesFilter)}">${cons.group === 'consumables' ? 'Расходники' : cons.title}</a>`
          : ''}
      </p>
    </div>
  </li>`;
}
