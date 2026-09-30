/**
 * Read-only data access.
 *
 * The JSON files in /public/data are a snapshot of globaleffects.ru
 * (see README → "Data"). In production the same shapes can be emitted by the
 * existing Yii views/export — no new backend endpoints are required.
 */
const cache = new Map();

function fetchJSON(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url, { credentials: 'same-origin' }).then((r) => {
        if (!r.ok) throw new Error(`${url} → ${r.status}`);
        return r.json();
      }),
    );
  }
  return cache.get(url);
}

let catalogPromise;

export function getCatalog() {
  catalogPromise ||= fetchJSON('/data/catalog.json').then((data) => {
    const byId = new Map(data.products.map((p) => [p.id, p]));
    const bySlug = new Map(data.products.map((p) => [p.slug, p]));
    const categories = new Map(data.categories.map((c) => [c.slug, c]));
    return {
      ...data,
      byId,
      bySlug,
      categories,
      groups: {
        equipment: data.categories.filter((c) => c.group === 'equipment'),
        consumables: data.categories.filter((c) => c.group === 'consumables'),
      },
      productsIn(slug) {
        const cat = categories.get(slug);
        return cat ? cat.products.map((id) => byId.get(id)).filter(Boolean) : [];
      },
      pick(ids) {
        return ids.map((id) => byId.get(id)).filter(Boolean);
      },
    };
  });
  return catalogPromise;
}

export const getProduct = (slug) => fetchJSON(`/data/products/${encodeURIComponent(slug)}.json`);
export const getGallery = () => fetchJSON('/data/gallery.json');
export const getNews = () => fetchJSON('/data/news.json');
export const getBlog = () => fetchJSON('/data/blog.json');
export const getOffers = () => fetchJSON('/data/offers.json');
export const getPages = () => fetchJSON('/data/pages.json');

export const GROUP_TITLES = { equipment: 'Оборудование', consumables: 'Расходные материалы' };

export const specValue = (product, key) => {
  const pair = product.specs && product.specs.find(([k]) => k === key);
  return pair ? pair[1] : null;
};

export const AVAILABILITY = {
  in_stock: { label: 'В наличии', short: 'В наличии' },
  on_order: { label: 'Под заказ', short: 'Под заказ' },
  request: { label: 'Цена по запросу', short: 'По запросу' },
};
