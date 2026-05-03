/**
 * Generate raster favicons (32×32 PNG, 180×180 apple-touch-icon) from
 * the brand SVG. The SVG itself ships as the primary favicon; PNGs are
 * fallbacks for browsers that don't support SVG favicons (rare in 2026,
 * but iOS still needs a separate apple-touch-icon).
 */

import sharp from 'sharp';
import { readFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const svg = await readFile('public/favicon.svg');

await sharp(svg, { density: 384 })
  .resize(32, 32)
  .png({ compressionLevel: 9 })
  .toFile('public/favicon-32.png');

await sharp(svg, { density: 384 })
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile('public/apple-touch-icon.png');

// Replace the Angular default ICO with one matching our brand. Sharp
// can't write multi-resolution ICO so we use a single-image fallback;
// modern browsers will pick favicon.svg first anyway.
await sharp(svg, { density: 384 })
  .resize(48, 48)
  .png({ compressionLevel: 9 })
  .toFile('public/favicon.png');

// Remove the Angular CLI default favicon.ico — favicon.svg + .png cover it.
if (existsSync('public/favicon.ico')) {
  await unlink('public/favicon.ico');
  console.log('removed public/favicon.ico');
}

console.log('Generated public/{favicon.svg, favicon-32.png, favicon.png, apple-touch-icon.png}');
