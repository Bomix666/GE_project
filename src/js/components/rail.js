/**
 * Horizontal rail on native scroll (scroll-snap, trackpad, touch swipe),
 * with prev/next buttons and a progress bar. No scroll-jacking.
 * Root gets .is-scrollable / .at-start / .at-end for edge fades and arrows.
 *   step: 'items' — page by whole cards (product rails)
 *         'view'  — page by 80% of the visible width (chip rows)
 */
import { qs, rafThrottle } from '../core/dom.js';
import { env } from '../core/env.js';

export function initRail(root, { step: stepMode = 'items' } = {}) {
  const track = qs('[data-rail-track]', root);
  const prev = qs('[data-rail-prev]', root);
  const next = qs('[data-rail-next]', root);
  const bar = qs('[data-rail-progress]', root);
  if (!track) return;

  const update = rafThrottle(() => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 0;
    if (bar) bar.style.transform = `scaleX(${Math.max(0.08, p)})`;
    if (prev) prev.disabled = track.scrollLeft < 4;
    if (next) next.disabled = track.scrollLeft > max - 4;
    root.classList.toggle('is-scrollable', max > 4);
    root.classList.toggle('at-start', track.scrollLeft < 4);
    root.classList.toggle('at-end', track.scrollLeft > max - 4);
  });

  const page = (dir) => {
    if (stepMode === 'view') {
      track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: env.reducedMotion ? 'auto' : 'smooth' });
      return;
    }
    const item = track.firstElementChild;
    const step = item ? item.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
    const count = Math.max(1, Math.floor(track.clientWidth / step));
    track.scrollBy({ left: dir * step * count, behavior: env.reducedMotion ? 'auto' : 'smooth' });
  };

  prev && prev.addEventListener('click', () => page(-1));
  next && next.addEventListener('click', () => page(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });

  // Mouse drag for desktop (with threshold so clicks still work)
  let down = false;
  let startX = 0;
  let startLeft = 0;
  let moved = false;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('button, input')) return;
    down = true;
    moved = false;
    startX = e.clientX;
    startLeft = track.scrollLeft;
  });
  window.addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 6) {
      moved = true;
      track.classList.add('is-dragging');
      track.scrollLeft = startLeft - dx;
    }
  });
  window.addEventListener('pointerup', () => {
    down = false;
    track.classList.remove('is-dragging');
  });
  track.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );

  update();
  return { update };
}
