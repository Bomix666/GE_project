/**
 * Chapter rail: fixed vertical index of the page's scenes (01 … 0N),
 * active chapter in red + thin progress line. Desktop only (≥1200px).
 * Chapters are <section data-chapter="Название">.
 */
import { qsa, esc } from '../core/dom.js';

export function initChapterRail() {
  const chapters = qsa('[data-chapter]');
  if (chapters.length < 3) return;

  const nav = document.createElement('nav');
  nav.className = 'rail';
  nav.setAttribute('aria-label', 'Разделы страницы');
  nav.innerHTML = `<ol class="rail__list" role="list">${chapters
    .map((c, i) => {
      if (!c.id) c.id = `chapter-${i + 1}`;
      const num = String(i + 1).padStart(2, '0');
      return `<li><a class="rail__link" href="#${c.id}" data-rail="${i}"><span class="rail__num tabular">${num}</span><span class="rail__name">${esc(c.dataset.chapter)}</span></a></li>`;
    })
    .join('')}</ol><span class="rail__line" aria-hidden="true"><span class="rail__fill"></span></span>`;
  document.body.append(nav);

  const links = qsa('[data-rail]', nav);
  const fill = nav.querySelector('.rail__fill');
  const total = chapters.length;

  // Fill the numbering in every section's chapter marker ("02 / 07")
  chapters.forEach((c, i) => {
    const marker = c.querySelector('[data-chapter-num]');
    if (marker) marker.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(total).padStart(2, '0')}`;
  });

  const setActive = (i) => {
    links.forEach((l, k) => {
      l.classList.toggle('is-active', k === i);
      if (k === i) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    fill.style.transform = `scaleY(${(i + 1) / total})`;
    // hidden on the hero and over full-bleed horizontal scenes
    nav.classList.toggle('is-visible', i > 0 && !('railHide' in chapters[i].dataset));
  };

  // A zero-height line at the viewport centre: the chapter crossing it is
  // active. Works for tall pinned scenes as well as short sections.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(chapters.indexOf(e.target));
      });
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );
  chapters.forEach((c) => io.observe(c));
  setActive(0);
}
