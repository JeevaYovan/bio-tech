# Klaro UI usage

The `@klaro/ui` library exposes ~56 secondary entry points, each
tree-shakeable. Always import from the secondary path
(`@klaro/ui/<name>`), never the barrel (`@klaro/ui`).

For variant details (CVA), inputs, and selectors, run `/klaro-find
<need>` — that skill reads the actual library to ground recommendations.
The list below is the authoritative inventory of import paths plus
when-to-use / when-not-to-use guidance. Do not invent variants from
this doc; verify via `/klaro-find` before use.

## Form

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/button` | Any clickable action | Navigation links — use plain `<a>` |
| `@klaro/ui/button-group` | Two or more related buttons grouped (e.g., view toggles) | Single buttons |
| `@klaro/ui/input` | Single-line text/email/number/password | Multiline content (textarea), search-with-icon (input-group) |
| `@klaro/ui/input-group` | Input with leading/trailing icon or addon | Plain inputs |
| `@klaro/ui/input-otp` | One-time code entry, 4-8 digit slots | Generic numeric input |
| `@klaro/ui/textarea` | Multi-line text | Single-line — use input |
| `@klaro/ui/checkbox` | Boolean-per-item, multi-select toggles | Single on/off — switch is better |
| `@klaro/ui/radio` | Single choice from a small group | More than ~6 options — use select |
| `@klaro/ui/select` | Single choice from a list, custom-styled | Many options with search — use combobox |
| `@klaro/ui/native-select` | Single choice with native picker (mobile-friendly) | When you need custom item rendering |
| `@klaro/ui/combobox` | Searchable single-select | Small lists — select is simpler |
| `@klaro/ui/switch` | Single on/off toggle | Multi-state choices |
| `@klaro/ui/toggle` | Pressable button with on/off state | A switch (use switch for binary settings) |
| `@klaro/ui/slider` | Numeric value within a range | Discrete options |
| `@klaro/ui/label` | Form-field label associated with control | Section headings — use `<h*>` |
| `@klaro/ui/field` | Wraps label + input + description + error | Standalone inputs without metadata |

## Layout

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/card` | Bounded content surface (product card, summary block) | Page-level structure — use semantic HTML |
| `@klaro/ui/tabs` | Switching between peer views of the same data | Navigation between routes |
| `@klaro/ui/accordion` | Collapsible sections (FAQ, product details) | Always-visible content |
| `@klaro/ui/collapsible` | Single show/hide region | Multiple peer collapsibles — use accordion |
| `@klaro/ui/breadcrumb` | Hierarchical location indicator | Linear progress (use progress-steps) |
| `@klaro/ui/pagination` | Paged navigation through a list | Infinite scroll |
| `@klaro/ui/separator` | Visual divider between sections | Decorative spacing — use margin |
| `@klaro/ui/scroll-area` | Custom-styled scrollable region | Full-page scroll |
| `@klaro/ui/sidebar` | App-shell side navigation | Static marketing page nav — use plain `<nav>` |
| `@klaro/ui/item` | Generic list item (with icon, content, actions) | Highly custom layouts |

## Overlay

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/dialog` | Modal blocking interaction (confirm, form) | Non-blocking info — use popover or toast |
| `@klaro/ui/drawer` | Mobile bottom-sheet style modal | Desktop-first overlays — use dialog |
| `@klaro/ui/sheet` | Slide-out side panel | Modal dialog — use dialog |
| `@klaro/ui/popover` | Anchored floating content (filters, mini-form) | Quick hint — use tooltip |
| `@klaro/ui/tooltip` | Brief hover/focus hint (≤80 chars) | Interactive content — use popover |
| `@klaro/ui/hover-card` | Rich hover preview (user card, link preview) | Tooltips |
| `@klaro/ui/dropdown` | Action menu anchored to a trigger | Item selection — use select |
| `@klaro/ui/context-menu` | Right-click action menu | Always-visible actions |
| `@klaro/ui/menubar` | App-style top menu (File, Edit, View) | Web nav |
| `@klaro/ui/navigation-menu` | Mega-menu / nested nav with descriptions | Simple link list |
| `@klaro/ui/command` | Cmd+K command palette | Plain search |

## Data display

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/table` | Simple tabular data, no interaction | Sortable/filterable/editable — use data-grid |
| `@klaro/ui/data-grid` | Full-featured data grid (97+ features per docs) | Marketing pages, simple lists |
| `@klaro/ui/avatar` | User/brand round image with initials fallback | Product images — use plain `<img>` w/ NgOptimizedImage |
| `@klaro/ui/badge` | Inline status / count / category label | Buttons (use button with variant) |
| `@klaro/ui/calendar` | Date browsing without commit | Date input — use date-picker |
| `@klaro/ui/date-picker` | Date input with calendar | Continuous timestamps |
| `@klaro/ui/carousel` | Horizontally-scrolling content (gallery, testimonials) | Primary content (one paragraph at a time hides info) |

## Feedback

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/toast` | Transient notification | Critical errors that must be acknowledged — use dialog |
| `@klaro/ui/alert` | Static callout in page flow (info, warning, error) | Transient — use toast |
| `@klaro/ui/progress` | Determinate progress bar | Indeterminate — use spinner |
| `@klaro/ui/progress-steps` | Multi-step process indicator | Generic progress |
| `@klaro/ui/spinner` | Indeterminate loading | Skeleton-friendly content blocks (use skeleton) |
| `@klaro/ui/skeleton` | Pulse loading placeholder for known layouts | Spinners, generic loading |
| `@klaro/ui/empty` | Empty-state illustration + message + action | Loading states |

## Utility

| Import | Use when | Do NOT use for |
|---|---|---|
| `@klaro/ui/ripple` | Material-style ripple directive | Already built into button via hostDirectives |
| `@klaro/ui/kbd` | Keyboard shortcut labels (`<kbd>Ctrl</kbd>+K`) | Plain text |
| `@klaro/ui/direction` | RTL/LTR direction provider | Single-language sites that don't need RTL |
| `@klaro/ui/testing` | Test harnesses for Klaro components in your specs | Production code |

## Theme

- `@klaro/theme` exports `ThemeService` (`toggleTheme`, light/dark/system).
- Style imports (CSS): pick a preset or compose your own. Available
  presets: `@klaro/theme/presets/{slate,zinc,neutral,stone,blue,emerald,
  orange,rose,violet}`. The bio-tech site starts from `emerald` and
  overrides toward a deeper, earthier leaf-green.
- Other style entry points: `primitives.css`, `semantics.css`,
  `alpha.css`, `palette.css`, `tailwind-theme.css`, `animations.css`,
  `base.css`, `overlay.css`.

## The rule
If your need is in the table above, use the Klaro entry. If you think
it isn't, run `/klaro-find <need>` first. If that confirms there's no
match, write an ADR (`/adr-new <component>`) explaining the gap and put
the custom component in `src/app/lib/`.
