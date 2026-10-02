/** Cart page view over the same cart store as the drawer. */
import { ready } from '../app.js';
import { qs, formatPrice, plural } from '../core/dom.js';
import { PRODUCTION } from '../core/env.js';
import { routes } from '../core/routes.js';
import { cart } from '../services/cart.js';
import { lineItem, bindLineEvents } from '../components/cart-drawer.js';

ready(() => {
  const list = qs('[data-cart-page-list]');
  const summary = qs('[data-cart-summary-body]');
  const aside = qs('[data-cart-summary]');
  const count = qs('[data-cart-page-count]');
  if (PRODUCTION) qs('[data-proto-only]')?.remove();

  const render = (state) => {
    count.textContent = state.count ? state.count : '';
    aside.hidden = !state.items.length; // no order summary for an empty cart
    if (!state.items.length) {
      list.innerHTML = `<div class="cart-empty">
        <p class="h3">В корзине пока пусто</p>
        <p class="text-2">Оборудование и расходные материалы — в каталоге.</p>
        <a class="btn btn--primary btn--lg" href="${routes.category('konfetti-masiny')}"><span class="btn__label">Перейти в каталог</span><span class="btn__icon" aria-hidden="true"><svg width="20" height="20"><use href="#i-arrow"/></svg></span></a>
      </div>`;
      summary.innerHTML = '';
      return;
    }
    list.innerHTML = `<ul class="lines lines--page" role="list">${state.items.map(lineItem).join('')}</ul>
      <button type="button" class="btn btn--ghost cart-clear" data-cart-clear><span class="btn__label">Очистить корзину</span></button>`;
    summary.innerHTML = `
      <p class="drawer__row"><span>${state.count} ${plural(state.count, ['товар', 'товара', 'товаров'])}</span><span class="tabular">${formatPrice(state.cost_full)}</span></p>
      ${state.cost_full > state.cost ? `<p class="drawer__row"><span>Скидка</span><span class="tabular">−${formatPrice(state.cost_full - state.cost)}</span></p>` : ''}
      <p class="drawer__row drawer__row--total"><span>Итого</span><span class="tabular">${formatPrice(state.cost)}</span></p>
      <p class="drawer__note text-3">Стоимость доставки рассчитает менеджер при подтверждении заказа.</p>`;
  };

  bindLineEvents(list);
  list.addEventListener('click', (e) => {
    if (!e.target.closest('[data-cart-clear]')) return;
    if (window.confirm('Удалить все товары из корзины?')) cart.clear();
  });
  cart.subscribe((state, event) => event.type !== 'pending' && render(state));
  cart.ready.then(render);
});
