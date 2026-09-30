/**
 * Product card — one component for grid, rails and related products.
 * Pure render function; behaviour is attached by services/actions.js
 * through event delegation, so cards can be re-rendered freely.
 */
import { html, raw, icon, formatPrice } from '../core/dom.js';
import { routes } from '../core/routes.js';
import { AVAILABILITY } from '../data/api.js';

export function availabilityBadge(p) {
  const a = AVAILABILITY[p.availability] || AVAILABILITY.in_stock;
  return html`<p class="avail avail--${p.availability}"><span class="avail__dot" aria-hidden="true"></span>${a.label}</p>`;
}

export function qtyStepper({ id = '', value = 1, label = 'Количество' } = {}) {
  return html`<div class="qty" data-qty>
    <button type="button" class="qty__btn" data-qty-dec aria-label="Уменьшить количество">${icon('i-minus', 16)}</button>
    <input class="qty__input tabular" type="number" inputmode="numeric" min="1" max="999" value="${value}" aria-label="${label}" ${id ? raw(`id="${id}"`) : ''} />
    <button type="button" class="qty__btn" data-qty-inc aria-label="Увеличить количество">${icon('i-plus', 16)}</button>
  </div>`;
}

/** Primary purchase action that matches the real site's availability states. */
export function buyAction(p, { size = 'sm', withQty = true, label } = {}) {
  if (p.availability === 'on_order') {
    return html`<button type="button" class="btn btn--secondary btn--${size}" data-notify="${p.id}" data-name="${p.name}">
      <span class="btn__label">Под заказ</span><span class="btn__icon" aria-hidden="true">${icon('i-mail', 16)}</span>
    </button>`;
  }
  if (p.availability === 'request' || !p.price) {
    return html`<button type="button" class="btn btn--secondary btn--${size}" data-price-request="${p.id}" data-name="${p.name}">
      <span class="btn__label">Запросить цену</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 16)}</span>
    </button>`;
  }
  return html`${withQty ? qtyStepper({ label: `Количество: ${p.name}` }) : ''}
    <button type="button" class="btn btn--primary btn--${size}" data-add="${p.id}" aria-label="${label || `В корзину: ${p.name}`}">
      <span class="btn__label" data-add-label>В корзину</span>
      <span class="btn__icon" aria-hidden="true">${icon('i-cart', 16)}</span>
    </button>`;
}

export function productCard(p, { categoryTitle = '', variant = 'grid', eager = false } = {}) {
  const url = routes.product(p.slug);
  const type = p.type || categoryTitle;
  return html`<article class="pcard pcard--${variant}" data-product-id="${p.id}">
    <div class="pcard__media">
      <img class="pcard__img" src="${p.thumb}" alt="" width="350" height="388" ${raw(eager ? 'fetchpriority="high"' : 'loading="lazy"')} decoding="async" />
      <span class="pcard__glow" aria-hidden="true"></span>
      <button type="button" class="pcard__quick" data-quick-view="${p.slug}" aria-label="Быстрый просмотр: ${p.name}">
        ${icon('i-eye', 18)}<span>Быстрый просмотр</span>
      </button>
    </div>
    <div class="pcard__body">
      ${type ? html`<p class="pcard__type">${type}</p>` : ''}
      <h3 class="pcard__title"><a class="pcard__link" href="${url}">${p.name}</a></h3>
      <div class="pcard__meta">
        <p class="pcard__price tabular">${p.price ? formatPrice(p.price) : 'Цена по запросу'}</p>
        ${availabilityBadge(p)}
      </div>
      <div class="pcard__actions" data-qty-scope>${buyAction(p)}</div>
    </div>
  </article>`;
}

/** Skeleton while data loads (reserves space → no layout shift). */
export const productSkeleton = (n = 8) =>
  raw(Array.from({ length: n }, () => '<div class="pcard pcard--skeleton" aria-hidden="true"><div class="pcard__media"></div><div class="pcard__body"><span></span><span></span><span></span></div></div>').join(''));
