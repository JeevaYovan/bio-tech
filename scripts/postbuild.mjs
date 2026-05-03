/**
 * Postbuild — GitHub Pages compatibility layer.
 *
 * After `ng build`, ensure the static output at dist/rathika/browser
 * has:
 *   - 404.html  (SPA fallback for any unprerendered URL)
 *   - .nojekyll (prevents GitHub Pages from running Jekyll)
 *   - CNAME     (custom domain rathika.in)
 *
 * .nojekyll and CNAME come from /public/ via Angular's asset pipeline,
 * so this script is mostly belt-and-braces.
 */

import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist/rathika/browser');

if (!existsSync(DIST)) {
  console.error(`[postbuild] ${DIST} not found. Did the build succeed?`);
  process.exit(1);
}

const indexHtml = join(DIST, 'index.html');
const notFoundHtml = join(DIST, '404.html');
if (existsSync(indexHtml)) {
  copyFileSync(indexHtml, notFoundHtml);
  console.log(`[postbuild] 404.html ← index.html (SPA fallback)`);
} else {
  console.warn(`[postbuild] index.html missing — skipping 404.html copy`);
}

const nojekyll = join(DIST, '.nojekyll');
if (!existsSync(nojekyll)) {
  writeFileSync(nojekyll, '');
  console.log(`[postbuild] Wrote .nojekyll`);
}

const cname = join(DIST, 'CNAME');
if (!existsSync(cname)) {
  writeFileSync(cname, 'rathika.in');
  console.log(`[postbuild] Wrote CNAME → rathika.in`);
}

console.log(`[postbuild] OK — ${DIST}`);
