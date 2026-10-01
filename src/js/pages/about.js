/**
 * «О компании» — one page: 01 О компании · 02 Новости · 03 Наш блог · 04 Контакты и дилеры.
 * Built only from the live site's about/contacts content, news and blog.
 */
import { ready } from '../app.js';
import { qs, qsa, esc, icon, toHTML, plural } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { env } from '../core/env.js';
import { routes } from '../core/routes.js';
import { getNews, getBlog } from '../data/api.js';
import { services, dealers } from '../data/content.js';
import { renderList, renderBlogList } from '../components/editorial.js';

ready(() => {
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

  initPageNav();
  reveal();
  renderFeeds();
});

/** News and blog blocks: the same real data and article URLs as before, now inside this page. */
async function renderFeeds() {
  const newsRoot = qs('[data-ab-news]');
  const blogRoot = qs('[data-ab-blog]');
  const [news, posts] = await Promise.allSettled([getNews(), getBlog()]);

  if (news.status === 'fulfilled') {
    const n = news.value.length;
    qs('[data-news-count]').textContent = `${n} ${plural(n, ['публикация', 'публикации', 'публикаций'])}.`;
    renderList(newsRoot, news.value, { href: (x) => routes.newsItem(x.id), label: 'Все новости', pageSize: 8, level: 3 });
  } else newsRoot.innerHTML = '<p class="text-2">Не удалось загрузить новости. Обновите страницу.</p>';

  if (posts.status === 'fulfilled') renderBlogList(blogRoot, posts.value, { href: (x) => routes.blogPost(x.slug), level: 3, indexLimit: 4 });
  else blogRoot.innerHTML = '<p class="text-2">Не удалось загрузить материалы блога. Обновите страницу.</p>';

  newsRoot.removeAttribute('aria-busy');
  blogRoot.removeAttribute('aria-busy');
  reveal();

  // The feeds changed the page height: land on the requested block again (/about.html#blog)
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.compareDocumentPosition(newsRoot) & Node.DOCUMENT_POSITION_PRECEDING) {
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}

/** Sticky anchor navigation that highlights the block being read. */
function initPageNav() {
  const nav = qs('[data-abnav]');
  const list = qs('.abnav__list', nav);
  const links = qsa('.abnav__link', nav);
  const blocks = links.map((a) => document.getElementById(a.hash.slice(1)));
  let current = -1;

  const update = () => {
    const line = Math.max(nav.getBoundingClientRect().bottom + 32, innerHeight * 0.3);
    let i = 0;
    blocks.forEach((b, k) => {
      if (b && b.getBoundingClientRect().top <= line) i = k;
    });
    if (i === current) return;
    current = i;
    links.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    // On phones the list scrolls sideways: keep the active item in view
    const a = links[i];
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: a.offsetLeft - (list.clientWidth - a.offsetWidth) / 2, behavior: env.reducedMotion ? 'auto' : 'smooth' });
    }
  };

  let frame = 0;
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()));
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}
