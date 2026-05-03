# SEO launch checklist — Rathika Biotech Products

The technical SEO surface of `rathika.in` is fully wired (every route
prerendered, Organization + LocalBusiness + Product + BreadcrumbList
JSON-LD where applicable, sitemap.xml at `/sitemap.xml`, robots.txt
allowing all, OG/Twitter meta on every page, canonical URLs, mobile
Lighthouse SEO = 100).

**Code can't do the off-site work.** The list below is what *you* must
do after the site goes live at `https://rathika.in`. None of it is
optional if you want to rank for the target queries
(*"biodegradable plates Coimbatore"*, *"banana fiber tableware Tamil
Nadu"*, *"eco-friendly disposable plates Neelambur"*).

---

## Day 0 — the minute the site is live

### 1. Google Search Console (free, ~10 min)
1. Open <https://search.google.com/search-console>.
2. Add a new **Domain** property (preferred over URL prefix). Enter
   `rathika.in`.
3. Verify via your DNS provider (Cloudflare or whoever you used for the
   `A` records). Add the TXT record GSC gives you.
4. Once verified, **submit your sitemap**: in the left sidebar →
   **Sitemaps** → enter `https://rathika.in/sitemap.xml`.
5. Confirm it shows status *Success* and the discovered URL count
   matches what's in the sitemap (currently 19 routes).
6. Use the **URL Inspection** tool to test `https://rathika.in/` and
   `https://rathika.in/products/`. Click *Request indexing* on each.

### 2. Bing Webmaster Tools (free, ~5 min)
1. <https://www.bing.com/webmasters/>.
2. Add and verify `rathika.in`.
3. Submit the sitemap URL: `https://rathika.in/sitemap.xml`.
4. Bing-indexed traffic in India is small but the verification is
   instant and ranks against Yahoo, DuckDuckGo, and Microsoft Edge's
   default search.

### 3. Google Business Profile (free, ~30 min including verification)
This is the **single biggest local-SEO lever** for a Coimbatore-based
business. It's what makes you appear on Google Maps and in the Local
Pack ("3-pack" of map results that show above organic search).

1. Go to <https://business.google.com>.
2. Click **Manage now** → enter business name **Rathika Biotech
   Products**.
3. Pick the right **category**: *Biodegradable products supplier* (or
   *Manufacturer*). Add secondary categories: *Disposable tableware
   supplier*, *Eco-friendly products store*.
4. Add the address: `1/447 Avinashi Road, Neelambur, Coimbatore –
   641026, Tamil Nadu, India`.
5. Add phone `+91 90809 66792` and website `https://rathika.in`.
6. Set hours: Mon–Sat, 9 AM – 6 PM IST.
7. **Verify** via postcard (Google sends a card with a 5-digit code
   to the workshop address; takes 5–14 days). Some accounts get instant
   video verification — try that first.
8. Once verified:
   - Upload **at least 10 photos**: workshop interior, products in use,
     packing area, the team. Use the actual photos in `/inputs/`,
     re-shoot if any are unclear.
   - Add the full set of products as **Services**.
   - Write a 750-character business description that mentions
     "Coimbatore", "biodegradable", "banana fiber", "rice husk",
     "sugarcane bagasse" naturally.

---

## Week 1 — directory listings

These are free Indian B2B directories that pass useful link equity and
generate inquiries. Submit to all of them with the same NAP (Name,
Address, Phone) **exactly** as on the site, otherwise local rank suffers.

| Directory | Where | Typical impact |
|---|---|---|
| **IndiaMART** | <https://seller.indiamart.com> | High — most Indian B2B buyers start here. List all 14 products with prices. |
| **JustDial** | <https://www.justdial.com/Free-Listing> | High locally — Coimbatore phone-search funnels through JD. |
| **Sulekha** | <https://www.sulekha.com> | Moderate — niche but indexable. |
| **TradeIndia** | <https://www.tradeindia.com> | Moderate — exporters and bulk buyers. |
| **ExportersIndia** | <https://www.exportersindia.com> | Low locally; useful if you ever export. |

For each: use the canonical NAP, link to `https://rathika.in`, and
upload at least 5 product photos.

---

## Month 1 — reviews and link-building

### 4. Customer reviews on Google Business Profile
1. After the first 10 customers, send each a WhatsApp message with the
   direct review link from your GBP dashboard (looks like
   `https://g.page/r/<id>/review`).
2. Aim for at least 5 reviews in the first month, 25 by month 3.
   Reviews directly affect Local Pack ranking.
3. Respond to every review within 48 hours, even short ones. Polite
   thanks, no copy-paste.

### 5. Backlinks (the only way Google ranks you above competitors)
The site is technically perfect; ranking is now about *who links to
you*. Cheapest tactics:

- **NGO / sustainability blogs**: write a short guest post for
  `thebetterindia.com`, `youthkiawaaz.com`, `downtoearth.org.in` about
  upcycling banana stems. Link back to `rathika.in/about/`.
- **Local press**: pitch a story to *Times of India Coimbatore*,
  *Hindu Coimbatore*, *Coimbatore.com*. Headline angle: "Neelambur unit
  turns farm waste into compostable plates."
- **Industry associations**: Coimbatore Industrial Infrastructure
  Association (CODISSIA), CII Tamil Nadu — get a member listing.
- **University partnerships**: PSG College of Technology, Karunya, Anna
  University Coimbatore campus — eco-club tie-ins, links from `.edu`
  domains.

Aim for 5 quality backlinks in month 1, 20 by month 6. Quality matters
far more than quantity.

---

## Ongoing — content + technical hygiene

### 6. Add a blog (optional but recommended)
A single post per month about banana-fiber sustainability, agricultural
waste, the South Indian zero-waste tradition. Each becomes a long-tail
search target ("banana fiber compostable cup vs plastic", etc.). Plan
this in a v2 phase.

### 7. Quarterly: reverify GSC indexed-vs-submitted
Open GSC → Sitemaps. Make sure submitted ≈ indexed. If pages drop out,
check **Index → Pages** for the reason. Fix and re-submit.

### 8. Quarterly: update `<lastmod>` in sitemap.xml when content changes
The `npm run build` postbuild script already regenerates sitemap.xml
on every build with today's date. As long as you redeploy on real
content updates, this is automatic.

### 9. Watch Core Web Vitals in GSC → Experience
The **Core Web Vitals** report flags any URL that misses LCP / CLS /
INP thresholds on real-user traffic. The site's lab Lighthouse is 99
Performance, but real-world CrUX data may differ — check monthly.

---

## Items deliberately deferred from launch (track here so they don't get forgotten)

### 10. Studio photography for 4 SKUs
The catalog ships v1 with placeholder cards (no photo) for:
- `straw-8in`
- `plate-5in`
- `plate-7in`
- `elephant-statue-6in`

Action: shoot or commission product photos for each (white background,
~3000×3000 source minimum). Drop into `inputs/`, add entries to
`scripts/process-images.mjs` MANIFEST, run `npm run images`, redeploy.
The placeholder treatment in the catalog will automatically be
replaced.

### 11. Vector (SVG) brand logo
v1 uses `Logo.jpeg` (28 KB raster). A vector logo would:
- Render crisper at all sizes (favicon, OG image, large headers)
- Trim ~20 KB off the brand image weight
- Re-color for dark mode (when added)

Cost ~₹500–1500 from a freelance designer; a design school student in
Coimbatore would do it in an afternoon. Once you have an SVG, replace
`public/assets/brand/logo-256.jpg` references with `logo.svg` in
`SeoService.organizationSchema()` and the OG image script.

### 12. Tamil bilingual route mirror (`/ta/...`)
The pre-coding agreement was for English + Tamil. v1 ships English-only
with a single Tamil flourish in the footer (*"இயற்கை · iyarkai ·
nature"*). Doing Tamil right means:
- Mirror every English route at `/ta/<path>` (39 prerendered routes
  total)
- Per-page Tamil content drafts, **reviewed by a native Tamil speaker
  before launch**
- Language toggle in the header
- `<link rel="alternate" hreflang="ta-IN">` between EN ↔ TA
- `<html lang="ta-IN">` set per route

That's a 1–2 day deliverable on top of the v1 site. **Plan: ship
English first, add Tamil in a Phase 12 sprint after the first 30 days
of live data tells us where Tamil is most valuable** (likely About and
Contact, possibly product detail pages).

### 13. Real OSM static map PNG on `/contact`
The build environment for this project is sandboxed without DNS, so
the OSM static map fetch was deferred. The contact page currently
ships a stylised SVG placard with deep links to OpenStreetMap and
Google Maps for actual directions.

To swap in a real OSM-rendered PNG (10-min job on a machine with
network access):
1. Visit
   `https://staticmap.openstreetmap.de/staticmap.php?center=11.0779,77.0006&zoom=15&size=800x500&markers=11.0779,77.0006,red-pushpin`
   in a browser, save as `inputs/Map-Neelambur.png`.
2. Add an entry to `scripts/process-images.mjs` for
   `contact/map-neelambur` at widths `[600, 1200]`.
3. Run `npm run images`.
4. Replace the inline SVG block in `src/app/pages/contact/contact.html`
   with a `<picture>` element pointing at the new files.
5. Redeploy.

OSM attribution ("© OpenStreetMap contributors") must appear visibly
near the map.

---

## Targets — what success looks like

| Window | Target |
|---|---|
| Day 0 | GSC verified, sitemap submitted, GBP listing created |
| Week 1 | All 5 directory listings live |
| Month 1 | 5+ Google reviews, ranking on page 1 for "rathika biotech" |
| Month 3 | 25+ Google reviews, ranking top-5 for *"biodegradable plates Coimbatore"* |
| Month 6 | Top-3 for primary local queries; 1k+ monthly organic visits |
| Month 12 | Top-3 for *"banana fiber tableware Tamil Nadu"* |

These targets assume the off-site checklist gets done. If only the
day-0 items happen and the rest is skipped, expect the site to never
break out of a long-tail traffic floor.
