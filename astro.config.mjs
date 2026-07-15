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
      // @astrojs/sitemap derives URLs from Astro's internal route model
      // (extensionless, e.g. /about, /stages), not from the literal .html
      // files build.format:'preserve' actually outputs. Rewrite each entry
      // to match what's actually served: the three directory-index pages
      // keep a trailing slash (/stages/, /production/, /work/, matching
      // their real canonical tags), every other non-root page gets .html
      // appended (matching its real canonical tag), and the homepage stays
      // bare. Without this, the sitemap disagreed with every page's own
      // <link rel="canonical">.
      serialize: (item) => {
        const url = new URL(item.url);
        const dirIndexes = ['/stages', '/production', '/work'];
        if (dirIndexes.includes(url.pathname)) {
          url.pathname = `${url.pathname}/`;
        } else if (url.pathname !== '/') {
          url.pathname = `${url.pathname}.html`;
        }
        return { ...item, url: url.toString() };
      },
    }),
  ],
});
