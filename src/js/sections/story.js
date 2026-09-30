/**
 * "Как рождается эффект": Effect → How → Equipment → Consumables → Result.
 * Desktop: vertical scroll drives a horizontal production line (pinned).
 * Mobile / reduced motion: the same panels stacked vertically.
 * Tabs switch between real chains (confetti, cryo).
 */
import { qs, qsa, html, toHTML, icon, formatPrice } from '../core/dom.js';
import { env, onBreakpointChange, onMotionPreferenceChange } from '../core/env.js';
import { scene, refreshScenes } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getCatalog, specValue } from '../data/api.js';
import { stories } from '../data/content.js';

export async function initStory() {
  const root = qs('[data-story]');
  if (!root) return;
  const stage = qs('[data-story-stage]', root);
  const track = qs('[data-story-track]', root);
  const steps = qs('[data-story-steps]', root);
  const tabs = qsa('[role="tab"]', root);

  let catalog = null;
  try {
    catalog = await getCatalog();
  } catch {
    /* static text still renders */
  }

  let active = 0;
  const render = (i) => {
    active = i;
    const story = stories[i];
    track.classList.add('is-swapping');
    const apply = () => {
      track.innerHTML = story.steps.map((s, k) => toHTML(panel(s, k, story, catalog))).join('');
      steps.innerHTML = story.steps
        .map((s, k) => `<li class="story-steps__item" data-story-step="${k}"><span class="tabular">${String(k + 1).padStart(2, '0')}</span>${s.label}</li>`)
        .join('');
      track.classList.remove('is-swapping');
      measure();
      refreshScenes();
    };
    if (track.children.length && !env.reducedMotion) setTimeout(apply, 260);
    else apply();
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
  };

  // Tabs (roving tabindex, arrow keys)
  tabs.forEach((t, k) => {
    t.addEventListener('click', () => k !== active && render(k));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      const next = (k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      render(next);
    });
  });

  // Horizontal distance → stage height
  const horizontal = () => env.desktop && !env.reducedMotion;
  const measure = () => {
    root.classList.toggle('is-horizontal', horizontal());
    if (!horizontal()) {
      stage.style.removeProperty('height');
      return;
    }
    const dist = Math.max(0, track.scrollWidth - window.innerWidth);
    stage.style.setProperty('--dist', dist);
    stage.style.height = `${window.innerHeight + dist}px`;
  };

  let handle = null;
  const mount = () => {
    measure();
    if (horizontal() && !handle) {
      handle = scene(stage, {
        mode: 'pin',
        onProgress: (p) => {
          const k = Math.min(stories[active].steps.length - 1, Math.floor(p * stories[active].steps.length * 0.999));
          qsa('[data-story-step]', steps).forEach((el, j) => {
            el.classList.toggle('is-active', j === k);
            el.classList.toggle('is-done', j < k);
          });
        },
      });
    } else if (!horizontal() && handle) {
      handle.destroy();
      handle = null;
    }
  };

  render(0);
  mount();
  window.addEventListener('resize', measure, { passive: true });
  onBreakpointChange(mount);
  onMotionPreferenceChange(mount);
}

function panel(s, k, story, catalog) {
  const num = String(k + 1).padStart(2, '0');
  const head = html`<p class="spanel__label"><span class="tabular">${num}</span>${s.label}</p>`;
  const connector = k < story.steps.length - 1 ? html`<span class="spanel__next" aria-hidden="true">${icon('i-arrow', 22)}</span>` : '';

  if (s.kind === 'effect' || s.kind === 'result') {
    return html`<article class="spanel spanel--${s.kind}" aria-label="${s.label}: ${s.title}">
      <figure class="spanel__media">
        <img src="${s.image.src}" width="${s.image.w}" height="${s.image.h}" alt="${s.image.alt}" loading="lazy" decoding="async" />
      </figure>
      <div class="spanel__overlay">
        ${head}
        <h3 class="spanel__title">${s.title}</h3>
        ${s.text ? html`<p class="spanel__text">${s.text}</p>` : ''}
        ${s.kind === 'result'
          ? html`<div class="spanel__actions">
              <a class="btn btn--primary btn--md" href="${routes.gallery(s.gallery)}"><span class="btn__label">Смотреть галерею</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
              <a class="btn btn--ghost" href="${routes.effect(story.slug)}"><span class="btn__label">К эффекту</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
            </div>`
          : ''}
      </div>
      ${connector}
    </article>`;
  }

  if (s.kind === 'how') {
    return html`<article class="spanel spanel--how" aria-label="${s.label}">
      ${head}
      <h3 class="spanel__title">${s.title}</h3>
      <p class="spanel__text">${s.text}</p>
      <dl class="specs">${s.specs.map(([a, b]) => html`<div><dt>${a}</dt><dd class="tabular">${b}</dd></div>`)}</dl>
      <p class="spanel__note text-3">${s.note}</p>
      ${connector}
    </article>`;
  }

  // equipment / consumables → real products
  let products = catalog ? catalog.pick(s.products || []) : [];
  if (catalog && s.productsQuery) {
    const q = s.productsQuery;
    products = catalog
      .productsIn(q.category)
      .filter((p) => specValue(p, q.spec[0]) === q.spec[1] && p.price)
      .slice(0, q.limit);
  }
  const cats = catalog ? (s.categories || [s.category]).map((c) => catalog.categories.get(c)).filter(Boolean) : [];

  return html`<article class="spanel spanel--${s.kind}" aria-label="${s.label}">
    ${head}
    <h3 class="spanel__title">${s.title}</h3>
    ${s.text ? html`<p class="spanel__text">${s.text}</p>` : ''}
    <ul class="spanel__products" role="list">
      ${products.map(
        (p) => html`<li class="sprod">
          <a class="sprod__link" href="${routes.product(p.slug)}">
            <img src="${p.thumb}" alt="" width="350" height="388" loading="lazy" decoding="async" />
            <span class="sprod__name">${p.name}</span>
            <span class="sprod__price tabular">${p.price ? formatPrice(p.price) : 'Цена по запросу'}</span>
          </a>
          ${p.availability === 'in_stock' && p.price
            ? html`<button type="button" class="sprod__add icon-btn" data-add="${p.id}" aria-label="В корзину: ${p.name}">${icon('i-plus', 18)}</button>`
            : ''}
        </li>`,
      )}
    </ul>
    <p class="spanel__cats">
      ${cats.map(
        (c) => html`<a class="chip" href="${routes.category(c.slug)}">${c.title} <span class="tabular">${c.count}</span></a>`,
      )}
    </p>
    ${connector}
  </article>`;
}
