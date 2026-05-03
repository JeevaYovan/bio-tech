Rathika Biotech Products
## End-to-end build + deploy on GitHub Pages at `rathika.in`

---

## 0. ROLE

You are a senior frontend engineer with sharp visual taste and disciplined deployment habits. You build sites that load in under one second, score 95+ on Lighthouse, and look like a thoughtful human made them. You do **not** default to AI-template aesthetics: no purple-blue gradients, no glassmorphism, no neon glow, no oversized rounded corners on everything, no floating 3D orbs, no Stripe-clone hero. The reference points for this project are *Aesop, Muji, Forest Essentials, and traditional South Indian print design* — restrained, typographic, earthy, confident.

---

## 1. MISSION

Build and deploy a static marketing + product catalog site for **Rathika Biotech Products** — a Coimbatore-based maker of biodegradable tableware from banana fiber, sugarcane bagasse, and rice husk. The site is rooted in **South Indian tradition and sustainability**.

### Hard targets

| | |
|---|---|
| **Production URL** | `https://rathika.in` (custom domain on GitHub Pages, free tier) |
| **Hosting cost** | ₹0 / month (GitHub Pages + Cloudflare DNS — both free) |
| **Availability** | GitHub Pages SLA, served from GitHub's global CDN |
| **First Contentful Paint** | < 1.0s on 4G |
| **Lighthouse** | Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, **SEO = 100** |
| **Initial JS (gzip)** | < 150 KB |
| **WCAG** | 2.1 AA |
| **Search ranking** | Site must be technically capable of ranking #1 for *"biodegradable plates Coimbatore", "banana fiber tableware Tamil Nadu", "eco-friendly disposable plates Neelambur"* — schema, sitemap, content, speed all in place. **Ranking itself depends on backlinks and time; the build must remove every technical excuse not to rank.** |

---

## 2. ASK BEFORE CODING — DO THIS FIRST

**Stop. Do not write a single line of code until you've asked me the following and received answers.** Print these as a numbered list and wait for my replies. If I answer some but not all, ask the rest before proceeding.

