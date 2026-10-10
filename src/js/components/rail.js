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
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    const count = Math.max(1, Math.floor((track.clientWidth + gap) / step)); // n cards take n·step − gap
    track.scrollBy({ left: dir * step * count, behavior: env.reducedMotion ? 'auto' : 'smooth' });
  };

  prev && prev.addEventListener('click', () => page(-1));
  next && next.addEventListener('click', () => page(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });

  // Mouse drag for desktop: the track follows the pointer 1:1 (a threshold keeps
  // plain clicks working) and a flick carries on after release.
  let down = false;
  let pointerId = 0;
  let startX = 0;
  let startLeft = 0;
  let moved = false;
  let samples = []; // recent { t, left } while dragging → release velocity

  const stopDrag = () => {
    if (!down) return;
    down = false;
    if (!moved) return;
    setTimeout(() => (moved = false), 0); // the click that ends the drag is swallowed; later ones (keyboard) are not
    if (track.hasPointerCapture(pointerId)) track.releasePointerCapture(pointerId);
    const released = track.scrollLeft;
    track.classList.remove('is-dragging');
    // px/ms over the last ~100 ms (zero when the pointer rested before release); a flick
    // glides on from where it was released and the CSS snap, if any, picks the nearest stop
    const now = performance.now();
    const last = samples[samples.length - 1];
    const from = samples.find((s) => last.t - s.t <= 100);
    const speed = now - last.t < 80 && from && last.t > from.t ? (last.left - from.left) / (last.t - from.t) : 0;
    const glide = Math.abs(speed) > 0.15 ? Math.max(-1, Math.min(1, speed / 3)) * track.clientWidth * 0.6 : 0;
    track.scrollTo({ left: released + glide, behavior: env.reducedMotion ? 'auto' : 'smooth' });
  };

  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, input')) return;
    down = true;
    moved = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    samples = [];
    track.scrollTo({ left: track.scrollLeft, behavior: 'auto' }); // grab a track that is still gliding
  });
  window.addEventListener('pointermove', (e) => {
    if (!down || e.pointerId !== pointerId) return;
    if (e.buttons === 0) return stopDrag(); // released where no pointerup reached us
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) <= 6) return;
    if (!moved) {
      moved = true;
      track.classList.add('is-dragging');
      track.setPointerCapture(pointerId); // keeps the drag alive outside the track and the window
    }
    track.scrollLeft = startLeft - dx;
    samples.push({ t: e.timeStamp, left: track.scrollLeft });
    if (samples.length > 8) samples.shift();
  });
  window.addEventListener('pointerup', stopDrag);
  window.addEventListener('pointercancel', stopDrag);
  window.addEventListener('blur', stopDrag);
  // A drag must not turn into a native image/link drag or a text selection
  track.addEventListener('dragstart', (e) => e.preventDefault());
  track.addEventListener('selectstart', (e) => down && e.preventDefault());
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
