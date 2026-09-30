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

const PAGES = ['index', 'catalog', 'product', 'gallery', 'about', 'cart', 'offers', 'news', 'blog', 'page'];

export default defineConfig({
  plugins: [htmlPartials()],
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
