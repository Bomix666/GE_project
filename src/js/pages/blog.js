/** Blog: list and article, from the live site's blog. */
import { ready } from '../app.js';
import { qs, params } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { routes } from '../core/routes.js';
import { getBlog } from '../data/api.js';
import { renderList, renderArticle, renderMissing } from '../components/editorial.js';

const back = { href: routes.blog(), label: 'Блог', all: 'Все статьи' };

ready(async () => {
  const root = qs('[data-ed-root]');
  const posts = await getBlog();
  const slug = params().get('p');

  if (slug) {
    const post = posts.find((x) => x.slug === slug);
    if (!post) renderMissing(root, { title: 'Статья не найдена', back });
    else
      renderArticle(root, post, {
        eyebrow: 'Блог',
        back,
        siblings: posts.filter((x) => x.slug !== slug).slice(0, 5),
        siblingHref: (x) => routes.blogPost(x.slug),
        cta: { text: 'Остались вопросы по оборудованию? Позвоните: +7 (499) 650-50-78.', label: 'Позвонить', href: 'tel:+74996505078' },
      });
  } else {
    root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
        <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><span aria-current="page">Блог</span></li></ol></nav>
        <div class="ed-hero__grid">
          <h1 class="ed-hero__title" id="ed-title" data-reveal="mask"><span class="line"><span>Наш <span class="accent">блог</span></span></span></h1>
          <p class="lead" data-reveal>Здесь мы рассказываем о нашей компании и делимся знаниями и опытом работы с нашим оборудованием для спецэффектов.</p>
        </div>
      </div></section>
      <section class="ed-list"><div class="container" data-list></div></section>`;
    renderList(qs('[data-list]', root), posts, { href: (x) => routes.blogPost(x.slug), label: 'Все статьи', pageSize: 24 });
  }
  root.removeAttribute('aria-busy');
  reveal();
});
