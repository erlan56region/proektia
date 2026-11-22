import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { readdirSync, cpSync, existsSync } from 'node:fs';

// The ТОК furniture site lives in ./mebel and is a self-contained static site
// (its own CSS, JS modules and images). It is also part of this repo's build:
// `npm run build` emits root pages plus dist/mebel, so the site is published
// under /mebel/ on GitHub Pages. `npm run dev:mebel` serves only that site.
const mebelDir = resolve(import.meta.dirname, 'mebel');
const mebelPages = Object.fromEntries(
  readdirSync(mebelDir)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [`mebel-${f.replace('.html', '')}`, resolve(mebelDir, f)])
);

// Images are referenced from data modules, so Rollup cannot discover them:
// copy the source folder next to the built pages.
const copyMebelImages = () => ({
  name: 'copy-mebel-images',
  closeBundle() {
    const from = resolve(mebelDir, 'images');
    const to = resolve(import.meta.dirname, 'dist', 'mebel', 'images');
    if (existsSync(from)) cpSync(from, to, { recursive: true });
  },
});

export default defineConfig({
  // Relative assets keep the build portable under /proektia/ or any subfolder.
  base: './',
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  plugins: [copyMebelImages()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        editor: resolve(import.meta.dirname, 'editor.html'),
        ...mebelPages,
      },
    },
  },
});
