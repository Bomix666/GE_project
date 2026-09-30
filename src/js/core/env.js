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

export function onBreakpointChange(cb) {
  desktopQuery.addEventListener('change', cb);
}

html.classList.add('js');
if (reducedQuery.matches) html.classList.add('reduce-motion');
reducedQuery.addEventListener('change', (e) => html.classList.toggle('reduce-motion', e.matches));
