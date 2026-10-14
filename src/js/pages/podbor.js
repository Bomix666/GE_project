/**
 * «Подбор конфетти-машин» (/category/podbor-konfetti-mashin): the five questions of the live quiz.
 * The machines that fit are shown right under the form and follow every change of the answers.
 */
import { ready } from '../app.js';
import { qs, qsa, esc, toHTML, plural, announce } from '../core/dom.js';
import { env } from '../core/env.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes } from '../core/routes.js';
import { getCatalog } from '../data/api.js';
import { company, picker, pickMachines } from '../data/content.js';
import { productCard } from '../components/product-card.js';

ready(async () => {
  const root = qs('[data-ed-root]');
  const catalog = await getCatalog();
  const cat = catalog.categories.get(picker.category);
  const machines = catalog.productsIn(picker.category);

  root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
      <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="${routes.home()}">Главная</a></li><li><a href="${routes.category(cat.slug)}">${esc(cat.title)}</a></li><li><span aria-current="page">Подбор</span></li></ol></nav>
      <div class="ed-hero__grid">
        <h1 class="ed-hero__title" id="ed-title" data-reveal="mask" data-fit><span class="line"><span>Подбор</span></span><span class="line"><span class="accent">конфетти-машин</span></span></h1>
        <p class="lead text-2" data-reveal>${esc(picker.lead)}</p>
      </div>
    </div></section>
    <div class="container pick">
      <form class="pick__form" data-pick-form>
        ${picker.questions
          .map(
            (q, i) => `<fieldset class="pick__q" data-reveal>
          <legend class="pick__legend"><span class="pick__num tabular">${String(i + 1).padStart(2, '0')}</span>${esc(q.text)}</legend>
          <p class="pick__hint text-3">${esc(q.hint)}</p>
          <div class="pick__opts">${q.options
            .map(
              (o) => `<label class="check"><input type="${q.multiple ? 'checkbox' : 'radio'}" name="q${i}" value="${esc(o)}"><span class="check__box" aria-hidden="true"></span><span class="check__label">${esc(o)}</span></label>`,
            )
            .join('')}</div>
        </fieldset>`,
          )
          .join('')}
        <div class="pick__actions">
          <button type="submit" class="btn btn--primary btn--lg"><span class="btn__label">Подобрать</span><span class="btn__icon" aria-hidden="true"><svg width="20" height="20"><use href="#i-arrow"/></svg></span></button>
          <button type="reset" class="btn btn--ghost"><span class="btn__label">Сбросить ответы</span></button>
        </div>
      </form>
      <section class="pick__result" data-pick-result aria-labelledby="pick-result-title" hidden>
        <h2 class="h2" id="pick-result-title" data-pick-count tabindex="-1"></h2>
        <div class="pgrid" data-pick-grid></div>
        <p class="pick__note text-2" data-pick-note></p>
      </section>
    </div>`;

  const form = qs('[data-pick-form]', root);
  const result = qs('[data-pick-result]', root);
  const answers = () =>
    Object.fromEntries(picker.questions.map((q, i) => [q.key, qsa(`[name="q${i}"]:checked`, form).map((x) => x.value)]));
  const consult = `Для профессиональной консультации позвоните нам по телефону <a href="${company.phoneHref}">${esc(company.phone)}</a> или напишите на e-mail <a href="mailto:${company.email}">${esc(company.email)}</a>.`;

  const render = () => {
    const a = answers();
    if (!Object.values(a).some((v) => v.length)) {
      result.hidden = true;
      return;
    }
    const fit = pickMachines(machines, a);
    result.hidden = false;
    qs('[data-pick-count]', result).textContent = fit.length
      ? `Подходят ${fit.length} ${plural(fit.length, ['машина', 'машины', 'машин'])}`
      : 'Под эти ответы нет машины';
    qs('[data-pick-grid]', result).innerHTML = fit.map((p) => toHTML(productCard(p, { categoryTitle: cat.title }))).join('');
    qs('[data-pick-note]', result).innerHTML = fit.length ? consult : `Уберите часть ответов или позвоните — подберём вместе. ${consult}`;
    reveal();
    return fit.length;
  };

  form.addEventListener('change', render);
  form.addEventListener('reset', () => setTimeout(render)); // the inputs clear after the event
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = render();
    if (n === undefined) {
      announce('Выберите хотя бы один ответ');
      qs('input', form).focus();
      return;
    }
    qs('[data-pick-count]', result).focus({ preventScroll: true });
    result.scrollIntoView({ behavior: env.reducedMotion ? 'auto' : 'smooth', block: 'start' });
  });

  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