1. **`klaro-design-ui` location** — where does the library live? Is it (a) published to npm, (b) a local path in a monorepo, (c) a git submodule, or (d) a tarball? What's the import path?
2. **GitHub repo** — what's the GitHub username/org and repo name? Will this deploy from `<user>.github.io/<repo>` initially, or is the repo named `<user>.github.io` (apex)?
3. **DNS provider for `rathika.in`** — who's the registrar (GoDaddy, BigRock, Namecheap, Cloudflare)? Do I have permission to give you DNS records to add, or should I generate the instructions for you to hand to whoever manages DNS?
4. **Hero video** — does `./inputs/` contain a video file? (I'll inspect, but confirm: if not, do you want me to scaffold the markup with a TODO and a poster-only fallback, or skip video entirely?)
5. **Bilingual?** — English-only, or English + Tamil (தமிழ்)? Tamil would help local SEO and brand authenticity but doubles content work.
6. **Brand voice** — formal/corporate ("We manufacture..."), warm/founder-led ("My grandmother..."), or editorial/restrained ("Banana fiber. Rice husk. Tradition.")? Pick one or let me suggest the third.
7. **Order flow** — WhatsApp-only ("Order on WhatsApp" button → wa.me link), or also a contact form, or eventually a cart? For v1 I recommend WhatsApp-only — confirm.
8. **Logo file** — the file in `./inputs/` named `Logo` — what extension is it (PNG/SVG/JPG)? If it's not SVG, do you have an SVG version? An SVG logo is materially better for performance and crispness.
9. **Existing analytics / Search Console** — do you already have a Google Search Console property and Google Business Profile for Rathika? If yes, share the verification method you prefer (HTML file, meta tag, DNS).
10. **Renaming `./inputs/` images** — the WhatsApp filenames are not human-readable. May I propose a slug-based rename (e.g., `tea-cup-100ml-stacked.jpg`) and wait for your approval before applying it? I will not touch `./inputs/` until you say yes.

After I answer, **summarize my answers back to me in one paragraph and confirm before continuing.** This catches misreads early.

---

## 3. ANTI-HALLUCINATION RULES (binding for the whole build)

- **Never invent a `klaro-design-ui` component, prop, or token.** If you can't find what you need by reading the library's source/exports, stop and ask. List what you searched for so I can point you to it.
- **Never fabricate product details.** Prices, sizes, names, and SKUs come from §11 of this document. If something looks missing, ask — do not infer.
- **Never invent file paths, env vars, npm packages, or APIs.** If you reach for a package, confirm it exists and pin the version.
- **Never assume what's in `./inputs/`.** Open every file with `view` or equivalent and report contents. Do not generate placeholder images "based on" the brochure.
- **If a requirement here conflicts with reality** (e.g. `klaro-design-ui` doesn't have a primitive I assumed it did), stop, surface the conflict, propose two options, and let me pick.
- **No silent third-party additions.** If you need `lodash`, `dayjs`, `gsap`, anything — ask first with a one-line justification.
- **Confidence calibration.** When you're unsure between two valid approaches, ask once and proceed with the chosen path. When you're sure, proceed without theatrical disclaimers. The goal is to ask the *right* questions, not all questions.
- **Verify, then declare done.** "I've added X" is only true after the build passes and the route renders. Show command output, don't paraphrase it.

---

## 4. DISCOVERY (after ASK BEFORE CODING is answered)

In order, and report findings before writing application code:

### 4a. Inspect `./inputs/`
List every file with: filename → file type → dimensions (for images) → 1-line description of content. Based on the directory listing I've shared, you should expect roughly:
- 1 brand logo
- 2 brochure scans (front + back/catalog)
- ~20 product and lifestyle photos (WhatsApp-formatted JPEGs)

Then produce a **proposed mapping table**:

| Source filename | Proposed slug filename | Maps to product slug | Use (hero / detail / lifestyle / unused) |
|---|---|---|---|

Wait for my approval before renaming or copying anything.

### 4b. Inspect `klaro-design-ui`
Once I tell you where it lives (Q1 above), produce:

| Component / token / directive | Purpose | Key inputs / outputs | Will use for |
|---|---|---|---|

If a primitive I'd expect (button, card, input, layout grid) is missing, flag it.

### 4c. Confirm toolchain
Print the output of: `node -v`, `npm -v`, `ng version`, `git --version`. If Angular CLI isn't installed globally, install locally and use `npx ng`. If Node is below 20 LTS, stop and ask before continuing.

---

## 5. TECH STACK (non-negotiable)

- **Framework:** Angular (latest stable), standalone components, signals where natural
- **Component library:** `klaro-design-ui` for all primitives. Custom components only when the library genuinely lacks the primitive — each one needs a one-line justification in `src/app/shared/README.md`
- **Rendering mode:** Static Site Generation via `@angular/ssr` prerender. **Every route must be prerendered to HTML at build time.** No client-only routes.
- **Styling:** SCSS + CSS custom properties. No Tailwind unless `klaro-design-ui` mandates it.
- **State:** Signals + plain services. No NgRx.
- **Images:** `NgOptimizedImage` with explicit width/height. AVIF + WebP + JPEG fallback via `<picture>`. All images lazy except hero LCP.
- **Fonts:** Self-hosted, `font-display: swap`, preload only the weights actually used. No Google Fonts CDN at runtime.
- **Icons:** Inline SVG, no icon font.

---

## 6. DEPLOYMENT — GITHUB PAGES + `rathika.in` (zero cost)

This is the production target. Set it up correctly the first time.

### 6a. Repo structure
- Source on `main` branch
- Build artifact deployed to GitHub Pages via **GitHub Actions + `actions/deploy-pages@v4`** (modern, no `gh-pages` branch needed)
- Use the official Pages workflow pattern; do not roll your own with `peaceiris/actions-gh-pages` unless I ask

### 6b. Angular config for GitHub Pages
- Set `"baseHref": "/"` in `angular.json` for **apex domain** deployment (i.e., served at `rathika.in/`, not at a subpath). If the user clarifies in Q2 that this is a subpath repo, switch to `/<repo>/` accordingly.
- Generate `404.html` as a copy of `index.html` post-build, so SPA route refreshes don't 404 on Pages. Add this as a postbuild step in `package.json`.
- Generate `CNAME` file in the deployed output containing exactly: `rathika.in` (no protocol, no trailing slash, no newline drama).
- Add `.nojekyll` empty file to the deployed output to prevent Jekyll processing of files starting with underscore.

### 6c. GitHub Actions workflow
Create `.github/workflows/deploy.yml` that:
1. Triggers on push to `main` and on manual dispatch
2. Uses Node 20, caches npm
3. Runs `npm ci`, `npm run build`, `npm run prerender`
4. Runs Lighthouse-CI as a gate (fail PR if scores drop below thresholds in §13)
5. Uploads `dist/rathika/browser` as a Pages artifact
6. Deploys via `actions/deploy-pages@v4`
7. Posts the deployment URL as a step summary

Do not commit secrets. Use `permissions: pages: write, id-token: write` correctly.

### 6d. DNS setup for `rathika.in` (apex domain)
After Q3 is answered, generate the exact DNS records for the user's registrar. The records are:

**A records (apex `rathika.in`):**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME for `www`:**
```
www.rathika.in   CNAME   <github-username>.github.io
```

**Recommended:** point the registrar's nameservers at **Cloudflare (free plan)** for faster DNS propagation, free DDoS protection, and easier SSL/redirect rules. Generate Cloudflare-specific instructions if the user picks that path. Cloudflare must be in **DNS-only (grey cloud)** mode for the apex A records, otherwise GitHub Pages cert provisioning will fail. Once GitHub has provisioned the cert (check the green padlock in repo Settings → Pages), Cloudflare proxy can be enabled.

**In repo Settings → Pages:**
- Custom domain: `rathika.in`
- Enforce HTTPS: ✅ (wait until cert provisions, can take up to 24h)

Document every step in `DEPLOY.md`.

### 6e. Local Docker preview (optional, not production)
Keep a thin `Dockerfile` + `docker-compose.yml` that serves the built `dist/` via nginx for local QA on `localhost:8080`. Useful for testing the production bundle locally. **Not** the deployment path. Document this in README under "Local production preview."

---

## 7. SEO — DESIGNED TO RANK

This section is as important as the visual design. Every item is required.

### 7a. Metadata per route
Every prerendered HTML file gets unique:
- `<title>` — under 60 chars, includes brand + primary keyword + locale where relevant
  - Home: `Rathika Biotech Products | Biodegradable Tableware, Coimbatore`
  - Products: `Eco-Friendly Plates, Cups & Bowls | Rathika Biotech Coimbatore`
  - About: `Our Story — Banana Fiber Tableware from Tamil Nadu | Rathika`
  - Contact: `Contact Rathika Biotech Products, Neelambur, Coimbatore`
- `<meta name="description">` — 150–160 chars, action-oriented, includes city
- Canonical URL
- Open Graph + Twitter Card with a custom 1200×630 image per route (generate from product photos + wordmark)
- `<html lang="en-IN">`

### 7b. Structured data (JSON-LD) — non-negotiable
Inject these in the prerendered HTML:

1. **`LocalBusiness`** on every page (or at least Home + Contact):
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Rathika Biotech Products",
  "image": "https://rathika.in/og/home.jpg",
  "telephone": "+91-90809-66792",
  "email": "rathikabiotechproducts@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1/447 Avinashi Road",
    "addressLocality": "Neelambur",
    "addressRegion": "Tamil Nadu",
    "postalCode": "641026",
    "addressCountry": "IN"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 11.0779, "longitude": 77.0006 },
  "url": "https://rathika.in",
  "areaServed": ["Coimbatore", "Tamil Nadu", "India"]
}
```
*Verify the geo coordinates against the actual Neelambur address before shipping. Ask me if you can't.*

2. **`Product`** schema for every SKU on `/products/:slug` with `name`, `image`, `description`, `brand`, `offers.price`, `offers.priceCurrency: "INR"`, `offers.availability`.

3. **`BreadcrumbList`** on product detail pages.

4. **`Organization`** in the site root layout.

### 7c. Sitemap + robots
- `sitemap.xml` generated at build, listing every prerendered route with `<lastmod>`
- `robots.txt`: allow all, point to sitemap, disallow nothing
- Submit sitemap to Google Search Console (document the step in `DEPLOY.md`)

### 7d. Content for ranking
- Homepage H1: includes primary keyword naturally — e.g., *"Biodegradable tableware from Coimbatore, made of banana fiber and rice husk."*
- Each product page: 80–150 words of unique copy (not duplicated across SKUs), the full size + price + use case + material
- About page: 300+ words including "Coimbatore", "Tamil Nadu", "Neelambur", "banana fiber", "rice husk", "sugarcane bagasse", "biodegradable", "compostable" — natural, not stuffed
- Internal linking: every product card links to detail page; About links to Products; Contact links to Home

### 7e. Off-site SEO checklist (in `SEO_LAUNCH.md`)
After launch the user must:
1. Verify Google Search Console + submit sitemap
2. Create / claim Google Business Profile (Maps listing) at the Neelambur address
3. List on IndiaMART, JustDial, Sulekha, TradeIndia (free listings)
4. Add Bing Webmaster Tools verification
5. Encourage first 10 customers to leave Google reviews

Generate this file. Code can't do steps 1–5 — but the file ensures the user knows.

### 7f. Performance = SEO
Core Web Vitals are a ranking signal. The §13 budget enforces this.

---

## 8. INPUTS FOLDER — what's actually there

Based on directory inspection (you must verify file by file), `./inputs/` contains approximately:

- **1 logo file** named `Logo` (extension TBD — confirm in Q8)
- **2 brochure scans** — one with key features + brand info, one with the product catalog grid
- **~20 product and lifestyle photos** in WhatsApp `.jpg` format dated 2026-05-03

Likely product subjects observed (verify each):
- Tea cups (stacked, with chai, with spoons)
- Parcel boxes (square stack, with lid)
- Rectangular boxes (with spoon)
- Spoons (row of nested spoons)
- Vinayagar (Ganesha) statue plate
- Square partition / divider plates
- Large flat plates and trays
- Bowls (with food, with spoons)
- Lifestyle shots (haystack sunset background, tea cup with chai)
- Manufacturing/packaging photo

**Do not assume mappings.** Open each, then propose the mapping table from §4a.

---

## 9. DESIGN DIRECTION

### Palette (use exactly these tokens)

```scss
// Greens — banana leaf / palm shade, not "tech green"
--rathika-green-900: #1F3A2B;   // deep forest, primary text
--rathika-green-700: #2F5D3F;   // primary brand
--rathika-green-500: #5B8A6A;   // secondary
--rathika-green-100: #E8F0E5;   // surface tint

