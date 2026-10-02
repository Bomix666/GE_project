/**
 * Cart drawer + header badge + add-to-cart confirmation.
 * Pure presentation over services/cart.js (existing backend contract).
 */
import { qs, qsa, esc, formatPrice, plural, debounce, announce } from '../core/dom.js';
import { routes } from '../core/routes.js';
import { cart, clampQty } from '../services/cart.js';
import { createDialog } from './dialog.js';
import { toast } from './toast.js';
import { getCatalog } from '../data/api.js';

let drawer;

export function initCart() {
  drawer = createDialog({ className: 'dlg--drawer', labelledBy: 'cart-title' });
  drawer.setContent(`
    <div class="drawer">
      <header class="drawer__head">
        <h2 class="drawer__title" id="cart-title">Корзина <span class="drawer__count tabular" data-drawer-count></span></h2>
        <button type="button" class="icon-btn" data-dialog-close aria-label="Закрыть корзину"><svg width="22" height="22" aria-hidden="true"><use href="#i-close"/></svg></button>
      </header>
      <div class="drawer__body" data-drawer-body aria-live="polite"></div>
      <footer class="drawer__foot" data-drawer-foot></footer>
    </div>`);

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-cart-open]');
    if (opener) {
      e.preventDefault();
      openCart(opener);
    }
  });
  document.addEventListener('cart:open', () => openCart());

  bindLineEvents(qs('[data-drawer-body]', drawer.el));

  cart.subscribe((state, event) => {
    renderBadge(state, event);
    if (event.type !== 'pending') render(state);
    if (event.type === 'add') confirmAdd(event, state);
    if (event.type === 'remove') announce('Товар удалён из корзины');
  });
  cart.ready.then(render);
}

/** Quantity edits (debounced → cart.update) and removal for any list of lines. */
export function bindLineEvents(root) {
  const pushQty = debounce((positionId, qty) => cart.update(positionId, qty).catch(() => {}), 380);
  root.addEventListener('change', (e) => {
    const input = e.target.closest('.qty__input');
    if (!input) return;
    const line = input.closest('[data-position]');
    const qty = clampQty(input.value);
    input.value = qty; // what the field shows is what the cart stores
    const unit = Number(line.dataset.unit);
    qs('[data-line-total]', line).textContent = formatPrice(unit * qty);
    pushQty(line.dataset.position, qty);
  });
  root.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (!rm) return;
    const line = rm.closest('[data-position]');
    line.classList.add('is-removing');
    cart.remove(line.dataset.position).catch(() => line.classList.remove('is-removing'));
  });
}

export function openCart(trigger) {
  render(cart.state);
  drawer.show(trigger);
}

function renderBadge(state, event) {
  qsa('[data-cart-count]').forEach((b) => {
    b.textContent = state.count;
    b.classList.toggle('is-empty', !state.count);
    if (event && event.type === 'add') {
      b.classList.remove('is-bump');
      void b.offsetWidth;
      b.classList.add('is-bump');
    }
  });
  qsa('[data-cart-open]').forEach((btn) => {
    if (btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', `Корзина, товаров: ${state.count}`);
  });
}

function render(state) {
  if (!drawer) return;
  const body = qs('[data-drawer-body]', drawer.el);
  const foot = qs('[data-drawer-foot]', drawer.el);
  const count = qs('[data-drawer-count]', drawer.el);
  count.textContent = state.count ? `· ${state.count}` : '';

  if (!state.items.length) {
    body.innerHTML = `
      <div class="drawer__empty">
        <p class="h3">В корзине пока пусто</p>
        <p class="text-2">Начните с оборудования или расходных материалов.</p>
        <ul class="drawer__suggest" role="list">
          <li><a href="${routes.category('konfetti-masiny')}">Конфетти-машины</a></li>
          <li><a href="${routes.category('krioeffekty-2')}">Криоэффекты</a></li>
          <li><a href="${routes.category('konfetti')}">Конфетти</a></li>
          <li><a href="${routes.category('iskusstvennyj-sneg')}">Искусственный снег</a></li>
        </ul>
      </div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = `<ul class="lines" role="list">${state.items.map(lineItem).join('')}</ul>`;
  const saving = state.cost_full > state.cost ? state.cost_full - state.cost : 0;
  foot.innerHTML = `
    ${saving ? `<p class="drawer__row"><span>Скидка</span><span class="tabular">−${formatPrice(saving)}</span></p>` : ''}
    <p class="drawer__row drawer__row--total"><span>Итого</span><span class="tabular">${formatPrice(state.cost)}</span></p>
    <p class="drawer__note text-3">Стоимость доставки рассчитает менеджер при подтверждении заказа.</p>
    <a class="btn btn--primary btn--lg btn--block" href="${routes.cart()}"><span class="btn__label">Оформить заказ</span><span class="btn__icon" aria-hidden="true"><svg width="18" height="18"><use href="#i-arrow"/></svg></span></a>
    <button type="button" class="btn btn--ghost btn--center" data-dialog-close><span class="btn__label">Продолжить покупки</span></button>`;
}

export function lineItem(pos) {
  const unit = pos.discountPrice || pos.price || 0;
  const thumb = pos.images && pos.images.thumbnails ? pos.images.thumbnails.cart : '';
  const url = pos.slug ? routes.product(pos.slug) : null;
  const name = esc(pos.name);
  return `
    <li class="line" data-position="${esc(pos.id)}" data-unit="${unit}">
      <img class="line__img" src="${esc(thumb)}" alt="" width="72" height="80" loading="lazy">
      <div class="line__body">
        ${url ? `<a class="line__name" href="${url}">${name}</a>` : `<p class="line__name">${name}</p>`}
        ${pos.is_rent ? '<p class="line__tag">Аренда</p>' : ''}
        <p class="line__unit text-3 tabular">${formatPrice(unit)} / шт.</p>
        <div class="line__controls">
          <div class="qty qty--sm" data-qty>
            <button type="button" class="qty__btn" data-qty-dec aria-label="Уменьшить количество: ${name}"><svg width="14" height="14" aria-hidden="true"><use href="#i-minus"/></svg></button>
            <input class="qty__input tabular" type="number" inputmode="numeric" min="1" max="999" value="${pos.quantity}" aria-label="Количество: ${name}">
            <button type="button" class="qty__btn" data-qty-inc aria-label="Увеличить количество: ${name}"><svg width="14" height="14" aria-hidden="true"><use href="#i-plus"/></svg></button>
          </div>
          <p class="line__total tabular" data-line-total>${formatPrice(unit * pos.quantity)}</p>
        </div>
      </div>
      <button type="button" class="line__remove icon-btn" data-remove aria-label="Удалить из корзины: ${name}"><svg width="18" height="18" aria-hidden="true"><use href="#i-trash"/></svg></button>
    </li>`;
}

async function confirmAdd(event, state) {
  if (drawer && drawer.open) return;
  let product;
  try {
    product = (await getCatalog()).byId.get(event.productId);
  } catch {
    /* ignore */
  }
  toast({
    title: 'Добавлено в корзину',
    text: product ? `${product.name}${event.qty > 1 ? ` × ${event.qty}` : ''}` : '',
    image: product ? product.thumb : '',
    action: {
      label: `Корзина · ${state.count} ${plural(state.count, ['товар', 'товара', 'товаров'])}`,
      onClick: () => openCart(),
    },
  });
}
