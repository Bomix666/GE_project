/**
 * Effects: pinned scene, 01 → 06.
 * Desktop: the visual (left) wipes to the next photo while the text (right)
 * crossfades in sync; scroll decides the step, time animates the change.
 * Mobile / reduced motion: a normal vertical list of the same articles.
 */
import { qs, qsa, html, raw, toHTML, icon, formatPrice, plural, debounce } from '../core/dom.js';
import { env, onBreakpointChange, onMotionPreferenceChange } from '../core/env.js';
import { scene, stepFromProgress, scrollToSceneProgress } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getCatalog } from '../data/api.js';
import { effects } from '../data/content.js';

export async function initEffects() {
  const root = qs('[data-effects]');
  if (!root) return;
  const stage = qs('[data-fx-stage]', root);
  const track = qs('[data-fx-track]', root);
  const nav = qs('[data-fx-nav]', root);

  let catalog = null;
  try {
    catalog = await getCatalog();
  } catch {
    /* render without live prices */
  }

  const n = effects.length;
  stage.style.setProperty('--n', n);
  track.innerHTML = effects.map((fx, i) => toHTML(step(fx, i, n, catalog))).join('');
  nav.innerHTML = effects
    .map(
      (fx, i) =>
        `<li><button type="button" class="fx-nav__item" data-fx-go="${i}"><span class="fx-nav__num tabular">${fx.num}</span><span class="fx-nav__name">${fx.short}</span></button></li>`,
    )
    .join('');

  const steps = qsa('[data-step]', track);
  const navItems = qsa('[data-fx-go]', nav);
  let current = -1;

  const setStep = (i) => {
    if (i === current) return;
    const dir = i > current ? 'down' : 'up';
    current = i;
    root.dataset.dir = dir;
    steps.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-before', k < i);
      s.classList.toggle('is-after', k > i);
    });
    navItems.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      if (k === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
    });
    root.style.setProperty('--step', i);
  };

  let handle = null;
  // pin only where the scene fits; otherwise the same articles read as a list
  const pinned = () => env.desktop && !env.reducedMotion && window.innerHeight >= 560;
  const mount = () => {
    const on = pinned();
    root.classList.toggle('is-pinned', on);
    if (on && !handle) {
      const keep = Math.max(0, current);
      current = -1; // force a clean state when coming back from list mode
      setStep(keep);
      handle = scene(stage, { mode: 'pin', onProgress: (p) => setStep(stepFromProgress(p, n, current)) });
    } else if (!on && handle) {
      handle.destroy();
      handle = null;
    }
    if (!on) steps.forEach((s) => {
      s.classList.add('is-active');
      s.classList.remove('is-before', 'is-after');
    });
  };
  mount();
  onBreakpointChange(mount);
  onMotionPreferenceChange(mount);
  window.addEventListener('resize', debounce(mount, 200), { passive: true });

  // Navigation + deep links (#fx-cryo)
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fx-go]');
    if (!b) return;
    goTo(Number(b.dataset.fxGo));
  });
  const goTo = (i) => {
    if (pinned()) scrollToSceneProgress(stage, (i + 0.5) / n);
    else steps[i].scrollIntoView({ behavior: env.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };
  // Keyboard / screen-reader users reaching an inactive step activate it
  track.addEventListener('focusin', (e) => {
    const s = e.target.closest('[data-step]');
    if (s && pinned() && Number(s.dataset.step) !== current) goTo(Number(s.dataset.step));
  });
  const fromHash = () => {
    const i = effects.findIndex((fx) => `#fx-${fx.slug}` === location.hash);
    if (i >= 0) requestAnimationFrame(() => goTo(i));
  };
  window.addEventListener('hashchange', fromHash);
  fromHash();
}

function step(fx, i, n, catalog) {
  const featured = catalog ? catalog.pick(fx.featured) : [];
  const eq = catalog ? catalog.categories.get(fx.equipment) : null;
  const cons = catalog ? catalog.categories.get(fx.consumables[0]) : null;
  const eqCount = eq ? eq.count : 0;
  const img = fx.image;

  return html`<article class="fx-step" id="fx-${fx.slug}" data-step="${i}" aria-labelledby="fx-${fx.slug}-title">
    <figure class="fx-step__media">
      <img src="${img.src}" srcset="${img.sm} 720w, ${img.src} ${img.w}w" sizes="(min-width: 1024px) 58vw, 100vw"
        width="${img.w}" height="${img.h}" alt="${img.alt}" ${raw(i === 0 ? '' : 'loading="lazy"')} decoding="async" />
      <span class="fx-step__bignum" aria-hidden="true">${fx.num}</span>
      <figcaption class="fx-step__cap"><span class="tabular">${fx.num} / ${String(n).padStart(2, '0')}</span>${fx.title}</figcaption>
    </figure>
    <div class="fx-step__body">
      <p class="fx-step__num" aria-hidden="true"><b>${fx.num}</b> <span>/ ${String(n).padStart(2, '0')}</span></p>
      <span class="fx-step__icon" aria-hidden="true">${icon(fx.icon, 36)}</span>
      <h3 class="fx-step__title" id="fx-${fx.slug}-title">${fx.title}</h3>
      <p class="fx-step__text">${fx.text}</p>
      <ul class="fx-step__facts" role="list">${fx.facts.map((f) => html`<li>${f}</li>`)}</ul>

      ${featured.length
        ? html`<div class="fx-step__equip">
            <p class="label">Оборудование${eqCount ? html` · <span class="tabular">${eqCount} ${plural(eqCount, ['модель', 'модели', 'моделей'])}</span>` : ''}</p>
            <ul class="mini-list" role="list">
              ${featured.map(
                (p) => html`<li><a class="mini" href="${routes.product(p.slug)}">
                  <img src="${p.thumb}" alt="" width="56" height="62" loading="lazy" />
                  <span class="mini__name">${p.name.replace(/^(.*?)(GLOBAL EFFECTS\s*)/, '$1').trim()}</span>
                  <span class="mini__price tabular">${p.price ? formatPrice(p.price) : 'По запросу'}</span>
                </a></li>`,
              )}
            </ul>
          </div>`
        : ''}

      <div class="fx-step__links">
        <a class="btn btn--primary btn--md" href="${routes.categoryFiltered(fx.equipment, fx.equipmentFilter)}">
          <span class="btn__label">Оборудование</span><span class="btn__icon" aria-hidden="true">${icon('i-arrow', 18)}</span>
        </a>
        ${cons
          ? html`<a class="btn btn--ghost" href="${routes.categoryFiltered(cons.slug, fx.consumablesFilter)}"><span class="btn__label">${cons.group === 'consumables' ? 'Расходники' : cons.title}</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>`
          : ''}
        <a class="btn btn--ghost" href="${routes.gallery(fx.gallery)}"><span class="btn__label">Фото</span><span class="btn__arrow" aria-hidden="true">${icon('i-arrow', 18)}</span></a>
      </div>
    </div>
  </article>`;
}
