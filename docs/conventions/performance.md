# Performance conventions

## Hard budget (from CLAUDE.md)
- **FCP** < 1.0s on Fast 3G
- **LCP** < 1.8s
- **CLS** < 0.05
- **JS on home** < 60KB compressed (Angular framework ~30KB; app ~30KB)
- **CSS on any page** < 25KB compressed
- **Lighthouse** ≥ 95 across Performance / Accessibility / Best
  Practices / SEO

A build that breaches budget does not merge. `/perf-check` enforces.

## Angular-specific rules

### Imports
- Klaro: secondary entry points only — `@klaro/ui/<name>`. Never the
  barrel. A barrel import drags in the entire library.
- Lodash, date-fns, etc.: import per-function, not the package root.

### Rendering
- Output mode: `static` in `angular.json`. No SSR runtime; everything
  is prerendered at build time.
- Hydration cost: minimize. If a section has no event handlers, it
  should not be a hydrated component — render plain HTML.
- `@defer` for below-the-fold interactive primitives (dialog, dropdown,
  calendar, data-grid). Triggers: `on viewport`, `on idle`,
  `on interaction`.
- Route-level code-splitting via `loadComponent` on every non-home
  route.

### Images
- `NgOptimizedImage` directive on every `<img>`.
- Explicit `width` and `height` on every image (prevents CLS).
- Modern formats: AVIF first, WebP fallback, JPEG/PNG only as last
  resort. The bio-tech product photos must be re-encoded — raw WhatsApp
  exports are ~150-260 KB each, way over budget.
- `priority` only on the LCP image. Everything else lazy.
- Sized for actual rendered dimensions (not 4000×3000 served at
  600×400).

### CSS
- Tailwind v4 + Klaro tokens only. No global CSS files outside
  `src/styles/`.
- One theme override file (`src/styles/theme.css`). Every override
  documented in `docs/design/theme-overrides.md`.
- No CSS-in-JS, no styled-components.

### Fonts
- Self-host. `font-display: swap`. Subset to the glyphs you need. No
  more than two families.
- For an editorial portfolio, one display + one text family is plenty.

### Third-party JS
- None on first paint. Analytics, chat widgets, etc. load on idle.
- `@performance-engineer` reviews any new dependency.

## Verification
`/perf-check` runs the production build, prints per-route bundle sizes
against the budget, then runs Lighthouse against the prerendered output.
Run it before any merge that touches code.
