# bio-tech — Project Memory

## What this is
A lightweight, design-led static product-showcase site for an
eco-friendly biodegradable tableware brand (plates, bowls, cups, spoons,
straws made from natural plant fibers). Built with Angular 21 and the
existing `@klaro/ui` design system. Optimized for fast load, strong
visual identity, accessibility, and SEO. Built solo with Claude Code
as primary engineering partner.

## Stack (locked, do not deviate without an ADR)
- **Framework:** Angular 21 (standalone components, signals, control flow).
- **Workspace:** Nx 22 (matches the Klaro library's workspace style).
- **Rendering:** Static prerender via Angular's built-in SSG
  (`outputMode: 'static'` in `angular.json`). No server runtime.
- **Styling:** Tailwind CSS v4 + `@klaro/theme` oklch custom properties.
  No mixed approaches.
- **Components:** `@klaro/ui` (56 entry points discovered — see
  `@docs/conventions/klaro-usage.md` for the inventory).
- **Utilities:** `@klaro/utils` (cn, cva, keyboard, dom helpers).
- **Theming:** `@klaro/theme` with brand-derived overrides on top of a
  green/earth preset (likely `emerald` or custom).
- **Testing:** Vitest (unit) + Playwright (E2E) — same as the library.
- **Linting:** ESLint + Prettier with the Klaro library's configs as
  the baseline.
- **Content:** Hand-written MDX/markdown (no headless CMS).
- **Deployment:** Vercel (static output).
- **Package manager:** npm (matches Klaro library; switch only with ADR).

## Klaro UI — the rule
The design system ALREADY EXISTS. Default behavior:
1. Need a button? `@klaro/ui/button`. Need a card? `@klaro/ui/card`.
2. Before writing ANY new component, search Klaro first via
   `/klaro-find <need>`. If a component covers 80%+ of the need, use it
   — even if a prop is missing, raise it in the library, don't fork.
3. If Klaro genuinely doesn't cover the case (rare), write an ADR
   explaining why, and put the custom component in `src/app/lib/` (NOT
   inline in pages).
4. Never re-implement Klaro tokens (color, spacing, type) in this repo.
   Override via CSS custom properties on `:root`, document the override
   in `@docs/design/theme-overrides.md`.
5. Tree-shakeable imports ONLY: `import { ButtonComponent } from
   '@klaro/ui/button'`. Never the barrel `@klaro/ui`.

Note: Klaro uses **oklch** color tokens (not HSL). Theme presets ship
under `@klaro/theme/presets/{slate,zinc,neutral,stone,blue,emerald,
orange,rose,violet}`.

## Design intent
Editorial, brand-led. The brand is grounded in nature: leaf-green logo
(mortar-and-pestle motif), earthy plant-fiber product photography, INR
pricing. The site should feel honest, tactile, and quietly confident —
not corporate-glossy and not generic-startup. Strong typography, ample
whitespace, real product photography (not stock), warm earthy palette
(deep leaf green primary, warm browns/creams as supporting tones).

The default trap is generic AI design: gradient hero, rounded-2xl
everywhere, "shadcn-default" cards, system-font display type. Klaro
already escaped these defaults — don't re-introduce them via custom CSS.

## Working agreement (non-negotiable)
1. NEVER invent APIs. Before importing `@klaro/ui/X`, verify X exists by
   reading the library at
   `c:\Users\Jeevan_Yovan E\AI\klaro-design-ui\libs/ui/`. If unsure, say
   so and check.
2. NEVER duplicate Klaro components in this repo. Use the library
   imports.
3. NEVER use deprecated Angular patterns: no NgModules-only code, no
   constructor injection where `inject()` works, no `*ngIf` / `*ngFor`
   when `@if` / `@for` are available.
4. ALWAYS respect the performance budget (see
   `@docs/conventions/performance.md`).
5. ALWAYS keep static-where-possible. Only hydrate routes that need
   interactivity. Use `@defer` blocks for below-the-fold interactive
   bits.
6. ALWAYS run typecheck + lint + build before declaring work done.
7. WHEN unsure about project state, read the file. No guessing.
8. NO emojis in code, commits, PRs, or docs unless I explicitly ask.
9. NO "Generated with Claude" / Anthropic attribution.
10. ASK before destructive ops: rm, force-push, replacing the styling
    approach, ejecting from Nx.

## Performance budget (hard limits)
- **First Contentful Paint:** < 1.0s on Fast 3G
- **Largest Contentful Paint:** < 1.8s
- **Total JS shipped on home page:** < 60KB compressed (Angular
  framework cost is ~30KB; this leaves 30KB for app code)
- **Total CSS shipped on any page:** < 25KB compressed
- **Lighthouse:** 95+ on Performance / Accessibility / Best Practices /
  SEO
- **CLS:** < 0.05

If a change risks any of these, flag BEFORE making it.

## Accessibility floor
- WCAG 2.2 AA. Klaro ships WAI-ARIA-compliant primitives — don't
  undo that with custom wrappers.
- Keyboard-first. `prefers-reduced-motion` respected (use Klaro's
  motion tokens, not arbitrary durations).
- Color contrast 4.5:1 body, 3:1 large text — verified after any theme
  override (the brand-derived green/brown palette MUST be contrast-
  audited).

## Build & verification
- `npm install`
- `npx nx run bio-tech:lint`
- `npx nx run bio-tech:test`
- `npx nx run bio-tech:build` (static output to `dist/`)
- `npx nx run bio-tech:serve-static` to preview the prerendered build

(Targets to be filled in with actual values after Angular scaffold lands
in next session.)

## Documentation map (load on demand with @)
- `@docs/decisions/`                ADRs
- `@docs/conventions/klaro-usage.md` Klaro component inventory + when to use which
- `@docs/conventions/performance.md`
- `@docs/conventions/accessibility.md`
- `@docs/conventions/seo.md`
- `@docs/design/theme-overrides.md`  every Klaro token override, with rationale
- `@docs/design/pages.md`            page inventory
- `@docs/design/inspiration.md`      references and anti-references

## Workflow
- Plan mode (Shift+Tab) before any change > 50 lines or touching
  `src/app/lib/` (custom components) or theme overrides.
- Every Klaro override or custom component becomes an ADR via
  `/adr-new`.
- Use the `klaro-curator` subagent before merging any visual change.
- Use the `performance-engineer` subagent when adding any dependency.

## Brand inputs
Logo and product photography live under `inputs/` (gitignored or moved
to `src/assets/brand/` once scaffolded). Do not commit raw WhatsApp
exports — process them into web-optimized AVIF/WebP first.
