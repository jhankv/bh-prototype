# Findings — Sales Console

What a **composition** surfaced that the isolated galleries did not.

Severity is `major`, `minor`, `mixed`, or `question`. Every finding ends as a
note here or a diff in `sandboxes/banhaten-proposed`. All entries below were
observed in the running app and measured in the DOM — not read out of source.

---

### F-101 · DataTable prints a fabricated row count

**Component:** `expanded/Table.tsx` → `pagination.tsx`
**Severity:** major **Modes:** any
**Repro:** frames `console` vs `console-rtl-proposed`, table footer
**Status:** FIXED in `sandboxes/banhaten-proposed`

With `pagination={{ pageSize: 8, totalRows: 12, showCaption: true }}` the footer
renders **two summaries that disagree**:

| Slot | Renders |
| --- | --- |
| `toolbar-text` | `Showing 1 to 8 of 12 rows` ← correct |
| `pagination-caption` | `Showing 1 to 10 of 20 results` ← invented |

**Root cause.** `Pagination` has two text slots, `caption` and `summary`.
`DataTable` passes `summary` and never `caption`, so `caption ?? messages.caption`
falls through to the default in `pagination.tsx`:

```ts
caption: "Showing 1 to 10 of 20 results",
```

**Why it matters**
This default is not an empty state or a visible placeholder — it is a
well-formed sentence containing two plausible numbers. A table whose job is to
tell you how much data exists reports a quantity that was never measured, and it
looks correct enough to ship. `arabicPaginationMessages` carries the same
hardcoded string.

**Fix applied:** pass the computed summary into `caption` as well.

```diff
  showCaption={paginationConfig.showCaption ?? false}
+ caption={labels.resultsSummary({ from: visibleFrom, to: visibleTo, total: totalRows })}
  summary={labels.resultsSummary({ from: visibleFrom, to: visibleTo, total: totalRows })}
```

Verified after the fix: both slots read `Showing 1 to 8 of 12 rows`.

**Worth discussing upstream:** whether a default message should ever be a
sentence with numbers in it. An empty string fails visibly; this fails silently.

---

### F-102 · PageHeader clips its own tab labels, with no way to opt out

**Component:** `expanded/PageHeader.tsx`, `tabs.tsx`, `tabs.css`
**Severity:** major **Modes:** any, both directions
**Repro:** frames `console` and `console-rtl`, first tab
**Status:** OPEN — needs a design decision, not a one-line patch

`All statuses` renders as `ll statuses` in LTR and `All statuse` in RTL. The
first or last glyph is cut depending on direction.

**Measured.** Every tab is exactly `65.4px` wide regardless of its label:

| Label | Box | Text needs | Result |
| --- | --- | --- | --- |
| All statuses | 65.39 | 87.08 | clipped 21.7px |
| Refunded | 65.41 | 68.58 | clipped 3.2px |
| Pending | 65.41 | 62.00 | fits |
| Fulfilled | 65.39 | 59.23 | fits |

**Root cause — three rules combining.**

1. `PageHeader.tsx:153` hardcodes `fullWidth` on `<Tabs>`.
2. `.ds-tabs__tab { flex: 1 0 0px }` — every tab takes an equal share of a zero
   basis, so width is `list ÷ count`, never content.
3. `.ds-tabs__label { flex: 0 0 auto; white-space: nowrap }` refuses to shrink,
   and the list's `overflow: auto` clips whatever spills.

**Why it matters**
`Refunded` loses three pixels. That is small enough to pass review and large
enough to be wrong, which is the worst size for a defect. And the failure scales
with tab count: five tabs in a 391px header already breaks, and nothing warns.

**No escape hatch.** `PageHeaderTabs` is
`Pick<TabsProps, "activeIndex" | "ariaLabel" | "defaultActiveIndex" | "items" | "onActiveIndexChange">`
— `fullWidth` is not in the list, so a consumer cannot turn it off.

**Also:** `Tabs` sets `ds-tabs--hug` when `fullWidth` is false, but **no CSS rule
for that class exists anywhere in the package**. The hug mode is a dead class.