// Earth accents — banana stem, rice husk
--rathika-earth-700: #6B4423;
--rathika-earth-500: #A07550;
--rathika-cream:     #F8F4EC;   // page background, NOT pure white

// Neutrals
--rathika-ink:       #1A1A1A;
--rathika-paper:     #FFFFFF;   // cards only
--rathika-rule:      #D9D2C2;   // hairlines

// One accent — terracotta — used sparingly for CTAs / price tags
--rathika-accent:    #B8533A;
```

The palette is **green + cream + earth**, not green + white. Pure white reads digital; cream reads handmade.

### Typography
- **Display/Headings:** Pick one — *Fraunces*, *Cormorant Garamond*, or *Tiro Tamil* (Tiro Tamil pairs well with the heritage angle)
- **Body:** *Inter* or *Manrope*, 16px base, 1.6 line-height, max 68ch line length
- **Optional Tamil touch:** Once on home, once in footer — e.g., `இயற்கை · iyarkai · nature` set in Tiro Tamil. Don't overdo it.

### Anti-patterns — DO NOT SHIP
- ❌ Purple→blue or rainbow gradients
- ❌ Glassmorphism / frosted cards
- ❌ Border-radius > 8px on cards (buttons can go to 4px)
- ❌ Drop shadows with blur > 12px
- ❌ Floating 3D shapes, blob meshes, animated gradient text
- ❌ Emoji as iconography
- ❌ "Get Started" / "Learn More" CTAs — use specific verbs (*Order on WhatsApp*, *See the catalog*, *Visit the workshop*)
- ❌ Lorem ipsum surviving into commits
- ❌ Stock-photo "team smiling at laptop" anywhere

### Encouraged
- ✅ Generous whitespace, asymmetric editorial grids
- ✅ Hairline rules instead of cards everywhere
- ✅ Serif numerals as section markers
- ✅ Subtle paper grain (SVG noise at 3% opacity) over the cream background
- ✅ Hand-drawn-feel banana leaf / rice grain SVG ornaments

---

## 10. VIDEO BACKGROUND

Hero only. Implement only if a video exists in `./inputs/` (confirmed in Q4). Otherwise scaffold the markup and ship with a poster image only.

Rules:
1. Sources: `hero.webm` (VP9) + `hero.mp4` (H.264), under 1.2 MB combined for a 10–15s loop, 1080×608, 24fps, no audio
2. `<video autoplay muted loop playsinline preload="metadata" poster="hero-poster.avif">` — **poster is the LCP, never the video**
3. Below 768px: poster only, no video download
4. `prefers-reduced-motion: reduce`: poster only
5. Overlay: `var(--rathika-green-900)` at 35% — verify text contrast against actual frames

---

## 11. PRODUCT DATA — exact

Create `src/data/products.ts`:

```ts
export const products = [
  { slug: 'ice-cream-bowl-4in',   name: 'Ice Cream Bowl',         size: '4 inch',        price: 6.00,   category: 'bowls' },
  { slug: 'parcel-box-300ml',     name: 'Parcel Box',             size: '300 ml round',  price: 11.00,  category: 'boxes' },
  { slug: 'parcel-box-500ml',     name: 'Parcel Box',             size: '500 ml round',  price: 15.00,  category: 'boxes' },
  { slug: 'partition-10x12',      name: '10×12 Partition Plate',  size: '10×12 inch',    price: 18.00,  category: 'plates' },
  { slug: 'rectangle-box-300ml',  name: 'Rectangle Box',          size: '300 ml',        price: 12.00,  category: 'boxes' },
  { slug: 'rectangle-box-500ml',  name: 'Rectangle Box',          size: '500 ml',        price: 16.00,  category: 'boxes' },
  { slug: 'tea-cup-100ml',        name: 'Tea Cup',                size: '100 ml',        price: 3.50,   category: 'cups' },
  { slug: 'straw-8in',            name: 'Straw',                  size: '8 inch',        price: 5.00,   category: 'utensils' },
  { slug: 'normal-plate',         name: 'Normal Plate',           size: 'standard',      price: 16.00,  category: 'plates' },
  { slug: 'plate-5in',            name: 'Plate',                  size: '5 inch',        price: 9.00,   category: 'plates' },
  { slug: 'plate-7in',            name: 'Plate',                  size: '7 inch',        price: 11.00,  category: 'plates' },
  { slug: 'spoon-5in',            name: 'Spoon',                  size: '5 inch',        price: 2.00,   category: 'utensils' },
  { slug: 'elephant-statue-6in',  name: 'Elephant Statue',        size: '6 inch',        price: 300.00, category: 'decor' },
  { slug: 'vinayagar-statue-6in', name: 'Vinayagar Statue',       size: '6 inch',        price: 300.00, category: 'decor' },
];
```

All prices in INR. Display as `₹6.00`, not `Rs. 6` or `$6`.

---

## 12. BRAND CONTENT

**Wordmark:** Rathika Biotech Products

**Tagline (pick one in Q6, then commit):**
- "Crafted from the earth. Returns to the earth."
- "Tableware the soil thanks you for."
- "Banana fiber. Rice husk. Tradition."

**Address:** 1/447 Avinashi Road, Neelambur, Coimbatore – 641026, Tamil Nadu, India
**Phone:** +91 90809 66792 → `tel:+919080966792`
**WhatsApp:** `https://wa.me/919080966792?text=Hi%20Rathika%2C%20I%27d%20like%20to%20place%20an%20order.`
**Email:** `rathikabiotechproducts@gmail.com`

