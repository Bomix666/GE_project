/**
 * «О компании» is one section: О компании · Новости · Наш блог.
 * The same secondary navigation sits on each of its pages.
 */
import { routes } from '../core/routes.js';

const ITEMS = [
  { key: 'about', label: 'О компании', href: () => routes.about() },
  { key: 'news', label: 'Новости', href: () => routes.newsList() },
  { key: 'blog', label: 'Наш блог', href: () => routes.blog() },
];

export function sectionNav(active) {
  return `<nav class="secnav" aria-label="Раздел «О компании»">
    <p class="secnav__label">О компании</p>
    <ul class="secnav__list" role="list">${ITEMS.map(
      (it) =>
        `<li><a class="secnav__link" href="${it.href()}" ${it.key === active ? 'aria-current="page"' : ''}>${it.label}</a></li>`,
    ).join('')}</ul>
  </nav>`;
}

/** Fill a static placeholder: <div data-section-nav="news"></div> */
export function mountSectionNav(root = document) {
  root.querySelectorAll('[data-section-nav]').forEach((el) => {
    el.outerHTML = sectionNav(el.dataset.sectionNav);
  });
}
