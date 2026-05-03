/**
 * Generate the generic Open Graph / Twitter Card image used as the
 * default og:image for all routes. 1200×630 JPEG composited from the
 * hero photograph with a dark-green overlay and brand wordmark.
 *
 * Per-route OG variants can be generated later by copying this script
 * and swapping the source image + caption text.
 *
 * Run: node scripts/generate-og-image.mjs
 */

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'inputs/WhatsApp Image 2026-05-03 at 2.01.18 PM.jpeg';
const DST = 'public/assets/og/og-default.jpg';

const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="darken" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#1F3A2B" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="#1F3A2B" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#1F3A2B" stop-opacity="0.78"/>
    </linearGradient>
  </defs>

  <rect width="100%" height="100%" fill="url(#darken)"/>

  <text x="80" y="120" font-family="Georgia, serif" font-size="20"
        letter-spacing="0.20em" fill="#E8F0E5" font-weight="400">RATHIKA.IN</text>
  <line x1="80" y1="148" x2="180" y2="148" stroke="#B8533A" stroke-width="3"/>

  <text x="80" y="270" font-family="Georgia, serif" font-size="92"
        font-weight="500" fill="#F8F4EC" letter-spacing="-0.02em">Rathika</text>
  <text x="80" y="350" font-family="Georgia, serif" font-size="56"
        fill="#E8F0E5" font-style="italic">Biotech Products</text>

  <text x="80" y="455" font-family="sans-serif" font-size="28" fill="#E8F0E5"
        letter-spacing="0.02em">Biodegradable tableware from Coimbatore</text>
  <text x="80" y="495" font-family="sans-serif" font-size="22" fill="#D9D2C2"
        letter-spacing="0.04em" font-style="italic">Banana fiber · Sugarcane bagasse · Rice husk</text>

  <text x="80" y="580" font-family="sans-serif" font-size="20"
        letter-spacing="0.14em" fill="#E8F0E5" opacity="0.85">NEELAMBUR · TAMIL NADU · INDIA</text>
</svg>
`);

await mkdir('public/assets/og', { recursive: true });

const info = await sharp(SRC)
  .resize(1200, 630, { fit: 'cover', position: 'center' })
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(DST);

console.log(`Generated ${DST}  ${(info.size / 1024).toFixed(1)} KB  ${info.width}×${info.height}`);
