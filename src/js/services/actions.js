/**
 * Delegated commerce actions — work for any card/button rendered anywhere.
 *   [data-add="<id>"]            add to cart (qty from closest [data-qty-scope])
 *   [data-one-click="<id>"]      real "Купить в 1 клик": add, then go to cart
 *   [data-notify="<id>"]         "Под заказ" → DemandProductForm dialog
 *   [data-price-request="<id>"]  "Запросить цену" → PriceRequestForm dialog
 *   [data-quick-view="<slug>"]   quick preview dialog
 *   [data-qty] steppers
 */
import { cart, clampQty } from './cart.js';
import { PRODUCTION } from '../core/env.js';
import { routes } from '../core/routes.js';
import { toast } from '../components/toast.js';


function readQty(button) {
  const scope = button.closest('[data-qty-scope]');
  const input = scope && scope.querySelector('.qty__input');
  return input ? clampQty(input.value) : 1;
}

async function handleAdd(button, { oneClick = false } = {}) {
  // While the button is adding or shows «Добавлено», repeated taps do nothing:
  // a double tap must not turn one product into an unpredictable number of them
  if (button.getAttribute('aria-busy') === 'true' || button.classList.contains('is-done')) return;
  const id = Number(button.dataset.add || button.dataset.oneClick);
  const qty = readQty(button);
  const label = button.querySelector('[data-add-label]');
  const original = label ? label.textContent : '';

  button.setAttribute('aria-busy', 'true');
  button.classList.add('is-loading');
  try {
    await cart.add(id, qty);
    button.classList.remove('is-loading');
    button.classList.add('is-done');
    if (label) label.textContent = 'Добавлено';
    if (oneClick) {
      if (PRODUCTION) window.location.href = routes.cart();
      else document.dispatchEvent(new CustomEvent('cart:open'));
    }
    setTimeout(() => {
      button.classList.remove('is-done');
      if (label) label.textContent = original;
    }, 1700);
  } catch {
    button.classList.remove('is-loading');
    toast({
      tone: 'error',
      title: 'Не удалось добавить товар',
      text: 'Проверьте соединение и попробуйте ещё раз.',
      action: { label: 'Повторить', onClick: () => handleAdd(button, { oneClick }) },
    });
  } finally {
    button.removeAttribute('aria-busy');
  }
}

export function initActions() {
  document.addEventListener('click', (e) => {
    const t = e.target;

    const dec = t.closest('[data-qty-dec]');
    const inc = t.closest('[data-qty-inc]');
    if (dec || inc) {
      const input = (dec || inc).closest('[data-qty]').querySelector('input');
      input.value = clampQty(Number(input.value) + (inc ? 1 : -1));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    const add = t.closest('[data-add]');
    if (add) return void handleAdd(add);

    const one = t.closest('[data-one-click]');
    if (one) return void handleAdd(one, { oneClick: true });

    const notify = t.closest('[data-notify]');
    if (notify) {
      import('../components/request-form.js').then((m) =>
        m.openRequestForm('demand', { id: Number(notify.dataset.notify), name: notify.dataset.name }, notify),
      );
      return;
    }

    const price = t.closest('[data-price-request]');
    if (price) {
      import('../components/request-form.js').then((m) =>
        m.openRequestForm('price', { id: Number(price.dataset.priceRequest), name: price.dataset.name }, price),
      );
      return;
    }

    const quick = t.closest('[data-quick-view]');
    if (quick) {
      import('../components/quick-view.js').then((m) => m.openQuickView(quick.dataset.quickView, quick));
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.matches('.qty__input')) e.target.value = clampQty(e.target.value);
  });
}
