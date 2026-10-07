/**
 * Effects: a grid of cards, 01 → 07. A card leads to the effect's equipment
 * and consumables in the catalogue; deep links (#fx-cryo) land on the card.
 */
import { qs, html, toHTML, icon } from '../core/dom.js';
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
