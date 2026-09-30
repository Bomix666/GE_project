/**
 * Smart background video.
 *  - attaches the source only when near the viewport (lazy);
 *  - never loads on reduced-motion / save-data, or on small screens unless
 *    data-mobile="true";
 *  - pauses offscreen and in background tabs;
 *  - reports failure so the caller keeps the poster / photo reel.
 *
 * Markup:
 *   <video muted playsinline loop preload="none" poster="…"
 *          data-src="/media/hero-global-effects.mp4"
 *          data-src-mobile="/media/hero-global-effects-720.mp4"></video>
 */
import { env } from './env.js';

export function smartVideo(video, { onReady, onFail } = {}) {
  const src = !env.desktop && video.dataset.srcMobile ? video.dataset.srcMobile : video.dataset.src;
  const allowMobile = env.desktop || Boolean(video.dataset.srcMobile) || video.dataset.mobile === 'true';

  if (!src || env.reducedMotion || env.saveData || !allowMobile || !video.canPlayType('video/mp4')) {
    onFail?.('skipped');
    return { play() {}, pause() {} };
  }

  let loaded = false;
  let visible = false;

  const play = () => {
    if (!loaded || document.hidden || !visible) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  video.muted = true;
  video.playsInline = true;

  video.addEventListener(
    'canplay',
    () => {
      video.classList.add('is-ready');
      onReady?.();
      play();
    },
    { once: true },
  );
  video.addEventListener(
    'error',
    () => {
      io.disconnect();
      onFail?.('error');
    },
    { once: true },
  );

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !loaded) {
        loaded = true;
        video.src = src;
        video.load();
      } else if (visible) {
        play();
      } else {
        video.pause();
      }
    },
    { rootMargin: '200px 0px' },
  );
  io.observe(video);

  document.addEventListener('visibilitychange', () => (document.hidden ? video.pause() : play()));

  return { play, pause: () => video.pause() };
}
