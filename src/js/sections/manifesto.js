/**
 * Manifesto: the company's own line, lit word by word as it scrolls in,
 * plus real key facts with a short count-up.
 */
import { qs, qsa, plural } from '../core/dom.js';
import { env } from '../core/env.js';
import { scene, segment } from '../core/motion.js';
import { getCatalog } from '../data/api.js';
import { dealers } from '../data/content.js';

export function initManifesto() {
  const root = qs('[data-manifesto]');
  if (!root) return;

  const text = qs('[data-words]', root);
  if (text) {
    const full = text.textContent.trim();
    const words = full.split(/\s+/);
    // Screen readers get the sentence once; the animated words are decorative
    text.innerHTML =
      `<span class="visually-hidden">${full}</span>` +
      words
        .map((w, i) => `<span class="w${i === words.length - 1 ? ' w--accent' : ''}" aria-hidden="true" style="--i:${i}">${w}</span>`)
        .join(' ');
    text.style.setProperty('--n', words.length);
    if (env.reducedMotion) text.style.setProperty('--mp', 1);
    else
      scene(root, {
        mode: 'through',
        prop: '--mp-raw',
        onProgress: (p) => text.style.setProperty('--mp', segment(p, 0.12, 0.5).toFixed(3)),
      });
  }

  // Real counts computed from data (not hard-coded marketing numbers)
  getCatalog()
    .then((catalog) => {
      const products = qs('[data-fact="products"]', root);
      if (products) {
        products.dataset.to = catalog.products.length;
        const label = products.parentElement.querySelector('[data-fact-label]');
        if (label) label.textContent = `${plural(catalog.products.length, ['позиция', 'позиции', 'позиций'])} в каталоге`;
      }
      const cities = qs('[data-fact="cities"]', root);
      if (cities) {
        const n = new Set(dealers.map((d) => d.city)).size;
        cities.dataset.to = n;
        const label = cities.parentElement.querySelector('[data-fact-label]');
        if (label) label.textContent = `${plural(n, ['город', 'города', 'городов'])} с шоу-румами и дилерами`;
      }
      qsa('[data-count-up]', root).forEach(countUp);
    })
    .catch(() => qsa('[data-count-up]', root).forEach(countUp));
}

function countUp(el) {
  const to = Number(el.dataset.to || el.textContent);
  if (!Number.isFinite(to)) return;
  if (env.reducedMotion) {
    el.textContent = to;
    return;
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const from = Number(el.dataset.from || 0);
      const start = performance.now();
      const dur = 1100;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    { threshold: 0.6 },
  );
  io.observe(el);
}
