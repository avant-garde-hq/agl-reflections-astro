// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://reflectionsproductions.com',
  build: { format: 'preserve' },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.endsWith('/404.html') && !page.includes('apex-5040-3d'),
    }),
  ],
});
