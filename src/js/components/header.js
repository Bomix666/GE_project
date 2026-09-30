/**
 * Header: transparent over the hero → solid dark bar on scroll.
 * Hides while scrolling down through long cinematic content, returns on any
 * upward scroll, on focus inside it, or while a menu is open.
 */
import { qs, qsa } from '../core/dom.js';
import { currentSection } from '../core/routes.js';

export function initHeader() {
  const header = qs('[data-header]');
  if (!header) return;

  const hasHero = Boolean(qs('[data-hero]'));
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const threshold = hasHero ? window.innerHeight * 0.35 : 8;
    header.dataset.state = y > threshold ? 'solid' : 'top';

    const menuOpen = header.classList.contains('has-open-menu');
    const focusInside = header.contains(document.activeElement);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (menuOpen || focusInside || y < window.innerHeight) header.dataset.hidden = 'false';
    else if (goingDown) header.dataset.hidden = 'true';
    else if (goingUp) header.dataset.hidden = 'false';
    lastY = y;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  header.addEventListener('focusin', () => (header.dataset.hidden = 'false'));
  update();

  // Active section
  const section = currentSection();
  qsa('[data-nav]', header).forEach((link) => {
    const active = link.dataset.nav === section;
    link.classList.toggle('is-active', active);
    if (active && link.tagName === 'A') link.setAttribute('aria-current', 'page');
  });

  // Keyboard shortcut hint differs per platform
  const kbd = qs('.header__kbd', header);
  if (kbd && /Mac|iPhone|iPad/.test(navigator.platform)) kbd.title = '/ или ⌘K';
}