**Six pillars** (Key Features section, render as numbered editorial list):
1. **100% Natural & Biodegradable** — banana fiber, sugarcane bagasse, rice husk. No plastics, no chemicals. Decomposes in weeks.
2. **Strong & Durable** — natural fiber tensile strength makes these sturdy enough for hot, cold, and oily food.
3. **Chemical-Free & Food Safe** — no synthetic binders, adhesives, or coatings. Direct food contact safe.
4. **Heat & Moisture Resistant** — holds curries and hot meals without leaking. Natural fiber insulates well.
5. **Zero Waste Manufacturing** — built from farm waste that would otherwise be burned. Low carbon footprint.
6. **Animal-Friendly & Compostable** — discarded outdoors, animals can safely consume. No soil or water pollution.

**Where it's used:** Restaurants · Cafés · Food trucks · Events · Weddings · Festivals · Fruit shops · Organic stores · Eco-friendly markets · Home

**Environmental story (About page, draft, the user will edit):**
> Across Tamil Nadu, banana stems, sugarcane bagasse, and rice husk are routinely burned after harvest — one of the largest sources of agricultural air pollution in the region. Rathika upcycles those by-products into tableware that replaces single-use plastic and paper plates. We close the loop, support the circular economy, and give farmers a second revenue stream from what they used to set on fire.

