/** «Наш блог» — a single material. The list itself is a block of the «О компании» page. */
import { ready } from '../app.js';
import { qs } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes, pageParams } from '../core/routes.js';
import { getBlog } from '../data/api.js';
import { renderArticle, renderMissing } from '../components/editorial.js';

const back = { href: routes.blog(), label: 'Наш блог', all: 'Все материалы блога' };

ready(async () => {
  const slug = pageParams().get('p');
  if (!slug) {
    location.replace(routes.blog());
    return;
  }

  const root = qs('[data-ed-root]');
  const posts = await getBlog();
  const post = posts.find((x) => x.slug === slug);
  if (!post) renderMissing(root, { title: 'Материал не найден', back });
  else {
    renderArticle(root, post, {
      eyebrow: 'Наш блог',
      back,
      siblings: posts.filter((x) => x.slug !== slug).slice(0, 5),
      siblingHref: (x) => routes.blogPost(x.slug),
      cta: { text: 'Остались вопросы по оборудованию? Позвоните нам:', label: '+7 (499) 650-50-78', href: 'tel:+74996505078', icon: 'i-phone' },
    });
    document.title = `${post.title} — Наш блог GLOBAL EFFECTS`;
  }
  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
