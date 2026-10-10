/**
 * YouTube facade: a poster button until the viewer asks for the video.
 * No third-party requests before interaction (performance + privacy).
 *   <button class="yt" data-yt="VIDEO_ID" data-title="…"><img …></button>
 */
import { esc } from '../core/dom.js';

export function ytFacade(id, { thumb, title = 'Видео GLOBAL EFFECTS', label = '' } = {}) {
  return `<div class="yt" data-yt-wrap>
    <button type="button" class="yt__btn" data-yt="${esc(id)}" data-title="${esc(title)}" aria-label="Смотреть видео: ${esc(title)}">
      <img class="yt__img" src="${esc(thumb)}" alt="" loading="lazy" decoding="async" width="960" height="540">
      <span class="yt__play" aria-hidden="true"><svg width="22" height="22"><use href="#i-play"/></svg></span>
      ${label ? `<span class="yt__label">${esc(label)}</span>` : ''}
    </button>
  </div>`;
}

export function initYouTube(root = document) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-yt]');
    if (!btn || !root.contains(btn)) return;
    const wrap = btn.closest('[data-yt-wrap]');
    const iframe = document.createElement('iframe');
    iframe.className = 'yt__frame';
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(btn.dataset.yt)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.title = btn.dataset.title || 'Видео';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    wrap.classList.add('is-playing');
    wrap.replaceChildren(iframe);
    iframe.focus();
  });
}