---

## 13. SITE MAP

```
/                       Home — hero, story, six pillars, featured products, where used, CTA
/products               Catalog with category filter
/products/:slug         Detail page per SKU (14 pages, all prerendered)
/about                  Story, sustainability, who we are
/contact                Address, phone, email, WhatsApp CTA, embedded static map image
/privacy                Privacy notice (basic, no cookies)
404                     Custom 404 (also serves as SPA fallback)
```

Every route prerendered to static HTML.

---

## 14. PERFORMANCE BUDGET (CI gate)

| Metric | Budget |
|---|---|
| Initial JS (gzip) | < 150 KB |
| Initial CSS (gzip) | < 25 KB |
| Hero image (LCP) | < 80 KB AVIF |
| Total page weight (home) | < 800 KB |
| FCP (4G mid-tier mobile) | < 1.0 s |
| LCP | < 1.8 s |
| CLS | < 0.05 |
| TBT | < 150 ms |

Wire `lighthouse-ci` into the GitHub Actions workflow with these as failing thresholds.

---

## 15. ACCESSIBILITY CHECKLIST

- Every image has meaningful `alt` (product name + size, not "image")
- Body text contrast ≥ 4.5:1; large text ≥ 3:1 — verify against cream, not white
- Visible focus indicators (2px green outline, 2px offset) on all interactive elements
- Skip-to-content link as first focusable element
- One `h1` per page, no heading level skips
- Forms (contact) have proper labels + `aria-describedby` for errors
- Phone / WhatsApp CTAs have `aria-label` (e.g., "Order via WhatsApp")
- Reduced-motion respected for video and animations
- `axe` reports zero violations on every route

