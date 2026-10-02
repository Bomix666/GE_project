/** Новости — a single news article. The list itself is a block of the «О компании» page. */
import { ready } from '../app.js';
import { qs } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes, pageParams } from '../core/routes.js';
import { getNews } from '../data/api.js';
import { renderArticle, renderMissing } from '../components/editorial.js';

const back = { href: routes.newsList(), label: 'Новости', all: 'Все новости' };

ready(async () => {
  const id = Number(pageParams().get('id'));
  if (!id) {
    location.replace(routes.newsList());
    return;
  }

  const root = qs('[data-ed-root]');
  const news = await getNews();
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
  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
