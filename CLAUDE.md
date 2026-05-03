# Rathika Biotech Products — Project Memory

## What this is
A static marketing + product catalog site for **Rathika Biotech Products**
— a Coimbatore-based maker of biodegradable tableware from banana fiber,
sugarcane bagasse, and rice husk. Rooted in South Indian tradition and
sustainability. Built with Angular 21, prerendered to static HTML,
deployed free on GitHub Pages at `https://rathika.in`.

**Authoritative spec:** `PROMPT.md` in this repo. When this file and
PROMPT.md disagree, PROMPT.md wins. Re-read it before each phase.

## Stack (locked, do not deviate without an ADR)
- **Framework:** Angular 21 (standalone, signals, modern control flow).
- **Workspace:** plain Angular CLI (no Nx — single-app simplicity).
- **Rendering:** static prerender (`outputMode: 'static'`). Every route
  rendered to HTML at build. No client-only routes.
- **Styling:** SCSS + CSS custom properties at app level (per §9
  palette below). Tailwind v4 is present because `@klaro/ui` requires
  it; we do NOT write app code in Tailwind utility classes.
- **Components:** `@klaro/ui` (56 entry points) for primitives.
  Tree-shakeable secondary imports only.
- **Utilities:** `@klaro/utils` (cn, cva, keyboard, dom).
- **Theming:** `@klaro/theme` `emerald` preset as base, heavily
  overridden toward §9 brand palette.
- **Content:** hand-written, bilingual EN + Tamil (routes `/` and
  `/ta/`). No CMS.
- **Order flow:** WhatsApp-only — `wa.me/919080966792`. Visible phone +
  email + address. No contact form.
- **Hosting:** GitHub Pages (free), custom domain `rathika.in`,
  Cloudflare DNS recommended.
- **Recurring cost:** ~₹700-900/year domain renewal only.
- **Package manager:** npm.

## Brand (canonical — see `PROMPT.md` §11–§12 for full content)
- **Wordmark:** Rathika Biotech Products
- **Address:** 1/447 Avinashi Road, Neelambur, Coimbatore – 641026, TN
- **Phone:** +91 90809 66792 → `tel:+919080966792`
- **WhatsApp:** `https://wa.me/919080966792`
- **Email:** `rathikabiotechproducts@gmail.com`
- **Voice:** formal/corporate ("We manufacture...")
- **Materials:** banana fiber, sugarcane bagasse, rice husk

## Design palette (PROMPT.md §9 — do not invent values)
```
--rathika-green-900: #1F3A2B   deep forest, primary text
--rathika-green-700: #2F5D3F   primary brand
--rathika-green-500: #5B8A6A   secondary
--rathika-green-100: #E8F0E5   surface tint
--rathika-earth-700: #6B4423
--rathika-earth-500: #A07550
--rathika-cream:     #F8F4EC   page background, NOT white
--rathika-ink:       #1A1A1A
--rathika-paper:     #FFFFFF   cards only
--rathika-rule:      #D9D2C2   hairlines
--rathika-accent:    #B8533A   terracotta — CTAs / price tags only
```
Green + cream + earth. Pure white reads digital; cream reads handmade.

## Klaro UI — the rule
The design system already exists. Default behavior:
1. Need a button? `@klaro/ui/button`. Need a card? `@klaro/ui/card`.
2. Before writing ANY new component, run `/klaro-find <need>`. If a
   Klaro primitive covers 80%+, use it.
3. Custom components only when Klaro genuinely lacks the primitive.
   Each gets a one-line justification in `src/app/shared/README.md` per
   PROMPT.md §17.
4. Override Klaro tokens via SCSS custom properties on `:root`. Record
   every override in `docs/design/theme-overrides.md` with rationale.
5. Tree-shakeable imports ONLY: `import { ButtonComponent } from
   '@klaro/ui/button'`. Never the barrel `@klaro/ui`.

## Working agreement (non-negotiable)
1. NEVER invent Klaro APIs, props, variants, or tokens. Verify by
   reading `c:\Users\Jeevan_Yovan E\AI\klaro-design-ui\libs/ui/`.
