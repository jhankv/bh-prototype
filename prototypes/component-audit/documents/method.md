# Method — for us, not for the report

Everything here is about how we work. None of it goes to the design system team,
which is why it is not in the four reports: a document that mixes findings about
Banhaten with cautions about our own tooling makes the reader sort them, and some
of them will sort wrong.

## Two passes, and they do not carry the same confidence

**Pass 1 — the eye.** Someone drives the frames and reports what they see. Claude
adds **DOM measurement**, not source reading. "The search looks big" becomes
"220px inside a 320 container, no max-width". The eye finds; the measurement
makes it undeniable.

**Pass 2 — the code.** Missing props, props that silently do nothing,
combinations that break. Things nobody can see from outside. This runs last.

They stay separate because what is on screen is incontestable, while a code
reading is a claim about what *should* happen — and one already went wrong here.
A grep from the wrong directory produced the claim that Banhaten had no bidi
isolation anywhere. The real count was 39 occurrences.

## Before recording anything, check it is not ours

Three near-misses so far, each one caught before it reached a report:

- **The `Select` that would not open.** Radix opens on `pointerdown`; the
  automation's synthetic click does not emit it. Keyboard opened it fine.
- **Two rows that would not both check.** Two clicks in one tick against a
  controlled component. With a frame between them, both stuck.
- **A toolbar that looked broken.** We had used `Toolbar` for a text formatting
  bar. It is a list toolbar — imported by exactly one file in the whole package,
  `expanded/Table.tsx`.

A convincing false finding is the worst thing this playground can produce.

## `tsc` cannot catch prop misuse in a prototype

`useDS()` returns components typed as `ComponentType<Record<string, unknown>>`,
so prop types are erased. `ToolbarButton variant="brand"` was written here and
did nothing — `brand` is not one of its variants — and nothing complained.

**No claim about a prop may come from a prototype compiling. Only from reading
the component.**

## Coverage

| State | Components |
| --- | --- |
| On a frame | `avatar` `badge` `button` `button-group` `checkbox` `EmptyState` `input` `menu` `progress` `segmented-control` `select` `select-content` `spinner` `Table` `toggle` `toolbar` `tooltip` |
| Findings written, **frame lost** | `PageHeader` `Breadcrumbs` `pagination` |
| Never had a screen | `tag` `tabs` `kbd` (direct usage) |
| Deliberately not visual | `table-elements` |

`table-elements` exports structural wrappers with almost no styling — `TableCell`
and `TableBody` add no classes at all. A screen built on them would be showing
our CSS, so any defect found would be ours. It belongs to pass 2.

**The next prototype should restore `PageHeader`, `Breadcrumbs` and `pagination`
in one screen.** Four findings are written that nobody can currently reproduce,
which is the worst state for an entry to be in.

## Banhaten 0.4.0 exists

The sandboxes are on 0.3.0. The 0.4.0 `USAGE.md` adds a `Shortcut` component and
states that "`ToolbarSelect` is only a trigger-shaped toolbar primitive". Some
findings may already be resolved upstream. Nothing has been checked against it
yet, and every entry in the reports is about 0.3.0.
