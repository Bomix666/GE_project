/**
 * Product presentation. Data = the product's real page on globaleffects.ru
 * (description, specs, documents, photos, videos, "Рекомендуемые товары").
 * Buying uses the same actions as everywhere (existing cart contract).
 */
import { ready } from '../app.js';
import { qs, qsa, html, toHTML, esc, icon, formatPrice, plural } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes, localizeLinks, unlinkMissingProducts, pageParams } from '../core/routes.js';
import { getCatalog, getProduct, GROUP_TITLES } from '../data/api.js';
import { consumablesFor } from '../data/content.js';
import { availabilityBadge, buyAction, productCard } from '../components/product-card.js';
import { ytFacade, initYouTube } from '../components/youtube.js';
import { initRail } from '../components/rail.js';
import { cleanHTML } from '../core/sanitize.js';

ready(async () => {
  const main = qs('[data-product]');
  const slug = pageParams().get('p');
  let catalog;
  let product;
  try {
    if (!slug) throw new Error('No product in the URL');
    [catalog, product] = await Promise.all([getCatalog(), getProduct(slug)]);
  } catch {
    main.removeAttribute('aria-busy');
    main.innerHTML = `<section class="container pd-missing"><p class="eyebrow">Ошибка 404</p><h1 class="h1">Товар не найден</h1>
      <p class="lead">Возможно, ссылка устарела. Посмотрите похожие товары в каталоге.</p>
      <a class="btn btn--primary btn--lg" href="${routes.category('konfetti-masiny')}"><span class="btn__label">Перейти в каталог</span><span class="btn__icon" aria-hidden="true">${toHTML(icon('i-arrow', 20))}</span></a></section>`;
    return;
  }

  const base = catalog.byId.get(product.id) || {};
  const p = { ...base, ...product };
  const cat = catalog.categories.get(p.category);

  document.title = `${p.name} — купить в GLOBAL EFFECTS`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = `${p.name}${p.price ? ` — ${formatPrice(p.price)}` : ''}. ${cat ? cat.title : ''} в каталоге GLOBAL EFFECTS.`;

  renderHero(p, cat);
  renderGallery(p);
  renderSections(p, catalog);
  renderRails(p, catalog, cat);
  initBuyBar(p);
  main.removeAttribute('aria-busy');
  reveal();
});

function renderHero(p, cat) {
  qs('[data-crumbs]').innerHTML = `<li><a href="${routes.home()}">Главная</a></li>${
    cat ? `<li><span>${GROUP_TITLES[cat.group]}</span></li><li><a href="${routes.category(cat.slug)}">${esc(cat.title)}</a></li>` : ''
  }<li><span aria-current="page">${esc(p.name)}</span></li>`;

  qs('[data-pd-type]').textContent = p.type || (cat ? cat.title : '');
  qs('[data-pd-title]').textContent = p.name;
  qs('[data-pd-price]').textContent = p.price ? formatPrice(p.price) : 'Цена по запросу';
  qs('[data-pd-avail]').innerHTML = toHTML(availabilityBadge(p));

  const buy = qs('[data-pd-buy]');
  if (p.availability === 'in_stock' && p.price) {
    buy.innerHTML = toHTML(html`
      <div class="qty qty--lg" data-qty>
        <button type="button" class="qty__btn" data-qty-dec aria-label="Уменьшить количество">${icon('i-minus', 18)}</button>
        <input class="qty__input tabular" type="number" inputmode="numeric" min="1" max="999" value="1" aria-label="Количество" />
        <button type="button" class="qty__btn" data-qty-inc aria-label="Увеличить количество">${icon('i-plus', 18)}</button>
      </div>
      <button type="button" class="btn btn--primary btn--lg pd-add" data-add="${p.id}">
        <span class="btn__label" data-add-label>В корзину</span>
        <span class="btn__icon" aria-hidden="true">${icon('i-cart', 20)}${icon('i-cart', 20)}</span>
      </button>
      <button type="button" class="btn btn--secondary btn--lg" data-one-click="${p.id}">
        <span class="btn__label">Купить в 1 клик</span>
      </button>`);
  } else {
    buy.innerHTML = toHTML(buyAction(p, { size: 'lg', withQty: false }));
  }

  // Badges only when the product page itself states it
  const badges = [];
  if (/гаранти[яи][^.<]{0,24}3\s*год/i.test(p.description)) badges.push(['i-shield', 'Гарантия 3 года']);
  if (/GLOBAL EFFECTS/.test(p.name) && cat && cat.group === 'equipment') badges.push(['i-factory', 'Производство GLOBAL EFFECTS']);
  if (p.files && p.files.length) badges.push(['i-file', `${p.files.length} ${plural(p.files.length, ['документ', 'документа', 'документов'])}`]);
  qs('[data-pd-badges]').innerHTML = badges.map(([i, t]) => `<li>${toHTML(icon(i, 18))}<span>${t}</span></li>`).join('');

  const specs = (p.specs || []).slice(0, 6);
  qs('[data-pd-keyspecs]').innerHTML = specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  if (!specs.length) qs('[data-pd-keyspecs]').remove();
}

