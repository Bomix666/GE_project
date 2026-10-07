/**
 * Runtime environment flags.
 *
 * PRODUCTION = the redesign is served by the existing Yii2 site (globaleffects.ru).
 * In that mode links resolve to real routes and the cart talks to the real endpoints.
 * Otherwise we are the standalone prototype (vite dev / static preview).
 */
const html = document.documentElement;

export const PRODUCTION =
  html.dataset.env === 'production' || /(^|\.)globaleffects\.ru$/.test(location.hostname);

export const ORIGIN = 'https://globaleffects.ru';

/**
 * Where the prototype is served from: '/' locally, '/GE_project/' on GitHub Pages
 * (vite build --base). Root-relative prototype URLs go through withBase().
 */
export const BASE = import.meta.env.BASE_URL;
export const withBase = (path) => (BASE !== '/' && path.startsWith('/') && !path.startsWith('//') ? BASE + path.slice(1) : path);

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
const desktopQuery = window.matchMedia('(min-width: 1024px)');

export const env = {
  get reducedMotion() {
    return reducedQuery.matches;
  },
  get finePointer() {
    return finePointerQuery.matches;
  },
  get desktop() {
    return desktopQuery.matches;
  },
  get saveData() {
    return Boolean(navigator.connection && navigator.connection.saveData);
  },
};

export function onMotionPreferenceChange(cb) {
  reducedQuery.addEventListener('change', cb);
}

html.classList.add('js');
if (reducedQuery.matches) html.classList.add('reduce-motion');
reducedQuery.addEventListener('change', (e) => html.classList.toggle('reduce-motion', e.matches));
