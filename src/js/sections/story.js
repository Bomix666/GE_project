/**
 * "Как рождается эффект": Effect → How → Equipment → Consumables → Preparation → Result.
 * A horizontal rail (the shared rail component): swiped on phones, scrolled or dragged
 * sideways on desktop; the red arrow on a panel brings the next step in.
 * The arrows by the tabs go to the previous / next effect.
 * Tabs switch between real chains (confetti, cryo, heavy smoke, snow, serpentine, curtain drop).
 */
import { qs, qsa, html, toHTML, icon, formatPrice } from '../core/dom.js';
import { env } from '../core/env.js';
import { routes } from '../core/routes.js';
import { getCatalog, specValue } from '../data/api.js';
import { stories } from '../data/content.js';
import { initRail } from '../components/rail.js';

export async function initStory() {
  const root = qs('[data-story]');
  if (!root) return;
  const track = qs('[data-story-track]', root);
  const tabs = qsa('[role="tab"]', root);
  const rail = initRail(root, { step: 'view' });

  let catalog = null;
  try {
    catalog = await getCatalog();
  } catch {
    /* static text still renders */
  }

  let active = 0;
  const prev = qs('[data-story-prev]', root);
  const next = qs('[data-story-next]', root);

  const render = (i) => {
    active = i;
    prev.disabled = i === 0;
    next.disabled = i === stories.length - 1;
    const story = stories[i];
    track.classList.add('is-swapping');
    const apply = () => {
      track.innerHTML = story.steps.map((s, k) => toHTML(panel(s, k, story, catalog))).join('');
      track.scrollLeft = 0;
      track.classList.remove('is-swapping');
      track.setAttribute('aria-labelledby', `story-tab-${i}`);
      rail.update();
    };
    if (track.children.length && !env.reducedMotion) setTimeout(apply, 260);
    else apply();
    tabs.forEach((t, k) => {
      t.setAttribute('aria-selected', String(k === i));
      t.tabIndex = k === i ? 0 : -1;
    });
    // on a phone the tab row scrolls: the chosen tab comes to its middle (the row only, never the page)
    const row = tabs[i].parentElement;
    const shift = tabs[i].getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - tabs[i].offsetWidth) / 2;
    row.scrollLeft += shift; // instant: a smooth scroll here is cut off by the panels being swapped
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

  prev.addEventListener('click', () => active > 0 && render(active - 1));
  next.addEventListener('click', () => active < stories.length - 1 && render(active + 1));

  // the red arrow of a panel: the next step comes to the start of the rail
  track.addEventListener('click', (e) => {
    const step = e.target.closest('[data-story-step]');
    if (!step) return;
    step.closest('.spanel').nextElementSibling?.scrollIntoView({ behavior: env.reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
  });

  render(0);
}

function panel(s, k, story, catalog) {
  const num = String(k + 1).padStart(2, '0');
  const head = html`<p class="spanel__label"><span class="tabular">${num}</span>${s.label}</p>`;
  const after = story.steps[k + 1];
  const connector = after ? html`<button type="button" class="spanel__next" data-story-step aria-label="Дальше: ${after.label}">${icon('i-arrow', 22)}</button>` : '';

  if (s.kind === 'effect' || s.kind === 'result') {
    return html`<article class="spanel spanel--${s.kind}" aria-label="${s.label}: ${s.title}">
      <figure class="spanel__media">
        <img src="${s.image.src}" width="${s.image.w}" height="${s.image.h}" alt="${s.image.alt}" loading="lazy" decoding="async" />
      </figure>
      <div class="spanel__overlay">
        ${head}
        <h3 class="spanel__title">${s.title}</h3>
        ${s.text ? html`<p class="spanel__text">${s.text}</p>` : ''}
        ${s.gallery
          ? html`<div class="spanel__actions">
              <a class="btn btn--primary btn--md" href="${routes.gallery(s.gallery)}"><span class="btn__label">Смотреть галерею</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
              <a class="btn btn--ghost" href="${routes.effect(story.effect || story.slug)}"><span class="btn__label">К эффекту</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
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
