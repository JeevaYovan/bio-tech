---
name: klaro-find
description: Find which @klaro/ui component covers a need before writing custom code. Searches the library at c:\Users\Jeevan_Yovan E\AI\klaro-design-ui.
argument-hint: "<what you're trying to build>"
---

A user needs: "$ARGUMENTS"

1. Glob the inventory at
   `c:\Users\Jeevan_Yovan E\AI\klaro-design-ui\libs\ui\*\index.ts` and
   list the entry-point names. There are ~56 entry points (the README
   says 31 but the library has grown — trust the actual file system).
2. Match the need against the available components. Categories:
   - Form: button, button-group, input, input-group, input-otp,
     checkbox, radio, select, native-select, switch, textarea, label,
     toggle, slider, field
   - Layout: card, tabs, accordion, breadcrumb, pagination, separator,
     scroll-area, sidebar, item
   - Overlay: dialog, drawer, sheet, popover, tooltip, dropdown,
     hover-card, context-menu, menubar, navigation-menu, command,
     combobox
   - Data: table, data-grid, avatar, badge, calendar, date-picker,
     carousel
   - Feedback: toast, alert, progress, progress-steps, skeleton,
     spinner, empty
   - Utility: ripple, kbd, collapsible, direction, testing
3. For the best match, read the component file at
   `libs/ui/<name>/<name>.component.ts` and the variants file at
   `libs/ui/<name>/<name>.variants.ts` (if present), and report:
   - Import path: `@klaro/ui/<name>`
   - Selector(s) — both `klaro-X` element and any `[klaroX]` attribute
     form
   - Inputs (signal inputs with their types and defaults)
   - Variants (from the `*.variants.ts` file via CVA)
   - Composition pattern (single component vs compound — e.g., dialog
     trigger + content)
4. If nothing in Klaro covers it, say so explicitly and recommend
   `/adr-new <component>` to record why we're going custom.

Do NOT generate component code yet. This skill is reconnaissance.
