---
name: theme-override
description: Override a Klaro theme token (color, spacing, radius, etc.). Routes through @klaro-curator and records the override in docs/design/theme-overrides.md.
argument-hint: "<token-name> <new-value>"
---

1. Read the current value in
   `c:\Users\Jeevan_Yovan E\AI\klaro-design-ui\libs\theme\styles\` to
   confirm the token name exists. The token system is layered:
   `primitives.css` (raw scales) -> `semantics.css` (role tokens like
   --primary, --background) -> `presets/<name>.css` (slate/zinc/neutral/
   stone/blue/emerald/orange/rose/violet). Klaro uses **oklch**, not HSL.
   If the token doesn't exist, list near matches and stop.
2. Engage @klaro-curator: does this override cohere with existing ones,
   or does it fragment the system?
3. If approved, update `src/styles/theme.css` (or wherever the override
   layer lives) AND append to `docs/design/theme-overrides.md` with:
   token, original value, new value, rationale, ADR link.
4. Run a contrast check on dependent surfaces if it's a color token.
   For the bio-tech palette specifically: verify --foreground on
   --background, --primary-foreground on --primary, and
   --muted-foreground on --muted all meet 4.5:1 (3:1 for large text).

Stop if @klaro-curator flags inconsistency.
