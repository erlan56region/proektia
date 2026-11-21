import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // Relative assets keep the build portable under /proektia/ on GitHub Pages.
  base: './',
  server: { host: '0.0.0.0', allowedHosts: true },
  preview: { host: '0.0.0.0', allowedHosts: true },
  build: { rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), editor: resolve(import.meta.dirname, 'editor.html') } } }
});