2. NEVER fabricate product details. The 14 SKUs (slugs, prices, sizes)
   come from `PROMPT.md` §11 — do not improvise.
3. NEVER ship anti-patterns from `PROMPT.md` §9 (no purple-blue
   gradients, no glassmorphism, no rounded-2xl on cards, no "Get
   Started" CTAs, no lorem ipsum, etc.).
4. NEVER use deprecated Angular patterns: NgModule-only code, ctor
   injection where `inject()` works, `*ngIf`/`*ngFor` instead of
   `@if`/`@for`.
5. ALWAYS respect the §14 perf budget — initial JS < 150 KB gzip,
   initial CSS < 25 KB, LCP < 1.8s, CLS < 0.05, Lighthouse Perf+A11y+BP
   ≥ 95, **SEO = 100**.
6. ALWAYS prerender every route. No client-only routes.
7. ALWAYS use `NgOptimizedImage` with explicit `width`/`height` and
   AVIF + WebP + JPEG fallback via `<picture>`.
8. NO emojis in code, commits, PRs, docs.
9. NO "Generated with Claude" / Anthropic attribution.
10. ASK before destructive ops: rm, force-push, replacing styling
    approach, ejecting from CLI defaults.

## Performance budget (PROMPT.md §14 — CI gate)
| Metric | Budget |
|---|---|
| Initial JS (gzip) | < 150 KB |
| Initial CSS (gzip) | < 25 KB |
| Hero image (LCP) | < 80 KB AVIF |
| Total page weight (home) | < 800 KB |
| FCP (4G mobile) | < 1.0 s |
| LCP | < 1.8 s |
| CLS | < 0.05 |
| TBT | < 150 ms |

`lighthouse-ci` enforces in `.github/workflows/deploy.yml`.

## Accessibility floor
WCAG 2.1 AA (PROMPT.md §15). Klaro primitives are WAI-ARIA compliant —
preserve that in any wrapper. axe must report zero violations on every
route.

## Build & verify (target — fill exact commands after scaffold)
- `npm install`
- `npm run lint`
- `npm run test`
- `npm run build` → `dist/rathika/browser/`
- `npm run prerender` → static HTML for every route
- `npx serve dist/rathika/browser` → local preview of prerendered output

## Deployment (PROMPT.md §6)
- Source on `main`. CI on push: `npm ci` → `build` → `prerender` →
  `lighthouse-ci` gate → `actions/deploy-pages@v4`.
- `baseHref: '/'` (apex domain via `rathika.in`).
- Postbuild copies `index.html` → `404.html` (SPA fallback).
- `CNAME` file containing `rathika.in` (no protocol, no newline).
- `.nojekyll` empty marker file.
- DNS: 4 A records to GitHub Pages IPs at apex; CNAME for `www`.
  Cloudflare DNS-only mode until cert provisions, then proxy ok.

## Documentation map (load on demand with @)
- `@PROMPT.md`                       authoritative spec — re-read each phase
- `@docs/decisions/`                 ADRs
- `@docs/conventions/klaro-usage.md` Klaro inventory + when-to-use
- `@docs/conventions/performance.md`
- `@docs/conventions/accessibility.md`
- `@docs/conventions/seo.md`
- `@docs/design/theme-overrides.md`  every Klaro token override + rationale
- `@docs/design/pages.md`            page inventory
- `@docs/design/inspiration.md`      references AND anti-references
- `@DEPLOY.md`                       (post-scaffold) GH Pages + DNS setup
- `@SEO_LAUNCH.md`                   (post-scaffold) post-launch off-site checklist

## Workflow
- Plan mode (Shift+Tab) before any change > 50 lines or touching
  `src/app/shared/` (custom components) or theme overrides.
- Every Klaro override or custom component → ADR via `/adr-new`.
- Use `klaro-curator` subagent before merging any visual change.
- Use `performance-engineer` subagent when adding any dependency.
- Conventional commits, small + themed.

## Brand inputs
Originals in `inputs/` (gitignored). Processed AVIF/WebP/JPEG triplets
in `src/assets/{brand,products,lifestyle}/`. Never commit raw WhatsApp
exports — they violate the §14 image budget.
