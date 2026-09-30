/** News: list and article, from the live site's news feed. */
import { ready } from '../app.js';
import { qs, params } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getNews } from '../data/api.js';
import { renderList, renderArticle, renderMissing } from '../components/editorial.js';

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
        siblings: news.filter((n) => n.id !== id).slice(0, 4),
        siblingHref: (n) => routes.newsItem(n.id),
        cta: { text: 'Подберём оборудование и расходные материалы под вашу задачу.', label: 'Перейти в каталог', href: routes.category('konfetti-masiny') },
      });
  } else {
    root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
        <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><span aria-current="page">Новости</span></li></ol></nav>
        <div class="ed-hero__grid">
          <h1 class="ed-hero__title" id="ed-title" data-reveal="mask"><span class="line"><span>Новости</span></span></h1>
          <p class="lead" data-reveal>Новое оборудование, конфетти и снег, выставки и ответы на частые вопросы о спецэффектах.</p>
        </div>
      </div></section>
      <section class="ed-list"><div class="container" data-list></div></section>`;
    renderList(qs('[data-list]', root), news, { href: (n) => routes.newsItem(n.id), label: 'Все новости' });
  }
  root.removeAttribute('aria-busy');
  reveal();
});
