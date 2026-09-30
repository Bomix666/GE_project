/**
 * Single source of truth for URLs.
 *
 * Production (served by Yii2)  → the site's existing routes, untouched.
 * Prototype (vite)             → the redesigned local pages. Only files and
 *                                backend-only features (PDF, documents,
 *                                captcha, locale switch, the confetti-machine
 *                                quiz) still live on globaleffects.ru.
 */
import { PRODUCTION, ORIGIN } from './env.js';
import { qsa } from './dom.js';

const CATEGORIES = new Set([
  'komplekty', 'konfetti-masiny', 'krioeffekty-2', 'sistema-sbrosa-zanavesa', 'imitacia-plameni-2', 'pena-2',
  'tazelyj-dym', 'linejka-easyfx', 'linejka-power-550', 'aksessuary', 'konfetti', 'serpantin',
  'iskusstvennyj-sneg', 'stvoly', 'zidkosti', 'iskusstvennyj-pepel', 'effekty-v-balloncikah',
]);
const TEXT_PAGES = new Set(['delivery', 'politika-konfidencialnosti', 'pravila-prodazi-tovarov']);

/**
 * Map any live-site path to its redesigned page (prototype) or keep it as is
 * (production). Paths the redesign does not cover resolve to the live site.
 */
export function resolve(path) {
  if (!path) return '#';
  if (PRODUCTION) return path;
  if (/^(https?:|mailto:|tel:|#)/.test(path) && !path.startsWith(ORIGIN)) return path;

  const url = new URL(path, ORIGIN);
  const p = url.pathname.replace(/\/+$/, '') || '/';
  const q = url.searchParams;
  let m;

  if (p === '/') return '/';
  if ((m = p.match(/^\/category\/([^/]+)$/)) && CATEGORIES.has(m[1])) return `/catalog.html?c=${m[1]}`;
  if ((m = p.match(/^\/product\/([^/]+)$/))) return `/product.html?p=${encodeURIComponent(m[1])}`;
  if (p === '/news' || p === '/news/index') return '/news.html';
  if (p === '/news/view' && q.get('news_id')) return `/news.html?id=${q.get('news_id')}`;
  if (p === '/blog') return '/blog.html';
  if ((m = p.match(/^\/blog\/([^/]+)$/))) return `/blog.html?p=${encodeURIComponent(m[1])}`;
  if (p === '/offers') return '/offers.html';
  if ((m = p.match(/^\/offers\/([^/]+)$/))) return `/offers.html#${m[1] === 'free-samples' ? 'free-samples-snow' : m[1]}`;
  if (p === '/page/about') return '/about.html';
  if (p === '/contacts') return '/about.html#contacts';
  if ((m = p.match(/^\/page\/([^/]+)$/)) && TEXT_PAGES.has(m[1])) return `/page.html?p=${m[1]}`;
  if ((m = p.match(/^\/gallery\/images(?:\/([^/]+))?$/))) return `/gallery.html${m[1] ? `?cat=${m[1]}` : ''}`;
  if ((m = p.match(/^\/gallery\/videos(?:\/([^/]+))?$/))) return `/gallery.html${m[1] ? `?cat=${m[1]}` : ''}#videos`;
  if (p === '/cart' || p === '/cart/index') return '/cart.html';
  return ORIGIN + url.pathname + url.search + url.hash;
}

/** True when a resolved URL leaves the redesign (opens the current live site). */
export const isLive = (href) => !PRODUCTION && href.startsWith(ORIGIN);

export const routes = {
  home: () => '/',
  category: (slug) => (PRODUCTION ? `/category/${slug}` : `/catalog.html?c=${encodeURIComponent(slug)}`),
  /** Deep link with facet filters (prototype catalog). The live site filters via POST, so production links the category. */
  categoryFiltered: (slug, filters) => {
    if (PRODUCTION || !filters) return routes.category(slug);
    const q = new URLSearchParams({ c: slug, ...filters });
    return `/catalog.html?${q}`;
  },
  product: (slug) => (PRODUCTION ? `/product/${slug}` : `/product.html?p=${encodeURIComponent(slug)}`),
  cart: () => (PRODUCTION ? '/cart/index' : '/cart.html'),
  gallery: (cat) => resolve(`/gallery/images${cat ? `/${cat}` : ''}`),
  videos: (cat) => resolve(`/gallery/videos${cat ? `/${cat}` : ''}`),
  about: () => resolve('/page/about'),
  contacts: () => resolve('/contacts'),
  effects: () => '/#effects',
  effect: (slug) => `/#fx-${slug}`,
  offers: () => resolve('/offers'),
  offer: (slug) => resolve(`/offers/${slug}`),
  newsList: () => resolve('/news'),
  news: (path) => resolve(path),
  newsItem: (id) => resolve(`/news/view?news_id=${id}`),
  blog: () => resolve('/blog'),
  blogPost: (slug) => resolve(`/blog/${slug}`),
  page: (path) => resolve(path),
  doc: (path) => (PRODUCTION ? path : ORIGIN + path),
  locale: (locale) => (PRODUCTION ? `/site/set-locale?locale=${locale}` : ORIGIN + `/site/set-locale?locale=${locale}`),
  /** Full search results keep using the existing backend search. */
  searchResults: (q) =>
    PRODUCTION
      ? { method: 'post', action: '/search/results', field: 'ProductSearch[query]', value: q }
      : { method: 'get', action: '/catalog.html', field: 'q', value: q },
};

/**
 * Static partials carry prototype hrefs plus data-route hints; rewrite them
 * so the same markup works in both environments.
 */
export function applyRoutes(root = document) {
  qsa('a[data-route]', root).forEach((a) => {
    const { route, slug, path, locale } = a.dataset;
    const fn = routes[route];
    if (!fn) return;
    const arg = slug ?? path ?? locale;
    const href = fn(arg);
    if (typeof href === 'string') a.setAttribute('href', href);
  });
}

/** Rewrite links inside CMS text (news, blog, product descriptions). */
export function localizeLinks(root) {
  qsa('a[href^="/"]', root).forEach((a) => {
    const href = resolve(a.getAttribute('href'));
    a.setAttribute('href', href);
    if (isLive(href)) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

/** Which nav item is active for the current page. */
export function currentSection() {
  return document.body.dataset.page || 'home';
}
