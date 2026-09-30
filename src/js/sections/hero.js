/**
 * Hero: video-first, photo-reel fallback, cinematic scroll-out.
 *
 *  1. Tries /media/hero-global-effects.mp4 (drop the real file in, done).
 *  2. Until then — or on mobile / reduced motion / save-data — plays a
 *     slow crossfade of real event photos (auto-rotation has pause control).
 *  3. While pinned, --p (0→1) darkens and scales the media, lifts the
 *     headline away and draws the red line that leads into the next scene.
 */
import { qs, qsa } from '../core/dom.js';
import { env } from '../core/env.js';
import { scene } from '../core/motion.js';
import { smartVideo } from '../core/video.js';

const FRAME_MS = 6500;

export function initHero() {
  const hero = qs('[data-hero]');
  if (!hero) return;

  const frames = qsa('[data-hero-frame]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const pauseBtn = qs('[data-hero-pause]', hero);
  const video = qs('[data-hero-video]', hero);
  let current = 0;
  let timer = null;
  let paused = env.reducedMotion;

  const show = (i) => {
    current = (i + frames.length) % frames.length;
    frames.forEach((f, k) => f.classList.toggle('is-active', k === current));
    dots.forEach((d, k) => {
      d.classList.toggle('is-active', k === current);
      d.setAttribute('aria-current', k === current ? 'true' : 'false');
    });
  };
  const schedule = () => {
    clearTimeout(timer);
    if (!paused && hero.dataset.mode !== 'video') timer = setTimeout(() => (show(current + 1), schedule()), FRAME_MS);
  };
  const setPaused = (v) => {
    paused = v;
    hero.classList.toggle('is-paused', paused);
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', paused ? 'Продолжить смену кадров' : 'Остановить смену кадров');
      qs('use', pauseBtn).setAttribute('href', paused ? '#i-play' : '#i-pause');
    }
    schedule();
  };

  dots.forEach((d, k) =>
    d.addEventListener('click', () => {
      show(k);
      schedule();
    }),
  );
  pauseBtn && pauseBtn.addEventListener('click', () => setPaused(!paused));
  // Stop rotation while the user reads/uses the hero with the keyboard
  hero.addEventListener('focusin', (e) => {
    if (!e.target.closest('[data-hero-dot],[data-hero-pause]')) clearTimeout(timer);
  });
  hero.addEventListener('focusout', schedule);
  document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : schedule()));

  show(0);
  setPaused(paused);

  if (video) {
    smartVideo(video, {
      onReady: () => {
        hero.dataset.mode = 'video';
        clearTimeout(timer);
      },
      onFail: () => {
        hero.dataset.mode = 'reel';
        video.remove();
      },
    });
  }

  // Cinematic scroll-out
  const stage = qs('[data-hero-stage]', hero);
  if (stage) scene(stage, { mode: 'pin' });

  // Photos load progressively: mark frames when decoded (no flash of empty)
  frames.forEach((f) => {
    const img = qs('img', f);
    if (!img) return;
    if (img.complete) f.classList.add('is-loaded');
    else img.addEventListener('load', () => f.classList.add('is-loaded'), { once: true });
  });
}
