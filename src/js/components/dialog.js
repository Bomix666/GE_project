/**
 * Accessible modal built on native <dialog>:
 *  - showModal() gives focus containment, Esc and inert background;
 *  - enter/exit animation via .is-open (exit ≈ 65% of enter);
 *  - scroll lock, focus return to the opener, backdrop click closes.
 */
import { lockScroll, unlockScroll } from '../core/dom.js';

export function createDialog({ className = '', labelledBy, label, onClose } = {}) {
  const dlg = document.createElement('dialog');
  dlg.className = `dlg ${className}`.trim();
  if (labelledBy) dlg.setAttribute('aria-labelledby', labelledBy);
  if (label) dlg.setAttribute('aria-label', label);
  document.body.append(dlg);

  let opener = null;
  let closing = false;

  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    api.close();
  });

  // Click on the ::backdrop area (target is the dialog element itself)
  dlg.addEventListener('mousedown', (e) => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside || dlg.classList.contains('dlg--fullbleed')) api.close();
  });

  dlg.addEventListener('click', (e) => {
    if (e.target.closest('[data-dialog-close]')) api.close();
  });

  const api = {
    el: dlg,
    get open() {
      return dlg.open;
    },
    show(trigger) {
      if (dlg.open) return;
      opener = trigger || document.activeElement;
      closing = false;
      lockScroll();
      dlg.showModal();
      requestAnimationFrame(() => dlg.classList.add('is-open'));
      const auto = dlg.querySelector('[autofocus], [data-autofocus]');
      if (auto) auto.focus({ preventScroll: true });
    },
    close() {
      if (!dlg.open || closing) return;
      closing = true;
      dlg.classList.remove('is-open');
      const dur = parseFloat(getComputedStyle(dlg).getPropertyValue('--exit')) || 220;
      setTimeout(() => {
        dlg.close();
        unlockScroll();
        closing = false;
        if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
        onClose?.();
      }, document.documentElement.classList.contains('reduce-motion') ? 0 : dur);
    },
    setContent(markup) {
      dlg.innerHTML = markup;
    },
  };
  return api;
}
