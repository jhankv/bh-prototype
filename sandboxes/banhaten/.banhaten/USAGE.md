# Banhaten implementation rules

This project uses the Banhaten design system. Treat the installed component API and registry metadata as the source of truth; do not redraw controls from memory or infer defaults from the first documented variant.

## Before changing UI

1. Run `npx banhaten search <need>` to find the intended component.
2. Run `npx banhaten docs <component>` to inspect explicit defaults, recommended uses, avoid rules, and recipes.
3. Run `npx banhaten view <component>` before wrapping or extending its internals.
4. Prefer the documented golden recipe when the screen resembles a collection filter bar or results toolbar.

## Composition rules

- Use one semantic `density` across controls in the same row: `compact` is 32px, `default` is 36px, and `comfortable` is 40px.
- Do not align Banhaten controls with raw height, padding, radius, or font-size utilities. Width and responsive layout utilities are allowed.
- Use `DatePicker` or `DateRangePicker` for dates. Do not simulate calendar fields with `Input` or native date inputs.
- Pass explicit `leadingIcon` and `trailingIcon` nodes. Use `showAtSign` or `showInfo` only for those exact semantic affordances. The legacy `hasLeadingIcon` and `hasInformationIcon` flags are deprecated.
- Use `shortcutKeys={["Mod", "K"]}` on search inputs, `Shortcut` for one compact combined hint, or `KbdShortcut` when each physical key needs its own keycap. Never hard-code a single Command glyph for every platform.
- Use `SegmentedControl` for small mutually exclusive view, density, period, or numeric choices. Do not rebuild joined numeric buttons locally.
- Use functional `Select` for option menus. `ToolbarSelect` is only a trigger-shaped toolbar primitive.
- Preserve inherited `dir`; use logical spacing and alignment utilities for RTL-safe composition.

## Before finishing

Run `npx banhaten doctor` and inspect every diagnostic. Run `npx banhaten diff` before updating installed components, then execute the product's type, behavior, accessibility, and visual tests.

Canonical recipes live in `docs/design-system/form-recipes.md` in the Banhaten package.
