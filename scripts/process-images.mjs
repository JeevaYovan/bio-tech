/**
 * Image processing — converts raw inputs/ photos into web-optimized
 * AVIF + WebP + JPEG triplets at multiple widths under src/assets/.
 *
 * Manifest below maps each source file (verified to exist by Phase 2
 * discovery) to a destination slug + the widths to generate. Originals
 * stay in inputs/ (gitignored). Outputs commit to src/assets/.
 *
 * Run: npm run images
 */

import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const INPUTS = 'inputs';
const ASSETS = 'public/assets';

/**
 * Each entry produces (widths × formats) output files.
 * @type {Array<{src: string, dst: string, widths: number[], note?: string}>}
 */
const MANIFEST = [
  // --- Brand ---
  {
    src: 'Logo.jpeg',
    dst: 'brand/logo',
    widths: [64, 128, 256],
    note: 'Brand mark — small sizes; PNG fallback (alpha-safe)',
  },

  // --- Hero (LCP — must be small + high quality) ---
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.18 PM.jpeg',
    dst: 'lifestyle/hero-tea-cup-haystack',
    widths: [768, 1280],
    note: 'Hero — tea cup beside haystack at golden hour (image #5). Source caps at 1024×1024 — 1920w would be a duplicate.',
  },

  // --- Story / About-style imagery ---
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.22 PM (1).jpeg',
    dst: 'lifestyle/story-fiber-texture',
    widths: [600, 800, 1200],
    note: 'Macro of natural fiber texture (image #13). 800w added for DPR=2 mobile to avoid the 1200w download.',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.24 PM.jpeg',
    dst: 'lifestyle/parcel-food-use-case',
    widths: [600, 1200],
    note: 'Parcel box with curry — use-case shot (image #19)',
  },

  // --- Featured product photos for Home (top 6) ---
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.18 PM (1).jpeg',
    dst: 'products/tea-cup-100ml',
    widths: [400, 800],
    note: 'Tea cup 100 ml — three cups stacked (image #4)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.20 PM (2).jpeg',
    dst: 'products/parcel-box-300ml',
    widths: [400, 800],
    note: 'Parcel box 300 ml round (image #8)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.19 PM.jpeg',
    dst: 'products/partition-10x12',
    widths: [400, 800],
    note: 'Partition plate 10x12 — stack with embossed logo (image #6)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.21 PM (2).jpeg',
    dst: 'products/rectangle-box-300ml',
    widths: [400, 800],
    note: 'Rectangle box with spoon (image #11)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.20 PM (1).jpeg',
    dst: 'products/spoon-5in',
    widths: [400, 800],
    note: 'Spoon 5 inch — row of nested spoons (image #7)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.20 PM.jpeg',
    dst: 'products/vinayagar-statue-6in',
    widths: [400, 800],
    note: 'Vinayagar statue 6 inch — in bagasse bowl (image #9)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.23 PM (2).jpeg',
    dst: 'products/ice-cream-bowl-4in',
    widths: [400, 800],
    note: 'Ice cream bowl 4 inch — multi-color showcase composition (image #16)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.25 PM.jpeg',
    dst: 'products/normal-plate',
    widths: [400, 800],
    note: 'Normal plate — round flat plates stacked workshop interior (image #22)',
  },

  // --- Workshop gallery (about page) ---
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.21 PM (1).jpeg',
    dst: 'workshop/nested-plates-spoons',
    widths: [400, 800],
    note: 'Nested square plates with two spoons centered (image #10)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.21 PM.jpeg',
    dst: 'workshop/square-box-four-spoons',
    widths: [400, 800],
    note: 'Square box with four spoons radiating outward (image #12)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.23 PM.jpeg',
    dst: 'workshop/bowls-cluster-sunlit',
    widths: [400, 800],
    note: 'Cluster of bowls with spoons on sunlit cement floor (image #17)',
  },
  {
    src: 'WhatsApp Image 2026-05-03 at 2.01.26 PM.jpeg',
    dst: 'workshop/packing-partition-plates',
    widths: [400, 800],
    note: 'Open cardboard box of partition plates — production / packing (image #24)',
  },
];

const FORMATS = [
  { ext: 'avif', method: 'avif', options: { quality: 50, effort: 6 } },
  { ext: 'webp', method: 'webp', options: { quality: 75 } },
  { ext: 'jpg',  method: 'jpeg', options: { quality: 80, mozjpeg: true } },
];

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function processOne(entry) {
  const srcPath = join(INPUTS, entry.src);
  if (!(await fileExists(srcPath))) {
    console.warn(`  [SKIP] missing source: ${srcPath}`);
    return { generated: 0, missing: true };
  }

  let generated = 0;
  for (const w of entry.widths) {
    for (const fmt of FORMATS) {
      const outPath = join(ASSETS, `${entry.dst}-${w}.${fmt.ext}`);
      await mkdir(dirname(outPath), { recursive: true });

      const pipeline = sharp(srcPath).resize({ width: w, withoutEnlargement: true });
      const formatted = pipeline[fmt.method](fmt.options);
      const info = await formatted.toFile(outPath);

      const kb = (info.size / 1024).toFixed(1);
      const dims = `${info.width}×${info.height}`;
      console.log(`    ${entry.dst}-${w}.${fmt.ext}  ${kb} KB  ${dims}`);
      generated += 1;
    }
  }
  return { generated, missing: false };
}

console.log(`Processing ${MANIFEST.length} source images → public/assets/...`);
let total = 0;
let missingCount = 0;
for (const entry of MANIFEST) {
  console.log(`\n  ${entry.dst}${entry.note ? `  (${entry.note})` : ''}`);
  const { generated, missing } = await processOne(entry);
  total += generated;
  if (missing) missingCount += 1;
}
console.log(`\nDone. ${total} files written. ${missingCount} sources missing.`);