function renderGallery(p) {
  const photos = [{ full: p.image, thumb: p.thumb || p.image, main: true }, ...(p.gallery || [])];
  const stage = qs('[data-stage-img]');
  const count = qs('[data-stage-count]');
  const thumbs = qs('[data-thumbs]');
  let current = 0;

  const show = (i) => {
    current = i;
    const ph = photos[i];
    stage.classList.add('is-swapping');
    const img = new Image();
    img.onload = () => {
      stage.src = ph.full;
      stage.alt = i === 0 ? p.name : `${p.name} — фото ${i + 1}`;
      stage.classList.toggle('is-photo', !ph.main);
      stage.classList.remove('is-swapping');
    };
    img.src = ph.full;
    count.textContent = photos.length > 1 ? `${i + 1} / ${photos.length}` : '';
    qsa('[data-thumb]', thumbs).forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
  };

  thumbs.innerHTML = photos.length > 1
    ? photos
        .map(
          (ph, i) =>
            `<li><button type="button" class="pd-thumb" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="Фото ${i + 1} из ${photos.length}"><img src="${esc(ph.thumb)}" alt="" width="96" height="96" loading="lazy"></button></li>`,
        )
        .join('')
    : '';
  thumbs.addEventListener('click', (e) => {
    const b = e.target.closest('[data-thumb]');
    if (b) show(Number(b.dataset.thumb));
  });
  thumbs.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (current + (e.key === 'ArrowRight' ? 1 : -1) + photos.length) % photos.length;
    show(next);
    qsa('[data-thumb]', thumbs)[next].focus();
  });

  qs('[data-zoom]').addEventListener('click', (e) =>
    import('../components/lightbox.js').then((m) =>
      m.openLightbox(photos.map((ph, i) => ({ src: ph.full, alt: `${p.name} — фото ${i + 1}`, caption: p.name })), current, e.currentTarget),
    ),
  );

  stage.src = photos[0].full;
  stage.alt = p.name;
  count.textContent = photos.length > 1 ? `1 / ${photos.length}` : '';
}

