/**
 * Instant search over the catalog snapshot + news.
 * UI sugar only: "Показать все результаты" still goes to the existing
 * backend search (POST /search/results, ProductSearch[query]).
 */
import { normalize, searchTokens } from '../core/dom.js';
import { getCatalog, getNews } from '../data/api.js';

let indexPromise;

export function buildIndex() {
  indexPromise ||= Promise.all([getCatalog(), getNews().catch(() => [])]).then(([catalog, news]) => {
    const categories = catalog.categories;
    return {
      catalog,
      products: catalog.products.map((p) => {
        const cat = categories.get(p.category);
        return {
          item: p,
          name: normalize(p.name),
          type: normalize(p.type),
          hay: normalize(`${p.name} ${p.type} ${cat ? cat.title : ''} ${p.specs.map((s) => s[1]).join(' ')}`),
        };
      }),
      categories: Array.from(categories.values()).map((c) => ({ item: c, name: normalize(c.title) })),
      news: news.map((n) => ({ item: n, name: normalize(n.title), hay: normalize(`${n.title} ${n.excerpt}`) })),
    };
  });
  return indexPromise;
}

function score(entry, words, q) {
  let s = 1; // every word matched somewhere (category, specs) → listed, just ranked lower
  for (const w of words) {
    if (!entry.hay && !entry.name.includes(w)) return 0;
    if (entry.hay && !entry.hay.includes(w)) return 0;
    if (entry.name.includes(w)) s += 3;
    if (entry.type && entry.type.includes(w)) s += 3; // main products carry a type, accessories don't
    if (entry.name.startsWith(w)) s += 2;
    else if (entry.name.includes(` ${w}`)) s += 1;
  }
  if (entry.name.includes(q)) s += 4;
  return s;
}

export async function search(query, { limit = 6 } = {}) {
  const index = await buildIndex();
  const q = normalize(query);
  const words = searchTokens(query);
  if (!words.length) return { products: [], categories: [], news: [], total: 0 };

  const rank = (list) =>
    list
      .map((e) => ({ e, s: score(e, words, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.name.length - b.e.name.length);

  const products = rank(index.products);
  return {
    products: products.slice(0, limit).map((x) => x.e.item),
    categories: rank(index.categories).slice(0, 4).map((x) => x.e.item),
    news: rank(index.news).slice(0, 2).map((x) => x.e.item),
    total: products.length,
  };
}

/* Recent queries (per browser, convenience only) */
const RECENT_KEY = 'ge.search.recent';
export function recent() {
  try {
    // storage can be edited by hand: only a list of non-empty strings counts
    const list = JSON.parse(localStorage.getItem(RECENT_KEY));
    return Array.isArray(list) ? list.filter((x) => typeof x === 'string' && x.trim()).slice(0, 5) : [];
  } catch {
    return [];
  }
}
export function remember(q) {
  const v = q.trim();
  if (v.length < 2) return;
  try {
    const list = [v, ...recent().filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