---

## 16. EXECUTION PLAN — phased, with checkpoints

Stop and confirm at the end of each phase before moving on.

1. **ASK** — §2. Get my answers, summarize back, confirm.
2. **DISCOVERY** — §4. Report `./inputs/` contents, propose rename map, list `klaro-design-ui` API.
3. **SCAFFOLD** — Angular app, library wired, design tokens, base layout, fonts, empty Home route. Show me the dev server.
4. **HOME** — Hero (with or without video per Q4), story, six pillars, featured products, CTA. Run Lighthouse, paste scores.
5. **CATALOG + DETAIL** — All 14 products with real images, category filter, prerendered detail pages with `Product` schema.
6. **ABOUT + CONTACT** — Story copy, static map image (embedded Maps iframe is JS-heavy and a privacy issue — use a static map PNG with a "View on Maps" link).
7. **SEO** — Meta per route, JSON-LD, sitemap, robots, OG images. Run Lighthouse SEO, must hit 100.
8. **A11Y + POLISH** — axe pass, image optimization, copy proofread.
9. **DEPLOY** — GitHub Actions workflow, CNAME, 404.html, .nojekyll. First push, verify GitHub Pages serves at `<user>.github.io/<repo>`.
10. **DOMAIN** — DNS records given to user, custom domain set in repo, HTTPS enforced once cert provisions, verify `https://rathika.in` resolves and serves.
11. **POST-LAUNCH** — `SEO_LAUNCH.md` checklist for Search Console, GBP, directory listings.

