# Page inventory

Filled as routes are added. Each row is a prerendered route.

| Route | Purpose | Klaro components likely used | Status |
|---|---|---|---|
| `/` | Home — brand hero, what-we-do, featured products, story teaser, contact CTA | card, button, badge, separator | Not yet built |
| `/products` | Product catalog grid with filters (category, size) | card, badge, button-group, pagination, field, select | Not yet built |
| `/products/[slug]` | Single product page — gallery, specs, pricing, related | card, carousel (gallery), badge, button, accordion (specs), table (specs) | Not yet built |
| `/about` | Brand story — origin, materials, process, people | card, separator | Not yet built |
| `/contact` | Contact form + addresses + map | input, textarea, button, label, alert | Not yet built |

## Decisions to make before scaffolding
- Single-locale (English) only, or English + Tamil?
- Pricing display: per-unit only, or include bulk pricing tables?
- Cart/checkout vs. inquiry-only? (Affects whether commerce logic ever
  enters the static site or remains a separate concern.)
