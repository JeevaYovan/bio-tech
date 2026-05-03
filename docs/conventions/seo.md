# SEO conventions

This is a small-business product showcase. The SEO surface is the home
page, the about/story page, and any product/category pages. Get those
right; everything else follows.

## Required per page
- `<title>` 50-60 chars, brand at the end:
  `<page-specific> — bio-tech`.
- `<meta name="description">` 150-160 chars, plain language.
- `<link rel="canonical">` to the canonical URL of the page.
- Open Graph: `og:title`, `og:description`, `og:image` (1200×630 AVIF
  or PNG), `og:url`, `og:type`.
- Twitter card: `twitter:card="summary_large_image"`, plus the OG tags
  Twitter reads.
- HTML `<html lang="...">` set correctly.

## Structured data (JSON-LD)
- Site root: `Organization` + `WebSite` (with `SearchAction` if a
  search is added later).
- Product pages (when added): `Product` with `name`, `description`,
  `image`, `offers.price`, `offers.priceCurrency` (INR), and
  `offers.availability`.
- Article-style pages: `Article` with author, datePublished,
  dateModified.

## Static rendering
- All routes prerendered. `outputMode: 'static'` in `angular.json`.
- No client-side-only routes for content that should be indexed.
- `<noscript>` fallback content for any JS-gated section.

## Sitemap and robots
- `sitemap.xml` listing every prerendered route, build-time generated.
- `robots.txt` allows everything except `/api/` (none for static, but
  reserve the path).

## URLs
- Lowercase, hyphenated, no trailing slash.
- Stable: avoid restructuring once published. If a page moves, add a
  301 in `vercel.json`.

## Images
- Every product image has descriptive `alt` text — what the product
  IS, not "image of" prefixes.
- Filenames use slugged product names (`bagasse-ice-cream-bowl-4in.avif`,
  not `IMG_2026_05_03.jpg`).

## Vercel-specific
- `vercel.json` in repo root for any redirects, headers (`Cache-Control:
  public, max-age=31536000, immutable` on hashed assets).
- Trailing slash policy: off (Angular emits paths without).
