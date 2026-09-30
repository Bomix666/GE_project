/**
 * Cart service — a UI-side store over the EXISTING cart backend.
 *
 * Contract (unchanged, taken from the live AngularJS `shopCart` service):
 *   POST /cart/add        { product_id, qty }      → { data: Cart, message }
 *   POST /cart/update     { position_id, qty }     → { data: Cart, message }
 *   POST /cart/remove     { position_id }          → { data: Cart, message }
 *   POST /cart/clear      {}                       → { data: Cart, message }
 *   Cart = { items: Position[], count, cost, cost_full }
 *   Position = { id, name, quantity, discountPrice, images: { thumbnails: { cart } }, is_rent, … }
 * Initial state is printed by the Yii layout (`shopCart.setData({...})`);
 * expose it as `window.GE_CART_INITIAL` or <script type="application/json" id="ge-cart-initial">.
 *
 * YiiDriver  — production: talks to the endpoints above.
 * LocalDriver — prototype: emulates the same responses in localStorage.
 */
import { PRODUCTION } from '../core/env.js';
import { getCatalog } from '../data/api.js';

const EMPTY = { items: [], count: 0, cost: 0, cost_full: 0 };

/* ------------------------------------------------------------ Yii driver */
function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : null;
}

const YiiDriver = {
  name: 'yii',
  async initial() {
    if (window.GE_CART_INITIAL) return window.GE_CART_INITIAL;
    const el = document.getElementById('ge-cart-initial');
    if (el) {
      try {
        return JSON.parse(el.textContent);
      } catch {
        /* fall through */
      }
    }
    return EMPTY;
  },
  async call(action, body) {
    const headers = { 'Content-Type': 'application/json;charset=UTF-8', 'X-Requested-With': 'XMLHttpRequest' };
    const token = csrfToken();
    if (token) headers['X-CSRF-Token'] = token;
    const res = await fetch(`/cart/${action}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`cart/${action} → ${res.status}`);
    return res.json();
  },
};

/* ---------------------------------------------------------- Local driver */
const STORE_KEY = 'ge.cart.v1';

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || { items: [] };
  } catch {
    return { items: [] };
  }
}
function writeLocal(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* private mode — keep in memory only */
  }
}
function totals(items) {
  const count = items.reduce((n, i) => n + i.quantity, 0);
  const cost = items.reduce((n, i) => n + i.quantity * (i.discountPrice || 0), 0);
  return { items, count, cost, cost_full: cost };
}

const LocalDriver = {
  name: 'local',
  async initial() {
    return totals(readLocal().items);
  },
  async call(action, body) {
    const state = readLocal();
    let items = state.items;
    let message = '';
    if (action === 'add') {
      const catalog = await getCatalog();
      const product = catalog.byId.get(Number(body.product_id));
      if (!product) throw new Error('Unknown product');
      const existing = items.find((i) => i.product_id === product.id);
      if (existing) existing.quantity += body.qty || 1;
      else
        items.push({
          id: `p${product.id}`,
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          quantity: body.qty || 1,
          discountPrice: product.price || 0,
          price: product.price || 0,
          images: { thumbnails: { cart: product.thumb } },
          is_rent: false,
        });
      message = 'Товар добавлен в корзину';
    } else if (action === 'update') {
      const pos = items.find((i) => i.id === body.position_id);
      if (pos) pos.quantity = Math.max(1, Number(body.qty) || 1);
      message = 'Корзина обновлена';
    } else if (action === 'remove') {
      items = items.filter((i) => i.id !== body.position_id);
      message = 'Товар удалён из корзины';
    } else if (action === 'clear') {
      items = [];
      message = 'Корзина очищена';
    }
    writeLocal({ items });
    await new Promise((r) => setTimeout(r, 180)); // feel of a network round-trip
    return { data: totals(items), message };
  },
};

/* ----------------------------------------------------------------- store */
function createCart(driver) {
  let state = { ...EMPTY };
  const listeners = new Set();
  const emit = (event) => listeners.forEach((fn) => fn(state, event));

  const run = async (action, body, meta = {}) => {
    emit({ type: 'pending', action, ...meta });
    try {
      const res = await driver.call(action, body);
      state = res.data || state;
      emit({ type: action, message: res.message, ...meta });
      return state;
    } catch (error) {
      emit({ type: 'error', action, error, ...meta });
      throw error;
    }
  };

  const ready = driver.initial().then((initial) => {
    state = initial || { ...EMPTY };
    emit({ type: 'init' });
    return state;
  });

  return {
    driver: driver.name,
    ready,
    get state() {
      return state;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    add: (productId, qty = 1) => run('add', { product_id: productId, qty }, { productId, qty }),
    update: (positionId, qty) => run('update', { position_id: positionId, qty }, { positionId }),
    remove: (positionId) => run('remove', { position_id: positionId }, { positionId }),
    clear: () => run('clear', {}),
    /** Re-read state from the driver without a mutation (tab sync). */
    async reload() {
      state = (await driver.initial()) || { ...EMPTY };
      emit({ type: 'init' });
    },
  };
}

export const cart = createCart(PRODUCTION ? YiiDriver : LocalDriver);

/* Keep several prototype tabs in sync (production cart lives in the server session). */
if (!PRODUCTION) {
  window.addEventListener('storage', (e) => {
    if (e.key === STORE_KEY) cart.reload();
  });
}
