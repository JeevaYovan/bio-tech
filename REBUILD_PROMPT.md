# Claude Code Prompt — Rathika Biotech REBUILD v2

## 1. CONTEXT — read carefully

**The site is live at `https://jeevayovan.github.io/bio-tech/`. Deployment works. Don't break it.**

- Stack: Angular + `klaro-design-ui` (the user's own library, also powering `hiklaro.com/care`)
- Routes: Home, Products, Product detail, About, Contact, Privacy
- Content (14 products, prices, address, WhatsApp link) is correct and final
- 14 product photos and lifestyle photos are in `./inputs/`, already wired
- GitHub Actions deploys on push to `main`

**The problem:** the site reads as a flat brochure. Side by side with `goeco.co.in` or `growood.in`, it loses despite having the better product story. Specifically: no motion, no depth, no horizontal product slider, no social-proof layer, no "how it's made" story, no wholesale path.

**The new reference:** `hiklaro.com/care` — same author's polished Angular SPA. The user supplied a screenshot showing the *category picker pattern*: a horizontal row of large illustrated cards (Travel Insurance, Home Insurance, Pocket Insurance, Car Insurance, Bike Insurance, Assured Return Plans, Health Insurance, Child Education Plan, Retirement Plans), each with a soft pastel tint and a 3D-style illustration anchored at the bottom. Cards are tall, photographed-product-style, and the whole row scrolls horizontally with snap behavior.

**This pattern is the centerpiece of the rebuild.** The user wants this exact treatment applied to the Rathika catalog.

---

## 2. ASK FIRST — answers required before any code

Print these as a numbered list. Wait for replies. Do not start the audit until I answer.

1. **Slider scope** — Apply the Klaro Care-style horizontal slider to:
   - (a) **Home: Category picker** — 6 large cards (Plates / Bowls / Cups / Boxes / Utensils / Decor), each click jumps to a filtered `/products?category=...`
   - (b) **Products page: Featured-product carousel** — all 14 SKUs as horizontally-sliding cards
   - (c) **Both** — Home gets categories, Products page gets featured items
   - **My default if you don't reply:** option (c).

2. **Card illustrations** — Klaro Care uses 3D illustrated icons (piggy bank, car, bike, heart). For Rathika, do you want:
   - (a) **Real product photos** of the actual product, cut out clean against a pastel-tinted card background — most authentic, uses what's in `./inputs/`
   - (b) **Hand-drawn flat illustrations** (banana leaf, plate, cup motifs) — more stylized, but I'd need to either commission these or generate placeholder SVGs you can replace
   - **My default:** option (a). The product photos are real, and authenticity beats illustration for a heritage brand.

3. **`klaro-design-ui` slider component** — does the library already expose a horizontal slider / carousel / snap-scroll component? If yes, I'll use it. If no, I'll build one in `src/app/shared/category-slider/` using native CSS scroll-snap + a thin Angular wrapper for prev/next buttons. Confirm the path or point me to the library.

4. **Card pastel tints** — Klaro Care uses a different soft pastel per card (peach, lavender, mint, rose, etc.). For Rathika, the palette is green + cream + earth (no pastels). Two options:
   - (a) **Stay disciplined**: every card uses cream `#F8F4EC` with subtle green tint variation per category (e.g., plates = `#E8F0E5`, bowls = `#EFE8DA`, cups = `#E5EBE0`)
   - (b) **Borrow Klaro Care's pastels** directly — peach/lavender/mint per category
   - **My default:** option (a). Pastels would clash with the heritage-earthy direction. We get the same *energy* of the Klaro Care row without losing the brand.

5. **Slider behavior** — confirm:
   - Swipe on touch, drag on desktop, prev/next buttons on hover, dot indicators below
   - Snap to card on release, no auto-play, no infinite loop (linear scroll)
   - Keyboard arrow-key support and visible focus
   - Reduced-motion: disable smooth-scroll animation, keep functional scroll
   - **My default if you don't reply:** all of the above.

6. **Items I will *not* fabricate** — confirm I should **completely omit** any of the following if you don't have real data, rather than scaffold a hidden placeholder:
   - Customer testimonials and quotes
   - Customer/restaurant/cafe names and logos
   - Statistics (plates pressed, kg waste diverted, years in operation, customers served)
   - Certifications and trust badges (ISO, FDA, FSSAI, MSME, GST)
   - Awards or press mentions
   - Founder photos or names
   - **My default:** if no real source, the section is removed from the page entirely. No empty boxes, no "coming soon," no greyed-out placeholders.

7. **Wholesale / B2B page** — should I add `/wholesale` now (B2B inquiry form → WhatsApp) or skip for v2?
   - **My default:** add it. Bulk orders are the largest revenue path in this category.

After I answer, **summarize my answers in one paragraph and confirm before continuing.**

---

## 3. ANTI-HALLUCINATION RULES (binding)

These rules are stricter than v1 because we're adding sections that tempt fabrication.

- **Never fabricate testimonials, customer names, quantities, certifications, awards, or statistics.** Not as scaffolds. Not as hidden TODOs. Not as comments. **If you don't have a real source, the section does not exist.**
- **No "coming soon," no "trusted by 1000+ customers" without a verifiable source, no Lorem ipsum, no placeholder logos.** A clean page with fewer real sections beats a busy page with fake ones.
- **Never invent `klaro-design-ui` APIs.** Verify against the library source. If unsure, ask.
- **Never invent product specs.** The decompose time, oven safety, microwave safety, weight, dimensions, etc., must come from the user. If a spec isn't supplied, omit the row from the spec table — do not estimate.
- **Never modify** the product price/size data, the WhatsApp link, the address, or the deploy config without asking.
- **Never add a third-party animation library** (GSAP, Framer Motion, Lottie, Swiper) without asking. Native CSS scroll-snap + IntersectionObserver + `@angular/animations` covers everything in this brief.
- **Verify, then declare done.** Build output and screenshot description in plain text at the end of every phase.

---

## 4. AUDIT PHASE — required before any rebuild work

Before writing new code, do all of the following and report back as one document. Do not skip.

### 4a. Code inventory
List every component, directive, service under `src/`. For each: path, purpose (one line), wraps `klaro-design-ui` or custom, rough LOC.

### 4b. Visual inventory of the live site
Per route (`/`, `/products`, `/products/:slug`, `/about`, `/contact`): sections present in order, scroll depth (short/medium/long), motion present (probably none), what's missing vs. §8 blueprint below.

### 4c. Asset inventory
List every file under `src/assets/` and `./inputs/`. Mark used vs. orphaned. Identify which product photos have backgrounds vs. cleaned cutouts. Note: the rebuild needs **clean cutouts on transparent backgrounds** for the category slider — list which photos already qualify and which need a background-removal pass.

### 4d. `klaro-design-ui` re-audit
Re-read library exports. Table: components currently used vs. components available but unused that the rebuild will need (slider/carousel, card with hover, badge/chip, statistic, testimonial, accordion, page-transition wrapper, scroll-reveal directive).

### 4e. Performance baseline
Run Lighthouse on the live URL for Home and Products. Record current scores. Rebuild must not regress.

**Stop. Show me the audit. Wait for green light before §5 onwards.**

---

## 5. PRESERVE — do not change

- `src/data/products.ts` (slug, name, size, price, category)
- Address, phone, WhatsApp link, email
- Route paths
- `CNAME`, `404.html`, `.nojekyll`, `baseHref`
- `.github/workflows/deploy.yml`
- `klaro-design-ui` import path

If you must change any of these, ask first.

---

## 6. THE HORIZONTAL CATEGORY SLIDER — primary deliverable

This section gets its own §6 because it's the centerpiece of the rebuild.

### 6a. Reference behavior (Klaro Care)
The user-supplied screenshot shows 9 cards in a row, slightly overlapping the right edge of the viewport (a sliver of the next card visible — the standard "more to scroll" affordance). Each card is taller than wide (roughly 3:4 aspect). Each has:
- A soft pastel background tint, unique per card
- A short bold label at the top-left ("Travel Insurance", "Home Insurance")
- A large 3D-style illustration anchored at the bottom, breaking out of the card's bottom-right corner slightly for visual energy
- Generous padding around the label
- Rounded corners (~16–20px)

### 6b. Rathika adaptation — Home page category slider

**Categories** (6 cards, in this order):
1. **Plates** — hero image: the 10×12 partition plate or normal plate
2. **Bowls** — hero image: the ice cream bowl
3. **Cups** — hero image: the tea cup with chai
4. **Boxes** — hero image: the parcel box stack
5. **Utensils** — hero image: the row of nested spoons
6. **Decor** — hero image: the Vinayagar statue

**Card spec:**
- Aspect ratio: 3:4 portrait (e.g., 280×380px desktop, 220×300px mobile)
- Background: cream `#F8F4EC` with a subtle green tint variation per category (per Q4 default):
  - Plates: `#E8F0E5`
  - Bowls: `#EFE8DA`
  - Cups: `#E5EBE0`
  - Boxes: `#F0EAD6`
  - Utensils: `#E8EDDB`
  - Decor: `#EDE4D3`
- Border-radius: 20px
- Hairline border: 1px `#D9D2C2`
- Label: top-left, padding 24px, Fraunces 24/28 weight 600, color `--rathika-green-900`
- Eyebrow above label: small caps 11px, letter-spacing 0.12em, color `--rathika-green-700`, content like "Tableware" or "Ceremonial"
- Hero image: clean cutout product photo, anchored bottom-right, allowed to bleed slightly past the card edge by ~8% for visual energy
- Image width: ~70% of card width
- On hover (desktop): card lifts 4px, shadow softens, image scales 1.04 with `transform-origin: bottom right`, 200ms ease-out
- On focus: 2px green outline, 2px offset
- Click target: entire card → `/products?category=plates` etc.

**Slider container spec:**
- Horizontal scroll with CSS `scroll-snap-type: x mandatory`
- Each card has `scroll-snap-align: start`
- Padding-inline-start: matches the page's content gutter so the first card aligns with body copy
- Padding-inline-end: full viewport - card width, so the last card can snap to the start position with breathing room
- Gap between cards: 16px
- A visible *sliver* of the next card always peeks (~32px) — this is the affordance that says "scrollable"
- On desktop: prev/next arrow buttons appear on hover, positioned outside the card row
- On mobile: native touch scroll, no buttons
- Below the row: small dot indicators showing current position (one dot per card), updated via IntersectionObserver
- Keyboard: arrow keys advance focus to next/prev card when slider is focused; Enter activates
- Accessibility: `role="region"` `aria-label="Browse by category"`, each card is a real `<a>` tag

### 6c. Products page — featured-product slider (if Q1 is option (b) or (c))

Same component, configured for SKUs instead of categories. 14 cards. Below the slider: full grid of all products with category filter chips. The slider is the *featured row*; the grid below is the catalog.

### 6d. Implementation

If `klaro-design-ui` exposes a slider, use it. Otherwise build:

```
src/app/shared/horizontal-slider/
  horizontal-slider.component.ts
  horizontal-slider.component.html
  horizontal-slider.component.scss
  category-card.component.ts
  category-card.component.html
  category-card.component.scss
```

Pure CSS scroll-snap + small Angular component. No third-party slider library. The whole thing should be under 8KB of JS.

### 6e. What this slider must NOT do
- ❌ Auto-play / auto-advance
- ❌ Infinite-loop wrap-around
- ❌ Cover-flow / parallax-rotation effects
- ❌ Card stack / fan-out / 3D perspective
- ❌ Bouncing easing on snap
- ❌ Heavy entry animations
- ❌ Use `Swiper.js`, `keen-slider`, or any other library

Restraint is the brand voice. The slider should feel like Apple's product page strips, not like a Bootstrap carousel.

---

## 7. NEW DESIGN LANGUAGE (everything beyond the slider)

### 7a. Depth — the biggest fix beyond the slider
Add layers:
- Photos sit on tinted blocks, not raw cream
- Section breaks use full-bleed dark green (`--rathika-green-900`) bands for rhythm — typically the "How it's made" and the CTA bands
- Cards have 1px hairline + 1–2px shadow at rest, 4px on hover
- Footer sits on `--rathika-green-900`

### 7b. Motion — intentional only
Approved patterns:
- **Hero**: slow Ken Burns on the lifestyle photo, 8–12s, 100%→105%, no stutter
- **Scroll-reveal**: sections fade up `translateY(16px) → 0` over 400ms, 100ms stagger between siblings, only first viewport entry
- **Slider snap**: 250ms ease-out
- **Card hover**: 200ms ease-out
- **Page route transitions**: 200ms opacity crossfade via `@angular/animations`
- **Sticky WhatsApp button**: subtle pulse every 4s for 600ms

All motion respects `prefers-reduced-motion: reduce`. Forbidden: animations >800ms, bouncing easings, rotations, particle effects, cursor followers, decorative loaders.

### 7c. Photography
- Hero: full-bleed lifestyle photo, 100vh desktop / 60vh mobile, soft `--rathika-green-900` gradient at the bottom 30% so text reads
- Slider cards: clean product cutouts on tinted backgrounds (per §6b)
- Lifestyle bands: full-bleed between sections, with 3% SVG noise overlay for warmth

### 7d. Typography
- **Display heading** (Fraunces or Cormorant Garamond, 600): hero h1 `clamp(40px, 6vw, 88px)`, line-height 1.05
- **Section h2**: same family, `clamp(28px, 4vw, 48px)`
- **Eyebrow**: small caps, letter-spacing 0.12em, all uppercase, 12px — every section gets one
- **Body** (Inter): 16px, 1.65 line-height, max-width 62ch
- **Pull quote** (italic display serif, 28px): for the brand statement on About

### 7e. Color discipline
Same palette, stricter use:
- Cream `#F8F4EC`: ~70% of canvas
- Forest green `#1F3A2B`: full-bleed bands and footer only — provides rhythm
- Earth tones: product detail accents and the manufacturing-story illustrations only
- Terracotta `#B8533A`: CTAs and price tags only, max twice per viewport, never on backgrounds or body

---

## 8. PAGE BLUEPRINTS

Sections marked **[OMIT IF NO REAL DATA]** must be removed entirely if real data isn't supplied. No placeholders.

### Home (target: 5–6 viewports)
1. Hero — full-bleed lifestyle photo, Ken Burns, h1, two CTAs, eyebrow "Manufactured in Neelambur, Coimbatore"
2. Trust strip — single horizontal band, hairline-divided, real-only claims (e.g., "Made in Coimbatore", "100% Biodegradable", "Chemical-free, food-safe", "Bulk orders welcome")
3. **Category slider** (§6b) — *primary new section*
4. Story — text + photo, asymmetric two-column, drop-cap on first paragraph
5. How it's made — three-step visual: banana stem → fiber → finished product, hand-drawn SVG ornaments + photos from `./inputs/`
6. Six pillars — keep current numbered list, add scroll-reveal stagger
7. Stats band **[OMIT IF NO REAL NUMBERS]**
8. Where it's used — keep, but render as horizontal scroll on mobile, 5×2 wrap on desktop, with small icons
9. Testimonials **[OMIT IF NO REAL TESTIMONIALS]**
10. CTA band — terracotta accent, "Place an order on WhatsApp"
11. Footer (rebuilt, §10)

### Products
- Page header with eyebrow + title + one-line lede
- (If Q1 = b/c) Featured product slider — same component as category slider, configured for SKUs
- Sticky filter bar — category chips
- Search input, client-side filter
- Full grid: 3 cols desktop / 2 tablet / 1 mobile
- Default sort: by category, then price ascending

### Product detail (`/products/:slug`)
- Breadcrumb
- 16:10 hero photo (not square) + thumbnail strip if multiple photos exist
- Title, size, price prominent
- "Order this on WhatsApp" terracotta button (large, pre-fills slug + size in message)
- Spec table — only real specs you've been given; omit unknown rows entirely
- Short paragraph: "How it's used" / customer scenarios
- "From the same category" — 4 related products
- `Product` JSON-LD verified emitting

### About
1. Hero — workshop or founder photo, large
2. Story — 3–4 paragraphs, max-width 62ch, drop-cap on first letter
3. How it's made (same component as Home)
4. Sustainability impact stats **[OMIT IF NO REAL NUMBERS]**
5. Certifications wall **[OMIT IF NO REAL CERTIFICATIONS]**
6. CTA — "Visit our workshop or place an order"

### Contact
1. Address card with static map image (PNG, not iframe)
2. Three CTAs as cards: phone / WhatsApp / email
3. Hours
4. Light inquiry form: name, message, optional phone → opens wa.me with prefilled body

### Wholesale (`/wholesale`, new — only if Q7 = yes)
1. Hero — lifestyle photo of bulk use (event/wedding) — *only if a real photo exists; otherwise skip the hero image*
2. Pitch: "For restaurants, caterers, weddings, festivals"
3. Volume hint: "Bulk pricing on orders of 1,000+ pieces. Discount tiers at 5,000 and 10,000."
4. Inquiry form — name, business, items, quantity, event date, city → on submit, opens WhatsApp with the message body pre-filled. **No backend.**
5. Service area — "Coimbatore, Erode, Tiruppur, Salem, Chennai" *only if you confirm these are accurate; otherwise omit the list*
6. Response time note: "Typical reply within working hours, often same-day"

---

## 9. SUPPORTING UI ELEMENTS

### 9a. Sticky floating WhatsApp button (every page)
Bottom-right, 56px circle, terracotta background, white WhatsApp glyph (inline SVG, not icon font), `aria-label="Order via WhatsApp"`. Subtle 4s pulse. Hides on scroll-down past 400px, reappears on scroll-up.

### 9b. Product card upgrade (used in grid)
Current cards: photo + name + size + price. Add:
- Small category chip top-left
- "Order on WhatsApp" mini-button on hover, prefills slug + size
- "Per piece" annotation under price
- Lift + shadow on hover (per §7b)

### 9c. Footer rebuild (site-wide)
Four-column desktop, stack mobile:
1. **Brand**: logo, tagline, address
2. **Catalog**: links to each category
3. **Company**: About, Wholesale (if added), Contact, Privacy
4. **Reach us**: phone, WhatsApp, email, hours

Below: thin newsletter row *only if a real submission target exists; otherwise omit*. Then copyright.
Footer sits on `--rathika-green-900`.

---

## 10. ACCESSIBILITY GUARDRAILS

- All motion respects `prefers-reduced-motion: reduce`
- 2px green focus outline, 2px offset, never removed
- Slider: `role="region"`, `aria-label`, keyboard arrow support, focus moves through cards
- Sticky WhatsApp: `aria-label`
- Carousels (if testimonials added later): `aria-roledescription="carousel"`, prev/next labelled, pause-on-hover
- All images: meaningful `alt` describing the photo, not the SKU
- Color contrast verified against cream AND new dark bands
- One `h1` per page; no level skips
- axe reports zero violations on every route

---

## 11. PERFORMANCE BUDGET

| Metric | Budget |
|---|---|
| Initial JS (gzip) | < 150 KB |
| Initial CSS (gzip) | < 30 KB |
| Hero image (LCP) | < 80 KB AVIF |
| Total page weight (home) | < 900 KB |
| Slider component JS | < 8 KB |
| FCP (4G mobile) | < 1.0 s |
| LCP | < 1.8 s |
| CLS | < 0.05 |
| TBT | < 150 ms |
| Lighthouse Performance | ≥ 95 |
| Lighthouse SEO | = 100 |

Lighthouse-CI gate in GitHub Actions stays. **No regression.**

---

## 12. KLARO-DESIGN-UI USAGE

- Lead with `klaro-design-ui` for buttons, inputs, layout grids, badges, accordions, page-transition wrappers, statistic blocks
- Custom components only when verified-missing
- Match the visual vocabulary of `hiklaro.com/care` — same restraint, same transition discipline
- Each custom component justified in `src/app/shared/README.md`

---

## 13. EXECUTION PLAN — phased with checkpoints

Stop and confirm after each phase.

1. **Ask** (§2) — get my answers, summarize, confirm.
2. **Audit** (§4) — show the report.
3. **Foundation** — palette/typography discipline (§7d, §7e), motion tokens, sticky WhatsApp (§9a), focus styles, `@angular/animations`, page-transition wrapper. No new sections yet.
4. **Horizontal slider component** (§6) — build and review the slider component in isolation, with placeholder cards. Get my green light on the visual before wiring real data.
5. **Home rebuild** (§8 Home) — section by section. Pause for review after the hero, after the slider goes live with real categories, and after "How it's made".
6. **Products page** (§8 Products) — including the featured product slider variant if Q1 = b/c.
7. **Product detail** (§8 Product detail) — upgraded layout, real-spec-only table.
8. **About rebuild** (§8 About) — omitting any [OMIT IF NO REAL DATA] section that lacks a source.
9. **Contact** (§8 Contact) + **Wholesale** (§8 Wholesale, if Q7 = yes).
10. **Footer rebuild** (§9c) — applied site-wide.
11. **Polish** — Lighthouse, axe, AVIF re-export, copy proofread.
12. **Deploy** — push to `main`, verify Action passes, verify live.

End every phase with: build output, brief description of what changed, screenshot description in plain text. Wait for green light before next phase.

---

## 14. DEFINITION OF DONE

- [ ] Live site reflects the rebuild
- [ ] Lighthouse on Home, Products, a Product detail, About, Contact, Wholesale (if added): Performance ≥ 95, A11y ≥ 95, BP ≥ 95, SEO = 100 — no regression
- [ ] Horizontal category slider on Home works on touch + mouse + keyboard, with snap, prev/next buttons, dot indicators
- [ ] Featured product slider on Products page (if Q1 = b/c)
- [ ] Sticky WhatsApp button on every route
- [ ] Hero has Ken Burns motion (or static under reduced-motion)
- [ ] "How it's made" section on Home and About
- [ ] Trust strip on Home (real claims only)
- [ ] All [OMIT IF NO REAL DATA] sections either populated with verified real content **or removed entirely** — no empty placeholders
- [ ] Wholesale page exists with WhatsApp-prefill inquiry form (if Q7 = yes)
- [ ] Footer is the new four-column layout
- [ ] All product cards have hover lift + category chip + WhatsApp mini-CTA
- [ ] axe reports zero violations
- [ ] Reduced-motion honored — verified by toggling OS setting
- [ ] No third-party animation/slider library introduced without approval
- [ ] No `klaro-design-ui` primitive reinvented as custom without justification
- [ ] No fabricated names, numbers, certifications, testimonials, or stats
- [ ] GitHub Actions still passes; CNAME / 404 / .nojekyll intact
- [ ] `REBUILD_NOTES.md` documents: what changed, what was omitted for lack of real data, what's deferred to v2

---

## 15. RULES OF ENGAGEMENT

- Ask the §2 questions first. Always.
- Audit (§4) before building.
- Commit small, themed commits with conventional messages.
- Run the build at the end of every phase.
- If a section in §8 is marked [OMIT IF NO REAL DATA] and you don't have the data, **delete it from the page**. Do not scaffold. Do not hide. Do not "TODO."
- If you uncover a conflict between this brief and the current code, surface it.
- Show command output, not paraphrase, when declaring done.

**Begin with §2. Print the questions and wait for my answers.**

# Claude Code Prompt — Rathika Biotech REBUILD v3
## Premium pro-grade rebuild: mobile-first, motion-rich, Klaro-Care-class polish

---

## 1. CONTEXT — read carefully

**The site is live at `https://jeevayovan.github.io/bio-tech/`. Deployment works. Don't break it.**

- Stack: Angular + `klaro-design-ui` (the user's own library, also powering `hiklaro.com/care`)
- Routes: Home, Products, Product detail, About, Contact, Privacy
- Content (14 products, prices, address, WhatsApp link) is correct and final
- 14 product photos and lifestyle photos are in `./inputs/`, already wired
- GitHub Actions deploys on push to `main`

### What "pro-grade" means for this rebuild

The user has named two reference points and one anti-pattern.

**Reference 1 — `hiklaro.com/care`**: same author's polished Angular SPA. Source of the horizontal category-card slider pattern. Specifically: tall cards (3:4 portrait), pastel-tinted backgrounds, large illustrated/photographed subjects anchored at the bottom of each card, a sliver of the next card always peeking off the right edge as the affordance for horizontal scroll, snap-to-card on release, restrained motion.

**Reference 2 — Indian competitors**: `goeco.co.in`, `growood.in`, `ecodeliciouspulp.com`, `ecolates.com`. These show the *trust-signal density* of the category — certifications walls, factory photos, exhibitions, blog grids, Instagram embeds, multi-column footers. Rathika's current build is missing this entire layer.

**Anti-reference — "more animations" generic interpretation**. The current Rathika site has zero motion and reads as flat. The fix is **not** to spray motion everywhere. The Klaro Care slider works because it has *one* coherent animation (horizontal snap scroll). The fix is: a small number of intentional motion moments, each one answering "what does this clarify?" — never decoration.

---

## 2. ASK FIRST — answers required before any code

Print these as a numbered list. Wait for replies. Each question has a default — if you reply *"all defaults"*, proceed.

1. **Slider scope** — Apply Klaro-Care-style horizontal slider to:
   - (a) Home: category picker (6 cards)
   - (b) Products page: featured-product carousel (14 cards)
   - (c) Both
   - **Default: (c)** — Home gets categories, Products gets featured items above the full grid.

2. **Card visuals** — Klaro Care uses 3D illustrations. For Rathika:
   - (a) Real product photos, cleaned cutouts, on tinted card backgrounds
   - (b) Hand-drawn flat illustrations
   - **Default: (a)**. Real photos beat illustrations for a heritage brand.

3. **`klaro-design-ui` slider component** — does the library expose a slider/carousel/snap-scroll component? Read the library exports first, then answer. If yes, use it. If no, build pure-CSS scroll-snap in `src/app/shared/horizontal-slider/`.

4. **Card pastel tints** — Klaro Care uses different soft pastels per card. For Rathika:
   - (a) Cream variations per category (on-brand)
   - (b) Klaro Care's pastels (peach/lavender/mint)
   - **Default: (a)**. Pastels would clash with the heritage-earthy palette.

5. **Items I will *not* fabricate** — confirm I should completely **omit** (not scaffold, not hide, not "TODO") any of these if you don't have real data:
   - Customer testimonials and quotes
   - Restaurant/cafe/customer names and logos
   - Statistics (plates pressed, kg waste diverted, years operating, customers served)
   - Certifications (ISO, FDA, FSSAI, MSME, GST, BPI)
   - Awards or press mentions
   - Founder names or photos
   - **Default: yes, omit entirely.** A clean page with fewer real sections beats a busy page with fake ones.

6. **Wholesale page** — add `/wholesale` now (B2B inquiry → WhatsApp prefill) or v2?
   - **Default: add now.** Bulk orders are the largest revenue path in this category.

7. **Animation tolerance** — confirm the animation budget in §7 is acceptable: ~12 specific motion moments site-wide, each ≤ 400ms, GPU-cheap, all respecting `prefers-reduced-motion`. **No** Lottie animations, **no** parallax scroll on text, **no** auto-play carousels, **no** counters that don't tied to real numbers, **no** cursor followers, **no** scroll-jacking, **no** elements that animate on every scroll (only on first viewport entry).
   - **Default: yes, agreed.**

After I answer, **summarize my answers in one paragraph and confirm.**

---

## 3. ANTI-HALLUCINATION RULES (binding)

- **Never fabricate testimonials, names, quantities, certifications, awards, or statistics.** If no real source: section is removed, not scaffolded.
- **No "coming soon," no Lorem ipsum, no placeholder logos, no greyed-out "trusted by X" without X.** Empty beats fake.
- **Never invent `klaro-design-ui` APIs.** Verify against library source. Unsure → ask.
- **Never invent product specs.** If a row of the spec table isn't supplied, omit the row.
- **Never modify** product data, WhatsApp link, address, or deploy config without asking.
- **Never add a third-party animation, slider, or motion library** (GSAP, Framer Motion, Lottie, Swiper, AOS, ScrollTrigger) without asking. Native CSS + IntersectionObserver + `@angular/animations` is sufficient.
- **Verify, then declare done.** Build output and screenshot description in plain text at end of every phase.

---

## 4. AUDIT PHASE — required before any rebuild work

Before writing new code, do all of the following and report back as one document.

### 4a. Code inventory
List every component, directive, service under `src/`. Per item: path, purpose, wraps `klaro-design-ui` or custom, rough LOC.

### 4b. Visual inventory of the live site, **mobile-first**
Per route: open in a 375×812 mobile viewport first, then 1440×900 desktop. List sections, scroll depth on mobile, motion present, what's missing vs. §9 blueprint. **Note any place where mobile breaks or is harder to use than desktop.**

### 4c. Asset inventory
List `src/assets/` and `./inputs/`. Mark used vs. orphaned. Identify which product photos have backgrounds vs. cleaned cutouts. **The slider needs cutouts on transparent backgrounds — list which photos need a background-removal pass.**

### 4d. `klaro-design-ui` re-audit
Re-read library exports. Table: components used vs. components available but unused that the rebuild will need (slider, card, badge, statistic, testimonial, accordion, page-transition, scroll-reveal directive, motion utilities).

### 4e. Performance baseline — *mobile-first*
Run Lighthouse **mobile** (slow 4G, mid-tier device) on the live URL for Home and Products. Record current scores. Run **desktop** Lighthouse second. Rebuild must not regress mobile.

**Stop. Show me the audit. Wait for green light before §5 onwards.**

---

## 5. PRESERVE — do not change

- `src/data/products.ts`
- Address, phone, WhatsApp link, email
- Route paths
- `CNAME`, `404.html`, `.nojekyll`, `baseHref`
- `.github/workflows/deploy.yml`
- `klaro-design-ui` import path

If you must change any of these, ask first.

---

## 6. MOBILE-FIRST IS NON-NEGOTIABLE

This is the most important section in the whole brief. Most Indian e-commerce traffic is mobile, often on mid-tier Android phones over 4G. The site lives or dies here.

### 6a. Mobile-first means write mobile CSS first
Every component is built mobile-first. Desktop is the enhancement, not the baseline. SCSS pattern:

```scss
.component {
  /* mobile (default) */
  ...

  @media (min-width: 768px) {
    /* tablet enhancements */
  }

  @media (min-width: 1024px) {
    /* desktop enhancements */
  }
}
```

**Never** start a component with desktop styles and try to override for mobile. That always produces a worse mobile experience.

### 6b. Touch targets and thumb zones
- Every interactive element ≥ 44×44 CSS pixels (Apple HIG) — buttons, links, slider arrows, filter chips, footer links
- Primary CTAs in the **thumb zone** on mobile: bottom 30% of the viewport (sticky WhatsApp button qualifies)
- Spacing between adjacent tap targets ≥ 8px
- No hover-only interactions — every hover state has a press/active/focus equivalent
- Forms: 16px input font-size minimum (anything smaller triggers iOS zoom-on-focus, which is awful)

### 6c. Mobile-specific UI rules
- Never produce horizontal page scroll. If something overflows on 320px, fix it.
- Slider components scroll horizontally *internally* (CSS scroll-snap, native momentum) — page itself never does
- Slider prev/next buttons are **hidden on mobile** — touch users swipe natively, buttons are clutter
- Slider dot indicators **shown on mobile** — they're the affordance for "where am I in the row"
- Sticky WhatsApp button is **bigger on mobile** (60px) than desktop (56px)
- Footer collapses to single column on mobile, hairline-divided
- Forms are single-column on mobile
- Long-form copy max 38ch on mobile (vs 62ch desktop) for better readability
- Drop-caps disabled below 768px — they look bad small

### 6d. Mobile performance
The Lighthouse mobile gate is what matters. Specific budgets:

| Metric | Mobile budget |
|---|---|
| FCP | < 1.5 s |
| LCP | < 2.0 s |
| CLS | < 0.05 |
| TBT | < 200 ms |
| INP | < 200 ms |
| Initial JS (gzip) | < 150 KB |
| Initial CSS (gzip) | < 30 KB |
| Hero image (LCP) | < 60 KB AVIF mobile / 80 KB desktop |
| Total page weight (mobile home) | < 700 KB |
| Slider component JS | < 8 KB |

### 6e. Image responsiveness
- Use `<picture>` with mobile-first sources: AVIF first, WebP fallback, JPG fallback
- Specify mobile dimensions explicitly (e.g., 360w, 720w, 1080w with `srcset`)
- Hero photo: serve a 480w image to mobile, never a 1920w
- Product photos: 320w to mobile, 640w to desktop
- All images have `width` and `height` attributes (CLS protection)
- Lazy-load every image except the LCP

### 6f. Mobile interactions
- Swipe gestures on sliders: native CSS scroll-snap (no JS gesture library)
- Pull-to-refresh: don't disable it
- Tap-highlight: customize `-webkit-tap-highlight-color` to a subtle terracotta tint
- No long-press context menus on links (don't override; default browser behavior is fine)
- Form submit on mobile: full-width button, sticky-bottom on long forms

### 6g. Mobile testing requirement
At every phase checkpoint, Claude Code must verify by inspecting the rendered output:
- 320×568 (oldest iPhone SE)
- 375×812 (modern iPhone)
- 414×896 (iPhone Pro Max)
- 360×800 (mid-tier Android)
- 768×1024 (iPad)

Report any layout that fails at any of these widths.

---

## 7. ANIMATION BUDGET — exactly what's allowed, nothing more

The user asked for "more animations like the website I shared." That website (Klaro Care) has restrained, intentional motion — not Lottie-everywhere. The list below is the **complete** animation set for the rebuild. Claude Code may not add motion outside this list without asking.

Each animation is GPU-cheap (`transform` + `opacity` only, never `width`/`height`/`top`/`left`), ≤ 400ms, ease-out by default, and disabled under `prefers-reduced-motion: reduce`.

### 7a. The 12 sanctioned animations

1. **Page route transition** — opacity crossfade 200ms via `@angular/animations`. On every Angular Router navigation. Outgoing route 0% opacity at 100ms, incoming route 0→100% over 200ms.

2. **Hero Ken Burns** — slow zoom from `scale(1.0)` to `scale(1.05)` over 12s, ease-in-out, infinite alternate. Only on the home hero image. Disabled below 768px (mobile gets static image to save battery and data).

3. **Hero text entrance** — h1, lede, CTAs fade-up from `translateY(24px) opacity:0` to `0 opacity:1` over 500ms with 80ms stagger between elements. Plays once on initial load.

4. **Section scroll-reveal** — when a section enters the viewport for the first time, fade-up `translateY(16px) opacity:0 → 0 opacity:1` over 400ms, with 80ms stagger between immediate child elements (max 5 staggered children — beyond that, reveal as a group). IntersectionObserver triggers once, then disconnects. Only triggers on **first** viewport entry, never re-triggers on re-scroll.

5. **Slider snap** — 250ms ease-out on the horizontal scroll-snap. Native browser behavior, no JS.

6. **Slider card hover (desktop)** — lift `translateY(-4px)`, shadow softens 1px→4px, image inside scales `1.0→1.04` with `transform-origin: bottom right`, all 200ms ease-out. **No transform on touch devices** — only the press state (see #7).

7. **Touch press feedback** — every interactive element on touch devices: `transform: scale(0.97)` for 100ms on `:active`, `opacity: 0.85`. This is the mobile equivalent of hover.

8. **Button hover (desktop)** — primary terracotta CTAs: background darkens 5%, text-decoration none, 150ms ease-out. No movement.

9. **Sticky WhatsApp pulse** — `box-shadow` ring expands `0 → 12px` and fades `0.4 → 0` over 600ms, every 4s. Decorative but gentle. Disabled under `prefers-reduced-motion`.

10. **Sticky WhatsApp show/hide** — slides in from below `translateY(80px) → 0` over 200ms when scroll direction reverses. Hides on continuous scroll-down past 400px.

11. **Filter chip toggle (Products page)** — selected state animates background and text color over 150ms. No movement.

12. **Form field focus** — input border color transitions from rule-color to brand-green over 150ms. Label, if floating, slides up with the same timing.

### 7b. Forbidden — explicit list
- ❌ Auto-play on any slider or carousel
- ❌ Infinite-loop wrap-around sliders
- ❌ Cover-flow / 3D-perspective / fan-out carousels
- ❌ Parallax on text (only allowed on background images, and only on desktop)
- ❌ Counters animating on scroll-into-view **unless** the number is real and verified
- ❌ Lottie animations
- ❌ Particle effects, snowfall, floating leaves, etc.
- ❌ Cursor followers, custom cursors, magnetic buttons
- ❌ Scroll-jacking (any code that hijacks native scroll)
- ❌ Animations on every scroll event (only first viewport entry)
- ❌ Bouncing easings (`cubic-bezier(0.68, -0.55, 0.265, 1.55)` and friends)
- ❌ Rotation animations on icons, logos, anything
- ❌ Shimmer placeholders on already-loaded content
- ❌ Auto-scroll testimonial carousels
- ❌ "Animated underline" on every link (only on primary CTAs and the active nav item)
- ❌ Any animation longer than 800ms
- ❌ Any animation that uses `width`/`height`/`top`/`left`/`margin`

### 7c. Reduced-motion override
A single `@media (prefers-reduced-motion: reduce)` rule disables: Ken Burns, scroll-reveals (snap to final state immediately), slider snap smoothing (still snaps, but instant), WhatsApp pulse, page transitions (instant). Touch-press feedback and form focus stay (they're feedback, not decoration).

---

## 8. DESIGN LANGUAGE

### 8a. Depth — the biggest single fix
Current site is flat. Add layers:
- Photos sit on tinted blocks, never raw cream
- Section breaks use full-bleed `--rathika-green-900` bands for rhythm (typically: "How it's made" band, mid-page CTA band, footer)
- Cards: 1px hairline + 1–2px shadow at rest, 4px on hover
- Footer always sits on `--rathika-green-900`

### 8b. Photography
- Hero: full-bleed lifestyle photo. **Mobile: 60vh, mobile-optimized 480w source, no Ken Burns.** Desktop: 100vh, 1920w, Ken Burns. Soft `--rathika-green-900` gradient on bottom 30% so text reads.
- Slider cards: clean product cutouts on tinted backgrounds (per §10b)
- Lifestyle bands between sections: full-bleed, 3% SVG noise overlay for warmth
- Product detail hero: 16:10, never square

### 8c. Typography
Mobile-first sizes given first.
- **Display h1** (Fraunces or Cormorant Garamond, 600): mobile 40px / tablet 56px / desktop 72px / max 88px. Line-height 1.05.
- **Section h2**: mobile 28px / tablet 36px / desktop 48px. Line-height 1.15.
- **Eyebrow**: small caps 11px, letter-spacing 0.12em, all uppercase. Every section gets one.
- **Body** (Inter): mobile 15px (line-height 1.6) / desktop 16px (line-height 1.65). Max-width 38ch mobile / 62ch desktop.
- **Pull quote** (italic display serif): mobile 22px / desktop 28px.

### 8d. Color discipline
Same palette, stricter use:
- Cream `#F8F4EC`: ~70% of canvas
- Forest green `#1F3A2B`: full-bleed bands and footer only
- Earth tones: product detail accents and "How it's made" illustrations only
- Terracotta `#B8533A`: CTAs and price tags only, max twice per viewport, never on body

---

## 9. PAGE BLUEPRINTS

Sections marked **[OMIT IF NO REAL DATA]** are removed entirely if real data isn't supplied. No placeholders.

### Home (mobile scroll target: 6–7 viewports; desktop: 5–6)
1. **Hero** — full-bleed lifestyle photo (Ken Burns desktop only), eyebrow "Manufactured in Neelambur, Coimbatore", h1, lede, two CTAs (Order on WhatsApp / See catalog)
2. **Trust strip** — single horizontal band, hairline-divided. Real claims only: "Made in Coimbatore", "100% Biodegradable", "Chemical-free, food-safe", "Bulk orders welcome", "Compostable in 30 days"
3. **Category slider** (§10) — *primary new section*
4. **Story** — text + photo, asymmetric two-column desktop, stacked mobile, drop-cap on first paragraph (desktop only)
5. **How it's made** — three-step visual: banana stem → fiber → finished product. SVG illustrations + photos from `./inputs/`. Horizontal on desktop, vertical timeline on mobile.
6. **Six pillars** — current numbered list, with section scroll-reveal stagger (animation #4)
7. **Stats band** **[OMIT IF NO REAL NUMBERS]**
8. **Where it's used** — 5×2 wrap on desktop, horizontal scroll-snap on mobile, small icons
9. **Testimonials** **[OMIT IF NO REAL TESTIMONIALS]**
10. **CTA band** — terracotta accent, "Place an order on WhatsApp"
11. **Footer** (§11)

### Products
- Header: eyebrow + title + one-line lede
- (If Q1 = b/c) **Featured product slider** — same slider component, configured for SKUs
- Sticky filter bar — category chips, sticky to top on scroll, **mobile: horizontal-scrolling chip row**, desktop: wrap
- Search input, client-side filter, debounced
- Full grid: 3 cols desktop / 2 tablet / 1 mobile (single column on phone is correct — *don't* cram 2 cards on a 375px viewport)
- Default sort: by category, then price ascending

### Product detail (`/products/:slug`)
- Breadcrumb (truncates middle on mobile)
- 16:10 hero photo. Mobile: full-width. Desktop: 60% width with thumbnail strip beside.
- Title, size, price prominent
- "Order this on WhatsApp" terracotta button — large, **sticky-bottom on mobile** (in thumb zone), inline on desktop
- Spec table — only real specs you've been given
- Short paragraph: "How it's used"
- "From the same category" — 4 related products, horizontal slider on mobile, 4-column grid on desktop
- `Product` JSON-LD verified

### About
1. Hero — workshop or founder photo, large
2. Story — 3–4 paragraphs, max-width 62ch desktop / 38ch mobile, drop-cap on first letter (desktop only)
3. How it's made (same component as Home)
4. Sustainability impact stats **[OMIT IF NO REAL NUMBERS]**
5. Certifications wall **[OMIT IF NO REAL CERTIFICATIONS]**
6. CTA — "Visit our workshop or place an order"

### Contact
1. Address card with static map image (PNG, not iframe — privacy + perf)
2. Three CTAs as cards: phone / WhatsApp / email. Mobile: stacked, full-width tappable. Desktop: 3-column.
3. Hours
4. Light inquiry form: name, message, optional phone → opens wa.me with prefilled body

### Wholesale (`/wholesale`, new — only if Q6 = yes)
1. Hero — *only if a real bulk-use photo exists, otherwise skip*
2. Pitch: "For restaurants, caterers, weddings, festivals"
3. Volume hint: "Bulk pricing on orders of 1,000+ pieces"
4. Inquiry form — name, business, items, quantity, event date, city → opens WhatsApp with prefilled body. **No backend.**
5. Service area list *only if you confirm it's accurate*
6. Response time note

---

## 10. THE HORIZONTAL CATEGORY SLIDER — primary deliverable

### 10a. Reference behavior (from the Klaro Care screenshot)
9 cards in a row. Right edge of viewport overlaps a sliver of the next card (~32px) — the universal affordance for "scrollable." Each card: 3:4 portrait, soft pastel-tinted background, short bold label top-left, large illustration anchored bottom-right (slight bleed past card edge). Border-radius ~16–20px.

### 10b. Rathika spec — Home page

**Categories** (6 cards):
1. **Plates** — hero: 10×12 partition plate or normal plate
2. **Bowls** — hero: ice cream bowl
3. **Cups** — hero: tea cup
4. **Boxes** — hero: parcel box stack
5. **Utensils** — hero: nested spoons
6. **Decor** — hero: Vinayagar statue

**Card spec:**
- Aspect 3:4 portrait. Mobile: 220×300px. Desktop: 280×380px.
- Background tint per category (cream variations, per Q4 default):
  - Plates `#E8F0E5` · Bowls `#EFE8DA` · Cups `#E5EBE0` · Boxes `#F0EAD6` · Utensils `#E8EDDB` · Decor `#EDE4D3`
- Border-radius 20px
- 1px hairline `#D9D2C2`
- Label top-left, padding 24px (mobile 20px), Fraunces 24/28 weight 600, color `--rathika-green-900`
- Eyebrow above label: 11px small caps, letter-spacing 0.12em, color `--rathika-green-700`, e.g. "Tableware" / "Ceremonial"
- Hero image: clean cutout, anchored bottom-right, allowed to bleed ~8% past card edge
- Image width ~70% card width
- Hover (desktop): animation #6
- Touch press (mobile): animation #7
- Click target: entire card → `/products?category=plates`

**Slider container:**
- Horizontal scroll, `scroll-snap-type: x mandatory`, each card `scroll-snap-align: start`
- `padding-inline-start` = page gutter; `padding-inline-end` = viewport - card width (so last card snaps cleanly)
- Gap 16px (mobile 12px)
- Sliver of next card always peeks (~32px desktop, ~24px mobile)
- **Desktop only**: prev/next arrow buttons appear on hover, positioned outside the card row
- **Mobile**: native touch scroll, no arrows
- **All viewports**: dot indicators below, one per card, current dot animated via IntersectionObserver
- Keyboard: ←→ arrow keys advance focus to prev/next card when slider has focus; Enter activates
- A11y: `role="region"` `aria-label="Browse by category"`, each card a real `<a>`, dots are `<button>` with `aria-label="Go to category {n}"`

### 10c. Implementation
If `klaro-design-ui` exposes a slider, use it. Otherwise build:

```
src/app/shared/horizontal-slider/
  horizontal-slider.component.ts
  horizontal-slider.component.html
  horizontal-slider.component.scss
  category-card.component.ts
  category-card.component.html
  category-card.component.scss
```

Pure CSS scroll-snap + thin Angular wrapper. **Under 8 KB JS.**

### 10d. Forbidden
- ❌ Auto-play
- ❌ Infinite loop
- ❌ Cover-flow / 3D rotate
- ❌ Card stack / fan-out
- ❌ Bouncing easing on snap
- ❌ Heavy entry animations
- ❌ Swiper.js / keen-slider / any third-party

---

## 11. SUPPORTING UI

### 11a. Sticky floating WhatsApp (every page)
Bottom-right. Mobile 60px, desktop 56px. Terracotta. White WhatsApp glyph (inline SVG). `aria-label="Order via WhatsApp"`. Animation #9 + #10.

### 11b. Product card (used in grid)
Add to current cards: category chip top-left; "Order on WhatsApp" mini-button on hover (desktop)/tap (mobile) prefilling slug+size; "per piece" annotation under price; lift/press feedback.

### 11c. Footer rebuild (site-wide)
Desktop 4-column / mobile single-column hairline-divided:
1. Brand: logo, tagline, address
2. Catalog: links per category
3. Company: About, Wholesale (if added), Contact, Privacy
4. Reach us: phone, WhatsApp, email, hours

Newsletter row *only if a real submission target exists*. Copyright. Footer on `--rathika-green-900`.

---

## 12. ACCESSIBILITY GUARDRAILS

- All motion respects `prefers-reduced-motion: reduce`
- 2px green focus outline, 2px offset, never removed
- Slider: `role="region"`, `aria-label`, keyboard arrow support, focus through cards, dots are buttons
- Sticky WhatsApp: `aria-label`
- All images: meaningful `alt` describing the photo, not the SKU name
- Color contrast verified against cream AND green-900 bands
- One `h1` per page; no level skips
- Forms: labels + `aria-describedby` for errors
- 44×44px minimum touch targets everywhere
- axe reports zero violations on every route at every viewport

---

## 13. KLARO-DESIGN-UI USAGE

- Lead with the library for buttons, inputs, layout, badges, accordions, page-transition wrappers, statistic blocks
- Custom only when verified-missing
- Match `hiklaro.com/care` polish: same restraint, same transition discipline
- Each custom component justified in `src/app/shared/README.md`

---

## 14. EXECUTION PLAN — phased with checkpoints

Stop and confirm at the end of each phase. **Test mobile viewport at every checkpoint.**

1. **Ask** (§2) — get my answers, summarize, confirm.
2. **Audit** (§4) — show the report, including mobile baseline.
3. **Foundation** — palette/typography (§8), motion tokens, sticky WhatsApp (§11a), focus styles, `@angular/animations` route transitions (animation #1), `prefers-reduced-motion` global handling. No new sections yet. Verify mobile.
4. **Horizontal slider component** (§10) — build in isolation with placeholder cards. Verify mobile touch swipe. Get my green light on visual before wiring real data.
5. **Home rebuild** (§9 Home) — section by section. Pause for review after the hero, after the slider goes live with real categories, and after "How it's made". Test mobile at each pause.
6. **Products page** (§9 Products) — including featured slider variant.
7. **Product detail** (§9 Product detail).
8. **About rebuild** — omit every [OMIT IF NO REAL DATA] section that lacks source.
9. **Contact** + **Wholesale** (if Q6 = yes).
10. **Footer rebuild** (§11c) site-wide.
11. **Polish** — Lighthouse mobile + desktop, axe at all 5 viewports, AVIF re-export, copy proofread.
12. **Deploy** — push to `main`, verify Action passes, verify live mobile and desktop.

Each phase ends with: build output, what changed in plain text, mobile + desktop screenshot descriptions, Lighthouse mobile score if applicable. **Wait for green light before next phase.**

---

## 15. DEFINITION OF DONE

- [ ] Live site reflects rebuild
- [ ] **Lighthouse mobile** Home, Products, a Product detail, About, Contact, Wholesale (if added): Performance ≥ 90, A11y ≥ 95, BP ≥ 95, SEO = 100. Mobile threshold 90 (not 95) is realistic; desktop must hit 95.
- [ ] **Lighthouse desktop** same routes: Performance ≥ 95
- [ ] No regression vs. audit baseline
- [ ] Horizontal category slider on Home: works on touch, mouse, keyboard. Snap. Dots. Mobile: no prev/next arrows. Desktop: prev/next on hover.
- [ ] Featured product slider on Products page (if Q1 = b/c)
- [ ] Sticky WhatsApp button on every route, larger on mobile
- [ ] Hero Ken Burns on desktop only; mobile static
- [ ] "How it's made" on Home + About: horizontal desktop, vertical-timeline mobile
- [ ] Trust strip on Home (real claims only)
- [ ] **Every [OMIT IF NO REAL DATA] section either populated with verified content or removed entirely** — no empty placeholders
- [ ] Wholesale page (if Q6 = yes) with WhatsApp-prefill inquiry
- [ ] Footer is new layout, single-column on mobile
- [ ] Product cards have hover lift / touch press, category chip, WhatsApp mini-CTA, per-piece annotation
- [ ] **Mobile verification at 320 / 375 / 414 / 360 / 768** — no horizontal scroll, no broken layouts
- [ ] axe: zero violations every route every viewport
- [ ] `prefers-reduced-motion` honored — verified by toggling OS setting
- [ ] All 12 sanctioned animations present and within budget; no animation outside the §7a list
- [ ] No third-party animation/slider library introduced without approval
- [ ] No `klaro-design-ui` primitive reinvented as custom without justification
- [ ] No fabricated names, numbers, certifications, testimonials, stats
- [ ] GitHub Actions still passes; CNAME / 404 / .nojekyll intact
- [ ] `REBUILD_NOTES.md`: what changed, what was omitted for lack of real data, what's deferred to v2

---

## 16. RULES OF ENGAGEMENT

- Ask §2 first.
- Audit §4 before building.
- Mobile is built first, desktop is the enhancement.
- Every animation must be on the §7a list.
- Commit small, themed, conventional messages.
- Run build at end of every phase. Test mobile viewport.
- Section in §9 marked [OMIT IF NO REAL DATA] and you don't have it → **delete from the page**. Do not scaffold. Do not hide. Do not "TODO".
- Surface conflicts between this brief and the current code.
- Show command output, not paraphrase, when declaring done.

**Begin with §2. Print the questions and wait for my answers.**