---

## 17. DELIVERABLES

When done, the repo must contain:

- Source code (Angular app)
- `README.md` — local dev, build, prerender, local Docker preview
- `DEPLOY.md` — GitHub Pages setup, DNS records, troubleshooting (cert not provisioning, 404 on refresh, etc.)
- `SEO_LAUNCH.md` — post-launch off-site checklist
- `src/app/shared/README.md` — every custom component with one-line justification for not using `klaro-design-ui`
- `.github/workflows/deploy.yml` — CI/CD with Lighthouse-CI gate
- `Dockerfile` + `docker-compose.yml` — local production preview only
- `lighthouserc.json` — perf budget config

---

## 18. DEFINITION OF DONE

- [ ] `https://rathika.in` resolves over HTTPS and serves the site
- [ ] Lighthouse on Home, Products, a Product detail, About, Contact: Performance ≥ 95, A11y ≥ 95, BP ≥ 95, **SEO = 100**
- [ ] All 14 products visible with real photos from `./inputs/`
- [ ] Site renders core content with JS disabled (prerendered HTML)
- [ ] No anti-pattern from §9 present
- [ ] axe reports zero violations
- [ ] WhatsApp / phone / email CTAs are real and tested on mobile
- [ ] LocalBusiness + Product + BreadcrumbList JSON-LD validates in Google Rich Results Test
- [ ] Sitemap accessible at `https://rathika.in/sitemap.xml`
- [ ] No `klaro-design-ui` primitive reinvented as a custom component without justification
- [ ] DNS records documented; user has signed off that they're applied
- [ ] `SEO_LAUNCH.md` exists and the user knows it's their next step

---

## 19. RULES OF ENGAGEMENT

- Ask the questions in §2 first. Always.
- Commit small, themed commits with conventional commit messages.
- After every phase, run the build. Broken `main` is not acceptable.
- If `klaro-design-ui` is missing a primitive, ask before reaching for a third-party.
- If a requirement here conflicts with `klaro-design-ui`'s opinions, **`klaro-design-ui` wins** and you flag the conflict.
- When uncertain between two valid approaches, ask once and proceed. Do not stack five clarifying questions in a row mid-build.
- Never claim a step is complete without showing the command output that proves it.

**Begin with §2. Print the questions and wait for my answers.**