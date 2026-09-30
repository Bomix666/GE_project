/** Full-screen mobile navigation (<1100px). */
import { qs, qsa, lockScroll, unlockScroll } from '../core/dom.js';

export function initMobileMenu() {
  const button = qs('[data-mobile-open]');
  const menu = qs('[data-mobile-menu]');
  const header = qs('[data-header]');
  if (!button || !menu) return;

  const use = qs('use', button);
  let open = false;

  const set = (next) => {
    if (open === next) return;
    open = next;
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    use.setAttribute('href', open ? '#i-close' : '#i-menu');
    header.classList.toggle('has-open-menu', open);
    header.classList.toggle('has-mobile-menu', open);
    if (open) {
      menu.hidden = false;
      lockScroll();
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      unlockScroll();
      setTimeout(() => {
        if (!open) menu.hidden = true;
      }, 240);
    }
  };

  button.addEventListener('click', () => set(!open));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      set(false);
      button.focus();
    }
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) set(false);
  });

  // Keep focus inside header + menu while open
  document.addEventListener('focusin', (e) => {
    if (!open) return;
    if (!menu.contains(e.target) && !header.contains(e.target)) {
      const first = qsa('a, summary, button', menu)[0];
      first && first.focus();
    }
  });

  window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => e.matches && set(false));
}