**Suggested direction (not applied — this is a design call)**
Either let the label shrink and truncate honestly, or let the list scroll
instead of clip, or expose `fullWidth` through `PageHeaderTabs`. Clipping the
first letter is the one outcome nobody chose.

---

### F-103 · PageHeader title and description reorder punctuation in RTL

**Component:** `expanded/PageHeader.tsx`
**Severity:** major **Modes:** any `dir="rtl"`
**Repro:** frames `console-rtl` vs `console-rtl-proposed`, header description
**Status:** FIXED in `sandboxes/banhaten-proposed`

The description renders with its final period at the **front**:

```
.Every completed transaction across Retail, Online and Wholesale…
```

**Measured:** the `<p>` carries no `dir` attribute, so it inherits `rtl` from the
document while its content is Latin. A trailing `.` is bidi-neutral and gets
reordered to the paragraph direction.

**Fix applied:** `dir="auto"` on both the title and the description.

**Why this entry matters beyond itself.** This is the third instance of one root
cause — after `Table` (F-003) and `Breadcrumbs` (F-005). The pattern is now
established: **Banhaten's core components set `dir="auto"` on text they render
(39 occurrences); the `expanded/` components did not (2 occurrences).** The four
files under `expanded/` are also the only four of twenty-four with no
`data-slot` attributes.

`expanded/` is a second-class citizen of this design system, and that is the
finding worth sending upstream — not three separate patches.

---

### F-104 · Kbd's RTL defect is narrower than F-001 claimed

**Component:** `kbd.tsx` **Severity:** — **Status:** NARROWING, not a defect

The composition renders `⌘K` through `Input kind="shortcut"`, which uses
`KbdShortcut`. Measured in RTL: `⌘` at x=1036.7, `K` at x=1064.7 — correct
order, because pristine `kbd.tsx` already sets `dir="ltr"` on the `KbdShortcut`
wrapper.

F-001 therefore only affects **direct `<Kbd>⌘K</Kbd>` usage**, where the glyphs
are children of the `<kbd>` element itself. Anyone reaching for `KbdShortcut` or
`Input kind="shortcut"` is already safe.

This narrows the upstream report rather than widening it, and it is the kind of
correction only a composition produces — the gallery exercised `Kbd` directly and
never showed that the recommended path was already fine.

---

## Open questions

Observed while building. Each is a conversation, not a patch.

### Q-001 · Two badge colour vocabularies

`Badge` accepts `color`: `neutral · blue · green · amber · danger · purple ·
fuchsia · rose · sky · golden`. A badge cell inside `Table` accepts `tone`:
`blue · fuchsia · amber · neutral · success · warning · danger`.

`green` and `golden` are missing from the second; `success` and `warning` from
the first. `expanded/Table.tsx` bridges them with a private `badgeColor()`
mapping `success → green`, `warning → amber`.

It renders correctly. The cost is that whoever learns one vocabulary guesses
wrong in the other, and neither type says so.

### Q-002 · `Input` silently ignores `shortcutKeys` unless `kind="shortcut"`

`shortcutKeys` lives on `InputModeRenderProps`, which is intersected into
**every** kind variant. So `<Input shortcutKeys={['Mod','K']} />` typechecks,
passes lint, and renders nothing. Cost me one debugging cycle.

Making the shortcut props exclusive to `kind: "shortcut"` would turn a silent
no-op into a compile error.

### Q-003 · The table draws its own progress bar

`expanded/Table.tsx` defines a local `Progress` component rather than using
`components/ui/progress.tsx`. Two implementations of one idea drift apart. Not
yet compared visually.

### Q-004 · Five order statuses, four badge tones

`partially refunded` has no tone of its own and falls back to `neutral` — the
same tone as `refunded`. Two different states render identically. Only a gap if
the tone set is meant to be exhaustive; worth asking.

---

## Investigated and rejected

Nothing yet for this project. Entries land here when a hypothesis is disproven,
because knowing what *is not* broken is what keeps this report credible.
