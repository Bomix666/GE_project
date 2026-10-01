/** Новости — official company news, part of the «О компании» section. */
import { ready } from '../app.js';
import { qs, params, plural } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes } from '../core/routes.js';
import { getNews } from '../data/api.js';
import { renderList, renderArticle, renderMissing } from '../components/editorial.js';
import { sectionNav } from '../components/section-nav.js';

const back = { href: routes.newsList(), label: 'Новости', all: 'Все новости' };

ready(async () => {
  const root = qs('[data-ed-root]');
  const news = await getNews();
  const id = Number(params().get('id'));

  if (id) {
    const i = news.findIndex((n) => n.id === id);
    if (i < 0) renderMissing(root, { title: 'Новость не найдена', back });
    else
      renderArticle(root, news[i], {
        eyebrow: 'Новости',
        back,
        section: 'news',
        siblings: news.filter((n) => n.id !== id).slice(0, 4),
        siblingHref: (n) => routes.newsItem(n.id),
        cta: { text: 'Подберём оборудование и расходные материалы под вашу задачу.', label: 'Перейти в каталог', href: routes.category('konfetti-masiny') },
      });
  } else {
    root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
        <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><a href="${routes.about()}">О компании</a></li><li><span aria-current="page">Новости</span></li></ol></nav>
        ${sectionNav('news')}
        <div class="ed-hero__grid">
          <h1 class="ed-hero__title" id="ed-title" data-reveal="mask" data-fit><span class="line"><span>Новости</span></span></h1>
          <p class="lead" data-reveal>Официальные новости GLOBAL EFFECTS: новое оборудование, конфетти и снег, выставки. ${news.length} ${plural(news.length, ['публикация', 'публикации', 'публикаций'])}.</p>
        </div>
      </div></section>
      <section class="ed-list"><div class="container" data-list></div></section>`;
    renderList(qs('[data-list]', root), news, { href: (n) => routes.newsItem(n.id), label: 'Все новости' });
  }
  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
