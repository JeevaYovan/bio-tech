/**
 * Generate sitemap.xml for the prerendered build.
 *
 * Walks dist/rathika/browser/ for every directory containing an
 * index.html (which is what Angular's static prerender produces per
 * route), turns each into a canonical URL, and writes a clean
 * sitemap.xml at the build root.
 *
 * Run via npm run postbuild — invoked automatically after `ng build`.
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const SITE_ORIGIN = 'https://rathika.in';
const DIST = 'dist/rathika/browser';

async function findRoutes(dir, base = '') {
  const out = [];
  const entries = await readdir(dir);
  if (entries.includes('index.html')) {
    const path = base === '' ? '/' : `/${base}/`;
    out.push(path);
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory() && !entry.startsWith('.') && entry !== 'assets') {
      const sub = await findRoutes(full, base ? `${base}/${entry}` : entry);
      out.push(...sub);
    }
  }
  return out;
}

const routes = await findRoutes(DIST);
const today = new Date().toISOString().slice(0, 10);

const urls = routes
  .sort()
  .map((path) => {
    const loc = `${SITE_ORIGIN}${path}`;
    const priority = path === '/' ? '1.0' : path.startsWith('/products/') && path !== '/products/' ? '0.6' : '0.8';
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

await writeFile(`${DIST}/sitemap.xml`, xml, 'utf8');
console.log(`[sitemap] Wrote ${DIST}/sitemap.xml with ${routes.length} URLs`);
