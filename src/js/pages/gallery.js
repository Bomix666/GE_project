/** Gallery: real photo/video galleries of globaleffects.ru, filterable by effect. */
import { ready } from '../app.js';
import { qs, esc, params, plural, announce } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getGallery } from '../data/api.js';
import { effects } from '../data/content.js';
import { ytFacade, initYouTube } from '../components/youtube.js';

// Size rhythm for the editorial mosaic (repeats every 9 tiles)
const RHYTHM = ['xl', 's', 's', 'm', 'm', 'tall', 's', 'wide', 's'];

ready(async () => {
  const galleries = await getGallery();
  const filter = qs('[data-gal-filter]');
  let current = params().get('cat') || 'all';
  if (current !== 'all' && !galleries.some((g) => g.slug === current)) current = 'all';

  const total = (key) => galleries.reduce((s, g) => s + g[key].length, 0);
  filter.innerHTML = [
    `<button type="button" class="chip" data-cat="all" aria-pressed="${current === 'all'}">Все <span class="tabular">${total('photos')}</span></button>`,
    ...galleries
      .filter((g) => g.photos.length || g.videos.length)
      .map(
        (g) =>
          `<button type="button" class="chip" data-cat="${g.slug}" aria-pressed="${current === g.slug}">${esc(g.title)} <span class="tabular">${g.photos.length || g.videos.length}</span></button>`,
      ),
  ].join('');

  const render = () => {
    const list = current === 'all' ? galleries : galleries.filter((g) => g.slug === current);
    // studio shots on white backgrounds never take the large editorial slots
    const photos = list
      .flatMap((g) => g.photos.map((ph) => ({ ...ph, cat: g.title, slug: g.slug })))
      .sort((a, b) => Number(a.studio) - Number(b.studio));
    const videos = list.flatMap((g) => g.videos.map((v) => ({ ...v, cat: g.title })));

    qs('[data-photo-count]').textContent = photos.length || '';
    qs('[data-video-count]').textContent = videos.length || '';

    qs('[data-mosaic]').innerHTML = photos.length
      ? photos
          .map(
            (ph, i) => `<li class="mosaic__item mosaic__item--${ph.studio ? 's' : RHYTHM[i % RHYTHM.length]}">
              <button type="button" class="mosaic__btn" data-open="${i}" aria-label="Открыть фото ${i + 1}: ${esc(ph.cat)}">
                <img src="${ph.thumb}" srcset="${ph.thumb} 520w, ${ph.src} ${ph.w}w" sizes="(min-width: 1024px) 40vw, 50vw" alt="" width="${ph.w}" height="${ph.h}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async">
                <span class="mosaic__cap">${esc(ph.cat)}</span>
              </button>
            </li>`,
          )
          .join('')
      : `<li class="empty"><p class="text-2">Для этого эффекта в галерее пока только видео.</p></li>`;

    qs('[data-vlist]').innerHTML = videos.length
      ? videos.map((v) => `<li>${ytFacade(v.id, { thumb: v.thumb, title: `${v.cat} — видео GLOBAL EFFECTS`, label: v.cat })}</li>`).join('')
      : `<li class="empty"><p class="text-2">Видео для этого раздела нет.</p></li>`;

    // Link from the gallery back into the catalog (effect → equipment)
    const fx = effects.find((e) => e.gallery === current);
    const link = qs('[data-gal-catalog]');
    link.hidden = !fx;
    if (fx) {
      link.href = routes.category(fx.equipment);
      qs('[data-gal-catalog-label]').textContent = `Оборудование: ${fx.title.toLowerCase()}`;
    }

    qs('[data-mosaic]').onclick = (e) => {
      const b = e.target.closest('[data-open]');
      if (!b) return;
      import('../components/lightbox.js').then((m) =>
        m.openLightbox(photos.map((ph) => ({ src: ph.src, w: ph.w, h: ph.h, caption: ph.cat, alt: `Фото из галереи: ${ph.cat}` })), Number(b.dataset.open), b),
      );
    };
    reveal();
    return photos.length;
  };

  filter.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    current = b.dataset.cat;
    filter.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const url = new URL(location.href);
    if (current === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', current);
    history.replaceState(null, '', url);
    const n = render();
    announce(`${n} ${plural(n, ['фотография', 'фотографии', 'фотографий'])}`);
  });

  render();
  initYouTube(qs('[data-vlist]'));
});
