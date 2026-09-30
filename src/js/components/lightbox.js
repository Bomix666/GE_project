/**
 * Photo lightbox: buttons + arrow keys + swipe, counter, caption.
 * Every gesture has a visible button alternative.
 */
import { esc } from '../core/dom.js';
import { createDialog } from './dialog.js';

let dialog;
let items = [];
let index = 0;

export function openLightbox(list, start = 0, trigger) {
  items = list;
  index = start;
  if (!dialog) setup();
  render();
  dialog.show(trigger);
}

function setup() {
  dialog = createDialog({ className: 'dlg--lightbox dlg--fullbleed', label: 'Просмотр фотографий' });
  dialog.setContent(`
    <div class="lb">
      <div class="lb__top">
        <p class="lb__counter tabular" aria-live="polite" data-lb-counter></p>
        <p class="lb__caption" data-lb-caption></p>
        <button type="button" class="icon-btn lb__close" data-dialog-close aria-label="Закрыть просмотр"><svg width="24" height="24" aria-hidden="true"><use href="#i-close"/></svg></button>
      </div>
      <figure class="lb__stage" data-lb-stage>
        <img class="lb__img" data-lb-img alt="">
      </figure>
      <button type="button" class="lb__nav lb__nav--prev icon-btn" data-lb-prev aria-label="Предыдущее фото"><svg width="26" height="26" aria-hidden="true"><use href="#i-arrow-left"/></svg></button>
      <button type="button" class="lb__nav lb__nav--next icon-btn" data-lb-next aria-label="Следующее фото"><svg width="26" height="26" aria-hidden="true"><use href="#i-arrow"/></svg></button>
    </div>`);

  const el = dialog.el;
  el.querySelector('[data-lb-prev]').addEventListener('click', () => go(-1));
  el.querySelector('[data-lb-next]').addEventListener('click', () => go(1));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });

  // Swipe with a movement threshold
  const stage = el.querySelector('[data-lb-stage]');
  let x0 = null;
  stage.addEventListener('pointerdown', (e) => (x0 = e.clientX));
  stage.addEventListener('pointerup', (e) => {
    if (x0 == null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  });
}

function go(step) {
  index = (index + step + items.length) % items.length;
  render();
}

function render() {
  const el = dialog.el;
  const item = items[index];
  const img = el.querySelector('[data-lb-img]');
  img.classList.remove('is-in');
  img.onload = () => img.classList.add('is-in');
  img.src = item.src;
  img.alt = item.alt || '';
  if (item.w) {
    img.width = item.w;
    img.height = item.h;
  }
  el.querySelector('[data-lb-counter]').textContent = `${index + 1} / ${items.length}`;
  el.querySelector('[data-lb-caption]').innerHTML = esc(item.caption || '');
  const single = items.length < 2;
  el.querySelectorAll('.lb__nav').forEach((b) => (b.hidden = single));
  // Preload neighbours
  [1, -1].forEach((d) => {
    const n = items[(index + d + items.length) % items.length];
    if (n) new Image().src = n.src;
  });
}
