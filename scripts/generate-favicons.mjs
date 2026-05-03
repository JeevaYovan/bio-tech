/**
 * Generate brand logos AND favicons from inputs/Logo.jpeg.
 *
 * The source is a 1024×1024 JPG with the Rathika brand mark (green
 * leaf + mortar-and-pestle) on a black background. We:
 *   1. resize to each target size with cover fit
 *   2. clip to a circle via a white-disc SVG mask + dest-in blend
 *      (this drops the black square corners; the black inside the
 *      design remains intentional negative space)
 *   3. write as PNG with alpha
 *
 * Outputs:
 *   public/favicon-32.png        (32×32 — primary favicon for browser tab)
 *   public/favicon-48.png        (48×48 — Windows pinned site)
 *   public/apple-touch-icon.png  (180×180 — iOS home-screen icon)
 *   public/assets/brand/logo-44.png    (header @1x at 44px)
 *   public/assets/brand/logo-88.png    (header @2x at 44px)
 *   public/assets/brand/logo-256.png   (OG-image fallback, JSON-LD logo)
 *
 * Replaces the previous generate-favicons.mjs which produced a
 * stylised SVG approximation. The actual brand mark from inputs/ is
 * the source of truth now.
 */

import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir, unlink, copyFile } from 'node:fs/promises';

const SOURCE = 'inputs/Logo.jpeg';

await mkdir('public/assets/brand', { recursive: true });

async function circularPng(size, outPath) {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="white"/>` +
    `</svg>`,
  );
  const info = await sharp(SOURCE)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  ${outPath.padEnd(50)} ${(info.size / 1024).toFixed(1)} KB`);
}

console.log('Generating brand logos from inputs/Logo.jpeg...');

await circularPng(32,  'public/favicon-32.png');
await circularPng(48,  'public/favicon-48.png');
await circularPng(180, 'public/apple-touch-icon.png');
await circularPng(44,  'public/assets/brand/logo-44.png');
await circularPng(88,  'public/assets/brand/logo-88.png');
await circularPng(256, 'public/assets/brand/logo-256.png');

// Drop the stylised SVG / placeholder PNGs from the previous round.
for (const stale of [
  'public/favicon.svg',
  'public/favicon.png',
  'public/favicon.ico',
  'public/assets/brand/logo-64.avif',
  'public/assets/brand/logo-64.webp',
  'public/assets/brand/logo-64.jpg',
  'public/assets/brand/logo-128.avif',
  'public/assets/brand/logo-128.webp',
  'public/assets/brand/logo-128.jpg',
  'public/assets/brand/logo-256.avif',
  'public/assets/brand/logo-256.webp',
  'public/assets/brand/logo-256.jpg',
]) {
  if (existsSync(stale)) {
    await unlink(stale);
    console.log(`  removed stale: ${stale}`);
  }
}

console.log('Done.');
