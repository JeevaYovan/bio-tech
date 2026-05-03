# bio-tech docs

Project documentation index. CLAUDE.md (in repo root) loads on every
session; the docs below load on demand via `@docs/...` references.

## Structure
- `decisions/` — ADRs (one file per architectural choice)
- `conventions/` — engineering conventions
  - `klaro-usage.md` — Klaro component inventory + when to use which
  - `performance.md` — performance budget and Angular-specific rules
  - `accessibility.md` — WCAG 2.2 AA rules and manual test checklist
  - `seo.md` — meta, JSON-LD, sitemap, prerender expectations
- `design/` — design intent
  - `theme-overrides.md` — every Klaro token override, with rationale
  - `pages.md` — page inventory
  - `inspiration.md` — references AND anti-references

## Reading order for new contributors
1. `CLAUDE.md` (repo root)
2. `docs/conventions/klaro-usage.md`
3. The latest ADR in `docs/decisions/`
4. `docs/design/theme-overrides.md` to see what's been customized
