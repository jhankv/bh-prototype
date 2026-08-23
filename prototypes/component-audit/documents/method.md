# Method: for us, not for the report

Everything here is about how we work. None of it goes to the design system team.
A document that mixes findings about Banhaten with cautions about our own tooling
makes the reader sort them, and some will sort wrong.

## Two passes, and they do not carry the same confidence

**Pass 1, the eye.** Someone drives the frames and reports what they see. Claude
adds DOM measurement, not source reading. "The search looks big" becomes "220px
inside a 320 container, no max-width". The eye finds it; the measurement makes it
undeniable.

**Pass 2, the code.** Missing props, props that quietly do nothing, combinations
that break. Things nobody can see from outside. This runs last.

They stay separate because what is on screen is incontestable, while a code
reading is a claim about what should happen. One of ours already went wrong. A
grep from the wrong directory produced the claim that Banhaten had no bidi
isolation anywhere. The real count was 39 occurrences.

## Before recording anything, check it is not ours

Three near-misses so far, each caught before it reached a report.

**The `Select` that would not open.** Radix opens on `pointerdown`, and the
automation's synthetic click does not emit it. Keyboard opened it fine.

**Two rows that would not both check.** Two clicks in one tick against a
controlled component. With a frame between them, both stuck.

**A toolbar that looked broken.** We had used `Toolbar` for a text formatting
bar. It is a list toolbar, imported by exactly one file in the whole package,
`expanded/Table.tsx`.

A convincing false finding is the worst thing this playground can produce.

## `tsc` cannot catch prop misuse in a prototype

`useDS()` returns components typed as `ComponentType<Record<string, unknown>>`,
so prop types are erased. We wrote `ToolbarButton variant="brand"` and nothing
complained. `brand` is not one of its variants, and the prop did nothing.

No claim about a prop may come from a prototype compiling. Only from reading the
component.

## Coverage

Every component in the package now has a frame except one.

| State | Components |
| --- | --- |
| On a frame | `avatar` `badge` `Breadcrumbs` `button` `button-group` `checkbox` `EmptyState` `input` `kbd` `menu` `pagination` `PageHeader` `progress` `segmented-control` `select` `select-content` `spinner` `Table` `tabs` `tag` `toggle` `toolbar` `tooltip` |
| Deliberately not visual | `table-elements` |

`table-elements` exports structural wrappers with almost no styling. `TableCell`
and `TableBody` add no classes at all, so a screen built on them would be showing
our CSS, and any defect found would be ours. It belongs to pass 2.

Three screens closed that gap. Xero's bills list carries `PageHeader`,
`Breadcrumbs`, `tabs` and `tag`. Remote's expenses list carries `pagination`
through `DataTable`. Relume's shortcuts dialog carries `kbd` used directly, which
is the one path `kbd-2` narrowed the defect down to.

All three reproduced their findings on first run, and Xero's version of
`page-header-1` is worse than the reading it replaces: two labels print on top of
each other rather than losing a letter.

## Banhaten 0.4.0 exists

The sandboxes are on 0.3.0. The 0.4.0 `USAGE.md` adds a `Shortcut` component and
states that "`ToolbarSelect` is only a trigger-shaped toolbar primitive". Some
findings may already be resolved upstream. Nothing has been checked against it,
and every entry in the reports is about 0.3.0.
