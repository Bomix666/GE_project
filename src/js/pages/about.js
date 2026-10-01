/** About: editorial story built only from the live site's about/contacts content. */
import { ready } from '../app.js';
import { qs, qsa, esc, icon, toHTML, plural } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { clients, clientTasks, services, equipmentValues, dealers } from '../data/content.js';
import { mountSectionNav } from '../components/section-nav.js';

ready(() => {
  mountSectionNav();
  qs('[data-clients]').innerHTML = clients.map((c) => `<li>${esc(c)}</li>`).join('');
  qs('[data-tasks]').innerHTML = clientTasks.map((t) => `<li>${esc(t)}</li>`).join('');

  qs('[data-services]').innerHTML = services
    .map(
      (o, i) => `<li class="service">
        <p class="service__num tabular">${String(i + 1).padStart(2, '0')}</p>
        <h3 class="service__title">${esc(o.title)}</h3>
        <ul class="service__list" role="list">${o.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <a class="btn btn--ghost" href="${o.link.arg ? routes[o.link.route](o.link.arg) : routes[o.link.route]()}"><span class="btn__label">${esc(o.link.label)}</span><span class="btn__arrow" aria-hidden="true">${toHTML(icon('i-arrow', 18))}</span></a>
      </li>`,
    )
    .join('');

  qs('[data-values]').innerHTML = equipmentValues
    .map((v) => `<li class="value"><span class="value__icon" aria-hidden="true">${toHTML(icon(v.icon, 28))}</span><h3 class="value__title">${esc(v.title)}</h3><p class="text-2">${esc(v.text)}</p></li>`)
    .join('');

  // Dealers grouped by city (real list from /contacts)
  const byCity = dealers.reduce((m, d) => m.set(d.city, [...(m.get(d.city) || []), d]), new Map());
  qs('[data-cities]').innerHTML = [...byCity.entries()]
    .map(
      ([city, list]) => `<section class="city" aria-labelledby="city-${esc(city)}">
        <header class="city__head"><h3 class="city__name" id="city-${esc(city)}">${esc(city)}</h3><span class="label tabular">${list.length} ${plural(list.length, ['точка', 'точки', 'точек'])}</span></header>
        <ul class="dealers" role="list">${list
          .map(
            (d) => `<li class="dealer">
              <p class="dealer__name">${esc(d.name)}</p>
              <p class="dealer__type">${esc(d.type)}</p>
              <p class="dealer__addr">${esc(d.address)}</p>
              <a class="dealer__phone tabular" href="tel:${d.phone.replace(/[^\d+]/g, '').replace(/^8/, '+7')}">${esc(d.phone)}</a>
              ${d.hours ? `<p class="dealer__hours text-3">${esc(d.hours)}</p>` : ''}
              ${d.site ? `<a class="dealer__site" href="https://${esc(d.site)}" target="_blank" rel="noopener">${esc(d.site)}</a>` : ''}
            </li>`,
          )
          .join('')}</ul>
      </section>`,
    )
    .join('');

  // Sticky visual follows the step crossing the viewport centre
  const frames = qsa('[data-ab-frame]');
  const num = qs('[data-ab-num]');
  const steps = qsa('[data-ab-step]');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const i = steps.indexOf(e.target);
        frames.forEach((f, k) => f.classList.toggle('is-active', k === i));
        steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
        num.textContent = String(i + 1).padStart(2, '0');
      }),
    { rootMargin: '-50% 0px -50% 0px' },
  );
  steps.forEach((s) => io.observe(s));

  reveal();
});
