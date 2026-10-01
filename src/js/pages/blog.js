/** «Наш блог» — the company's editorial section, part of «О компании». */
import { ready } from '../app.js';
import { qs, params } from '../core/dom.js';
import { reveal } from '../core/motion.js';
import { fitAll } from '../core/fit.js';
import { routes } from '../core/routes.js';
import { getBlog } from '../data/api.js';
import { renderBlogList, renderArticle, renderMissing } from '../components/editorial.js';
import { sectionNav } from '../components/section-nav.js';

const back = { href: routes.blog(), label: 'Наш блог', all: 'Все материалы блога' };

ready(async () => {
  const root = qs('[data-ed-root]');
  const posts = await getBlog();
  const slug = params().get('p');

  if (slug) {
    const post = posts.find((x) => x.slug === slug);
    if (!post) renderMissing(root, { title: 'Материал не найден', back });
    else {
      renderArticle(root, post, {
        eyebrow: 'Наш блог',
        back,
        section: 'blog',
        siblings: posts.filter((x) => x.slug !== slug).slice(0, 5),
        siblingHref: (x) => routes.blogPost(x.slug),
        cta: { text: 'Остались вопросы по оборудованию? Позвоните нам:', label: '+7 (499) 650-50-78', href: 'tel:+74996505078', icon: 'i-phone' },
      });
      document.title = `${post.title} — Наш блог GLOBAL EFFECTS`;
    }
  } else {
    root.innerHTML = `<section class="ed-hero" aria-labelledby="ed-title"><div class="container">
        <nav aria-label="Хлебные крошки"><ol class="crumbs" role="list"><li><a href="/">Главная</a></li><li><a href="${routes.about()}">О компании</a></li><li><span aria-current="page">Наш блог</span></li></ol></nav>
        ${sectionNav('blog')}
        <div class="ed-hero__grid">
          <h1 class="ed-hero__title" id="ed-title" data-reveal="mask" data-fit><span class="line"><span>Наш <span class="accent">блог</span></span></span></h1>
          <p class="lead" data-reveal>Здесь мы рассказываем о нашей компании и делимся знаниями и опытом работы с нашим оборудованием для спецэффектов.</p>
        </div>
      </div></section>
      <section class="ed-list"><div class="container" data-list></div></section>`;
    renderBlogList(qs('[data-list]', root), posts, { href: (x) => routes.blogPost(x.slug) });
  }
  root.removeAttribute('aria-busy');
  reveal();
  fitAll();
});
