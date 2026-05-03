# Klaro theme overrides

Every override of a Klaro token is recorded here with rationale. If a
token isn't listed, we use Klaro's default. Cross-reference each entry
with an ADR.

Klaro's token system is layered:
1. `@klaro/theme/primitives` — raw oklch scales
2. `@klaro/theme/semantics` — role tokens (`--primary`, `--background`,
   `--foreground`, etc.)
3. `@klaro/theme/presets/<name>` — packaged role assignments (slate,
   zinc, neutral, stone, blue, emerald, orange, rose, violet)

Bio-tech starts from the `emerald` preset (closest to the leaf-green
brand identity) and overrides toward a deeper, earthier palette.

## Active overrides

| Token | Klaro default (emerald) | Override | Rationale | ADR |
|---|---|---|---|---|
| _none yet — populated as overrides land_ | | | | |

## Planned overrides (drafts, not yet applied)

These are the brand-derived directions; values will be set after a
contrast pass and confirmed via `@klaro-curator`.

- `--primary` — deep leaf green (logo-derived). Target ≥ 4.5:1 against
  `--primary-foreground`.
- `--accent` — warm amber/honey (highlights, hover states on muted
  surfaces).
- `--background` — warm off-white (#fbf8f1-ish in oklch terms), not
  pure white. Pairs with the natural-fiber product photography.
- `--muted` — warm beige.
- `--foreground` — near-black with a slight warm tint, never pure
  `#000`.
- `--radius` — TBD; the brand reads more honest with smaller radii
  (≤ 0.375rem) than the Klaro default of 0.625rem.
- Display font — TBD; an editorial serif is being considered for hero
  type, with a humanist sans for body.

## Process for adding an override
1. Run `/theme-override <token> <new-value>`.
2. The skill engages `@klaro-curator` and runs contrast checks.
3. If approved, the override is written to `src/styles/theme.css` AND
   appended to the table above with rationale and ADR link.
