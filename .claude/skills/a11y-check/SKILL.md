---
name: a11y-check
description: Run automated accessibility checks plus a manual sweep by @accessibility-auditor.
argument-hint: "<optional route>"
---

1. Build and serve via `npx nx run bio-tech:serve-static`.
2. Run `npx @axe-core/cli <url>` (or a Playwright-axe test if
   configured).
3. Group violations by severity (critical, serious, moderate, minor).
4. Engage @accessibility-auditor for keyboard flow + screen reader
   walkthrough on $ARGUMENTS (or the home page if blank).
5. Verify any custom component still meets WAI-ARIA — Klaro components
   already do; the risk is custom wrappers undoing it (e.g., spreading
   props but dropping `aria-*` or `role` from the underlying primitive).
6. Spot-check contrast on every theme override listed in
   `docs/design/theme-overrides.md` — the brand-derived green/brown
   palette is the highest-risk area for contrast failures.
7. Report: pass / fail with file:line and remediation.
