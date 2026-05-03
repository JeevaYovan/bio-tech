---
name: perf-check
description: Build for production and report bundle sizes per route + a Lighthouse summary. Run before merging anything that adds JS or CSS.
---

1. Run `npx nx run bio-tech:build`.
2. Print bundle sizes per route (initial + lazy chunks). Use the build
   output's stats.json or the printed budget breakdown.
3. Compare against the budget in CLAUDE.md:
   - Total JS on home: < 60KB compressed
   - Total CSS any page: < 25KB compressed
   - LCP < 1.8s, FCP < 1.0s, CLS < 0.05
   Flag any breach with the specific route and KB delta.
4. Run `npx nx run bio-tech:serve-static` in the background, then
   `npx lighthouse <url> --only-categories=performance,accessibility,best-practices,seo --output=json --quiet --chrome-flags="--headless"`.
5. Report: pass / breach (per category) / can't measure.

If bundle stats show a `@klaro/ui` barrel import, fail loudly and point
at the offending file — only secondary entry points
(`@klaro/ui/<name>`) are allowed.
