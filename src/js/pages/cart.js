/** Cart page view over the same cart store as the drawer, with the checkout form of /checkout/index. */
import { ready } from '../app.js';
import { qs, qsa, esc, formatPrice, plural } from '../core/dom.js';
import { PRODUCTION } from '../core/env.js';
import { routes } from '../core/routes.js';
import { cart } from '../services/cart.js';
import { lineItem, bindLineEvents } from '../components/cart-drawer.js';
import { wireValidation } from '../components/request-form.js';

/* The checkout shows the fields the site's form shows for the chosen options:
   a person picks a city and a delivery (Moscow: courier or pickup, another city: a carrier),
   a company gives its INN and an address. Hidden fields still post, empty, as they do now. */
function initCheckout(form, summary) {
  const reg = qs('[data-co-reg]', form);
  const city = qs('[data-co-city]', form);
  const delivery = qs('[data-co-delivery]', form);
  const sync = () => {
    qsa('option', delivery).forEach((o) => (o.hidden = o.disabled = o.dataset.city !== city.value));
    if (delivery.selectedOptions[0].disabled) delivery.value = city.value === '0' ? '0' : '2';
    const person = reg.value === '0';
    const d = delivery.value;
    const show = { person, legal: !person, carrier: person && d === '2', courier: person && d === '0', address: !person || d !== '1' };
    qsa('[data-co-show]', form).forEach((field) => (field.hidden = !show[field.dataset.coShow]));
  };
  form.addEventListener('change', (e) => e.target.matches('select') && sync());
  sync();

  const csrf = qs('meta[name="csrf-token"]');
  const csrfParam = qs('meta[name="csrf-param"]');
  if (csrf && csrfParam) form.insertAdjacentHTML('afterbegin', `<input type="hidden" name="${esc(csrfParam.content)}" value="${esc(csrf.content)}">`);

  wireValidation(form, summary, () => {
    if (PRODUCTION) {
      form.submit();
      return;
    }
    form.innerHTML = `<div class="form-done" role="status" tabindex="-1"><svg width="28" height="28" aria-hidden="true"><use href="#i-check"/></svg>
      <p class="h3">Данные проверены</p>
      <p class="text-2">В прототипе нет сервера, поэтому заказ не отправлен. На сайте его примет обработчик <code>/checkout/process</code>.</p></div>`;
    qs('.form-done', form).focus();
  });
}

ready(() => {
  const list = qs('[data-cart-page-list]');
  const summary = qs('[data-cart-summary-body]');
  const aside = qs('[data-cart-summary]');
  const checkout = qs('[data-checkout]');
  const count = qs('[data-cart-page-count]');
  if (PRODUCTION) qsa('[data-proto-only]').forEach((el) => el.remove());
  initCheckout(qs('[data-checkout-form]', checkout), qs('.form-summary', checkout));

  const render = (state) => {
    count.textContent = state.count ? state.count : '';
    aside.hidden = checkout.hidden = !state.items.length; // nothing to order in an empty cart
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
