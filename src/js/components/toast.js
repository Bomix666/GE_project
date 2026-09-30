/**
 * Non-blocking confirmations (e.g. "added to cart").
 * Lives in an aria-live="polite" region, never steals focus,
 * auto-dismisses after 4.5 s but pauses while hovered/focused.
 */
import { qs, esc } from '../core/dom.js';

const MAX = 3;

export function toast({ title, text = '', image = '', action, tone = 'default', timeout = 4500 }) {
  const region = qs('[data-toast-region]');
  if (!region) return;

  const el = document.createElement('div');
  el.className = `toast toast--${tone}`; // announced by the aria-live region, no extra role
  el.innerHTML = `
    ${image ? `<img class="toast__img" src="${esc(image)}" alt="" width="56" height="62" />` : '<span class="toast__mark" aria-hidden="true"></span>'}
    <div class="toast__body">
      <p class="toast__title">${esc(title)}</p>
      ${text ? `<p class="toast__text">${esc(text)}</p>` : ''}
      ${action ? `<button type="button" class="toast__action">${esc(action.label)}<svg width="16" height="16" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ''}
    </div>
    <button type="button" class="toast__close" aria-label="Закрыть уведомление"><svg width="18" height="18" aria-hidden="true"><use href="#i-close"/></svg></button>
    <span class="toast__timer" aria-hidden="true"></span>`;

  region.append(el);
  while (region.children.length > MAX) region.firstElementChild.remove();
  requestAnimationFrame(() => el.classList.add('is-in'));

  let remaining = timeout;
  let started = performance.now();
  let timer = setTimeout(dismiss, remaining);
  el.style.setProperty('--timeout', `${timeout}ms`);

  const pause = () => {
    clearTimeout(timer);
    remaining -= performance.now() - started;
    el.classList.add('is-paused');
  };
  const resume = () => {
    started = performance.now();
    clearTimeout(timer);
    timer = setTimeout(dismiss, Math.max(800, remaining));
    el.classList.remove('is-paused');
  };
  el.addEventListener('mouseenter', pause);
  el.addEventListener('mouseleave', resume);
  el.addEventListener('focusin', pause);
  el.addEventListener('focusout', resume);

  el.querySelector('.toast__close').addEventListener('click', dismiss);
  if (action) {
    el.querySelector('.toast__action').addEventListener('click', () => {
      action.onClick?.();
      dismiss();
    });
  }

  function dismiss() {
    clearTimeout(timer);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 260);
  }
  return dismiss;
}
