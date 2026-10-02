import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

/**
 * <!-- @include file.html --> → contents of src/partials/file.html.
 * Mirrors Yii layout partials (header/footer/icons) without a template engine.
 */
function htmlPartials() {
  const dir = resolve(__dirname, 'src/partials');
  return {
    name: 'ge-html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace(/<!--\s*@include\s+([\w.-]+)\s*-->/g, (_, file) => readFileSync(resolve(dir, file), 'utf8')),
    },
    handleHotUpdate({ file, server }) {
      if (file.split('\\').join('/').includes('/src/partials/')) server.ws.send({ type: 'full-reload' });
    },
  };
}

/**
 * Built with a base (GitHub Pages preview: --base=/GE_project/, Yii: e.g. --base=/redesign/),
 * Vite rebases its own bundles; this rebases the remaining root-relative URLs
 * (page links, data-src, poster, srcset). GE_PREVIEW=1 also keeps the static
 * preview out of search engines. With the default base '/' it changes nothing.
 */
function deployBase() {
  let base = '/';
  const rebase = (url) => (url.startsWith('/') && !url.startsWith('//') && !url.startsWith(base) ? base + url.slice(1) : url);
  return {
    name: 'ge-deploy-base',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (base === '/') return html;
        const out = html
          .replace(/(\s(?:href|src|data-src|data-src-mobile|poster)=")([^"]*)"/g, (_, attr, url) => `${attr}${rebase(url)}"`)
          .replace(/(\ssrcset=")([^"]*)"/g, (_, attr, set) => `${attr}${set.split(',').map((c) => c.trim().replace(/^\S+/, rebase)).join(', ')}"`);
        if (!process.env.GE_PREVIEW || out.includes('name="robots"')) return out;
        return out.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>');
      },
    },
  };
}

/**
 * Dev and preview only: the live-site routes open on the template that will
 * render them in Yii (npm run dev → http://127.0.0.1:5173/product/<slug>).
 * The path stays in the address bar, so pages read it like on the real site.
 */
function liveRoutes() {
  const map = [
    [/^\/product\/[^/?#]+/, 'product.html'],
    [/^\/category\/[^/?#]+/, 'catalog.html'],
    [/^\/news\/view(?=[/?#]|$)/, 'news.html'],
    [/^\/blog\/[^/?#]+/, 'blog.html'],
    [/^\/page\/about(?=[/?#]|$)/, 'about.html'],
    [/^\/page\/[^/?#]+/, 'page.html'],
    [/^\/gallery\/(?:images|videos)(?:\/[^/?#]+)?/, 'gallery.html'],
    [/^\/cart(?:\/index)?(?=[?#]|$)/, 'cart.html'],
    [/^\/contacts(?=[?#]|$)/, 'about.html'],
  ];
  const rewrite = (req, _res, next) => {
    const hit = map.find(([re]) => re.test(req.url));
    if (hit) {
      const query = req.url.indexOf('?');
      req.url = `/${hit[1]}${query >= 0 ? req.url.slice(query) : ''}`;
    }
    next();
  };
  return {
    name: 'ge-live-routes',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

const PAGES = ['index', 'catalog', 'product', 'gallery', 'about', 'cart', 'news', 'blog', 'page', '404'];

export default defineConfig({
  plugins: [htmlPartials(), deployBase(), liveRoutes()],
  build: {
    target: 'es2020',
    // dist/.vite/manifest.json: page entry → hashed JS/CSS, for the Yii asset bundle
    manifest: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: Object.fromEntries(
        PAGES.filter((p) => existsSync(resolve(__dirname, `${p}.html`))).map((p) => [p, resolve(__dirname, `${p}.html`)]),
      ),
    },
  },
  server: { host: '127.0.0.1', port: 5173, strictPort: false },
  preview: { host: '127.0.0.1', port: 4173 },
});