function renderSections(p, catalog) {
  const sections = [];
  if (p.description) sections.push({ id: 'desc', title: 'Описание', open: true, body: `<div class="prose">${cleanHTML(p.description)}</div>` }); // CMS HTML → allowlist
  if (p.specs && p.specs.length)
    sections.push({
      id: 'specs',
      title: 'Характеристики',
      count: p.specs.length,
      open: true,
      body: `<dl class="specs">${p.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`,
    });
  if (p.files && p.files.length)
    sections.push({
      id: 'docs',
      title: 'Документация',
      count: p.files.length,
      body: `<ul class="docs" role="list">${p.files
        .map(
          (f) =>
            `<li><a class="doc" href="${esc(routes.doc(f.url))}" target="_blank" rel="noopener">${toHTML(icon('i-file', 22))}<span>${esc(f.title)}</span>${toHTML(icon('i-download', 18))}</a></li>`,
        )
        .join('')}</ul>`,
    });
  if (p.videos && p.videos.length)
    sections.push({
      id: 'video',
      title: 'Видео',
      count: p.videos.length,
      body: `<ul class="pd-videos" role="list">${p.videos
        // poster = product photo: no third-party request before the viewer presses play
        .map((id) => `<li>${ytFacade(id, { thumb: (p.gallery && p.gallery[0] ? p.gallery[0].full : p.image), title: p.name, label: 'Видео' })}</li>`)
        .join('')}</ul>`,
    });
  if (p.gallery && p.gallery.length)
    sections.push({
      id: 'photos',
      title: 'Фото в работе',
      count: p.gallery.length,
      body: `<ul class="pd-photos" role="list">${p.gallery
        .map((g, i) => `<li><button type="button" class="pd-photo" data-photo="${i}" aria-label="Открыть фото ${i + 1}"><img src="${esc(g.thumb)}" alt="" width="255" height="255" loading="lazy"></button></li>`)
        .join('')}</ul>`,
    });

  qs('[data-toc]').innerHTML = `<p class="label">На странице</p><ul role="list">${sections
    .map((s) => `<li><a href="#pd-${s.id}">${s.title}${s.count ? ` <span class="tabular">${s.count}</span>` : ''}</a></li>`)
    .join('')}</ul>`;

  const root = qs('[data-sections]');
  root.innerHTML = sections
    .map(
      (s) => `<details class="pd-sec" id="pd-${s.id}" ${s.open ? 'open' : ''}>
        <summary class="pd-sec__sum"><h2 class="pd-sec__title">${s.title}${s.count ? ` <span class="tabular">${s.count}</span>` : ''}</h2>${toHTML(icon('i-plus', 22, 'pd-sec__icon'))}</summary>
        <div class="pd-sec__body">${s.body}</div>
      </details>`,
    )
    .join('');

  // Links inside CMS text → redesigned pages where they exist; discontinued products → plain text
  localizeLinks(root);
  unlinkMissingProducts(root, catalog.bySlug);

  // TOC opens the target section
  qs('[data-toc]').addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const target = document.getElementById(a.hash.slice(1));
    if (target && target.tagName === 'DETAILS') target.open = true;
  });

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-photo]');
    if (!b) return;
    import('../components/lightbox.js').then((m) =>
      m.openLightbox(p.gallery.map((g, i) => ({ src: g.full, alt: `${p.name} — фото ${i + 1}`, caption: p.name })), Number(b.dataset.photo), b),
    );
  });
  initYouTube(root);
}

function renderRails(p, catalog, cat) {
  const related = catalog.pick(p.related || []).filter((x) => x.id !== p.id);
  const relRoot = qs('[data-related]');
  if (related.length) {
    relRoot.hidden = false;
    qs('[data-rail-track]', relRoot).innerHTML = related.map((x) => `<li class="rail-item">${toHTML(productCard(x, { variant: 'rail' }))}</li>`).join('');
    initRail(relRoot);
  }

  const consCats = cat ? consumablesFor[cat.slug] : null;
  if (!consCats) return;
  const consRoot = qs('[data-consumables]');
  const seen = new Set(related.map((x) => x.id));
  const items = consCats
    .flatMap((slug) => catalog.productsIn(slug).filter((x) => x.availability === 'in_stock' && x.price))
    .filter((x) => !seen.has(x.id) && x.id !== p.id)
    .slice(0, 12);
  if (!items.length) return;
  consRoot.hidden = false;
  qs('[data-cons-title]').textContent = `Расходные материалы: ${consCats.map((s) => catalog.categories.get(s).title.toLowerCase()).join(', ')}`;
  qs('[data-rail-track]', consRoot).innerHTML = items.map((x) => `<li class="rail-item">${toHTML(productCard(x, { variant: 'rail' }))}</li>`).join('');
  initRail(consRoot);
}

function initBuyBar(p) {
  const bar = qs('[data-buybar]');
  const buy = qs('[data-pd-buy]');
  if (!bar || !buy) return;
  qs('[data-buybar-img]').src = p.thumb || p.image;
  qs('[data-buybar-name]').textContent = p.name;
  qs('[data-buybar-price]').textContent = p.price ? formatPrice(p.price) : 'Цена по запросу';
  qs('[data-buybar-action]').innerHTML = toHTML(buyAction(p, { size: 'md', withQty: false }));
  bar.hidden = false;

  new IntersectionObserver(
    ([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      bar.classList.toggle('is-on', past);
      bar.inert = !past;
    },
    { threshold: 0 },
  ).observe(buy);
  bar.inert = true;
}
