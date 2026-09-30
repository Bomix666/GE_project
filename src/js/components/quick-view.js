/** Quick product preview from any card — loaded lazily on first use. */
import { html, toHTML, icon, formatPrice } from '../core/dom.js';
import { routes } from '../core/routes.js';
import { getCatalog, getProduct } from '../data/api.js';
import { createDialog } from './dialog.js';
import { availabilityBadge, buyAction } from './product-card.js';

let dialog;

export async function openQuickView(slug, trigger) {
  dialog ||= createDialog({ className: 'dlg--quick', labelledBy: 'qv-title' });
  const [catalog, product] = await Promise.all([getCatalog(), getProduct(slug)]);
  const base = catalog.bySlug.get(slug) || product;
  const cat = catalog.categories.get(product.category);
  const p = { ...base, ...product };
  const excerpt = product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 260);

  dialog.setContent(
    toHTML(html`<div class="dlg__panel qv">
      <button type="button" class="dlg__close icon-btn" data-dialog-close aria-label="Закрыть">${icon('i-close', 22)}</button>
      <div class="qv__media">
        <img src="${p.image}" alt="${p.name}" width="570" height="500" />
      </div>
      <div class="qv__body">
        <p class="label">${p.type || (cat ? cat.title : '')}</p>
        <h2 class="qv__title h3" id="qv-title">${p.name}</h2>
        <div class="qv__price-row">
          <p class="qv__price tabular">${p.price ? formatPrice(p.price) : 'Цена по запросу'}</p>
          ${availabilityBadge(p)}
        </div>
        ${p.specs && p.specs.length
          ? html`<dl class="specs specs--compact">${p.specs.slice(0, 4).map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`
          : ''}
        ${excerpt ? html`<p class="qv__excerpt text-2">${excerpt}…</p>` : ''}
        <div class="qv__actions" data-qty-scope>${buyAction(p, { size: 'md' })}</div>
        <a class="btn btn--ghost" href="${routes.product(p.slug)}"><span class="btn__label">Подробнее о товаре</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
      </div>
    </div>`),
  );
  dialog.show(trigger);
}
