/**
 * Fit display headings to their box: long uppercase words («КРИОЭФФЕКТЫ»,
 * «ИСКУССТВЕННЫЙ») must never be split mid-word on narrow screens.
 * Only shrinks — the CSS clamp() size stays the maximum.
 *
 *   <h1 data-fit>…</h1>   fitted on load, on font load and on resize
 *   fitHeading(el)        call after changing the text
 */
import { debounce } from './dom.js';

const MIN_PX = 20;

export function fitHeading(el) {
  if (!el) return;
  el.style.fontSize = '';
  // mask-reveal lines clip their overflow, so measure them as well
  const boxes = [el, ...el.querySelectorAll('.line')];
  const overflows = () => boxes.some((b) => b.scrollWidth > b.clientWidth + 1);
  let size = parseFloat(getComputedStyle(el).fontSize);
  for (let i = 0; i < 20 && overflows() && size > MIN_PX; i++) {
    size = Math.max(MIN_PX, size * 0.95);
    el.style.fontSize = `${size}px`;
  }
}

let bound = false;

export function fitAll(root = document) {
  root.querySelectorAll('[data-fit]').forEach(fitHeading);
  if (bound) return;
  bound = true;
  const refit = debounce(() => document.querySelectorAll('[data-fit]').forEach(fitHeading), 120);
  window.addEventListener('resize', refit, { passive: true });
  if (document.fonts) document.fonts.ready.then(refit);
}
