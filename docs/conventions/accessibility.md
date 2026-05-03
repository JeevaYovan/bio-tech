# Accessibility conventions

Target: **WCAG 2.2 AA**. Klaro's primitives are WAI-ARIA compliant —
the work is preserving that.

## Where bugs hide
1. **Custom wrappers around Klaro components** — drop `aria-*`,
   `role`, or `id` attrs that the underlying primitive depends on.
2. **Custom components in `src/app/lib/`** — full a11y work needed.
3. **Theme overrides** — the bio-tech green/brown palette is the
   highest-risk area for contrast failures. Audit every new color
   pair.
4. **Page composition** — heading order, landmarks, skip link.

## Page-level rules
- Exactly one `<h1>` per page.
- No skipped heading levels (h2 → h3, never h2 → h4).
- Landmarks present and unique:
  - One `<header>`, one `<main>`, one `<footer>`
  - `<nav>` with `aria-label` if more than one
- Skip-to-main link as the first focusable element.
- Page `<title>` describes the route, not the brand alone.

## Forms
- Every input has a visible `<label>` (via Klaro's `field` or `label`
  components, or `for`/`id`).
- Errors associated via `aria-describedby` and announced via
  `aria-live="polite"`.
- Required state via `aria-required="true"` (Klaro handles this when
  the form control is required).
- Invalid state via `aria-invalid="true"` while a field has errors.

## Color
- Body text ≥ 4.5:1 against background.
- Large text (≥ 18.66px regular or ≥ 14px bold) ≥ 3:1.
- UI components and graphical elements ≥ 3:1 against adjacent colors.
- Focus indicator visible against all backgrounds (do not override
  Klaro's focus ring without testing).

## Motion
- Respect `prefers-reduced-motion: reduce`. Klaro's animations already
  do; any custom animation must too.
- Avoid parallax, auto-playing video, infinite carousels.

## Keyboard
- Every interactive element reachable via Tab.
- Focus order matches visual order.
- `Esc` closes any open overlay (Klaro handles this).
- Arrow keys navigate list-like widgets (radio, tabs, menu) — Klaro
  handles this.

## Manual checklist (before declaring a page done)
1. Tab through the entire page. Note focus order, missing focus
   indicators, focus traps.
2. Run with screen reader (NVDA on Windows, VoiceOver on macOS) on at
   least one path.
3. Toggle "Reduce motion" in OS settings; verify animations soften
   or stop.
4. Run `/a11y-check <route>` for axe-core automated scan.
5. Spot-check contrast on every theme-overridden color via a tool
   like the Chrome devtools color picker.
