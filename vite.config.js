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
 * GitHub Pages serves the prototype from /<repo>/ (vite build --base=/GE_project/).
 * Vite rebases its own bundles; this rebases the remaining root-relative URLs
 * (page links, data-src, poster, srcset) and keeps the preview out of search
 * engines. With the default base '/' (dev, regular build) it changes nothing.
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
        return out.includes('name="robots"') ? out : out.replace('</head>', '  <meta name="robots" content="noindex, nofollow" />\n  </head>');
      },
    },
  };
}

const PAGES = ['index', 'catalog', 'product', 'gallery', 'about', 'cart', 'news', 'blog', 'page'];

export default defineConfig({
  plugins: [htmlPartials(), deployBase()],
  build: {
    target: 'es2020',
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
