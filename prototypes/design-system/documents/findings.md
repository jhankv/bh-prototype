# Findings — Banhaten 0.3.0

One entry per defect. Severity is `major`, `minor`, `mixed`, or `question`.
Every finding ends as a note here or a diff in `sandboxes/banhaten-proposed`.

---

### F-001 · Kbd — modifier and key swap order in RTL

**Component:** `kbd` **Severity:** major **Modes:** any `dir="rtl"`
**Repro:** frames `audit-rtl` vs `audit-rtl-proposed`, case F
**Status:** FIXED in `sandboxes/banhaten-proposed`

**Narrowed by the audit:** only shortcuts built from bidi-neutral glyphs are
affected. `⌘K` renders as `K⌘` and `⇧⌘P` as `P⌘⇧`, while `Ctrl+S` is correct in
both directions because those are strong LTR characters. So the bug hides
wherever a team writes shortcuts in ASCII and only surfaces on Apple modifiers.

**Fix applied:** `dir="ltr"` on the `<kbd>` root.

| | Pristine | Proposed |
| --- | --- | --- |
| `⌘K` | `K⌘` | `⌘K` |
| `⇧⌘P` | `P⌘⇧` | `⇧⌘P` |
| `Ctrl+S` | `Ctrl+S` | `Ctrl+S` |

**What breaks**
`<Kbd>⌘K</Kbd>` renders as `⌘K` in LTR and as `K⌘` in RTL. `⌘` is a
bidi-neutral symbol, so the Unicode bidirectional algorithm reorders it to
follow the paragraph direction.

**Why it matters**
A keyboard shortcut is not prose. `⌘K` is `⌘K` on every keyboard in the world,
including an Arabic one — the physical key order does not mirror. An Arabic user
reading `K⌘` is being told to press the keys in the wrong order.

**Expected**
Shortcut contents keep LTR order regardless of document direction. The
surrounding layout still mirrors; only the glyph sequence inside the key stays
put.

**Proposed fix**
Set `dir="ltr"` on the `Kbd` root, or wrap its children in an LTR isolate
(`unicode-bidi: isolate; direction: ltr`).

---

### F-002 · Badge — an invalid `color` renders an unstyled badge instead of failing

**Component:** `badge` **Severity:** minor **Modes:** all
**Repro:** frame `probe-banhaten-light`, the "Invalid color" badge

**What breaks**
`BadgeColor` accepts `neutral · blue · green · amber · danger · purple ·
fuchsia · rose · sky · golden`. Passing anything else — `red` is the obvious
guess for a failure state — produces a badge with no background, no border, and
no padding. It renders as bare text that does not read as a badge at all.

**Why it matters**
`red` is the first thing anyone reaches for, and `danger` is not discoverable
from the rendered output. In TypeScript the mistake is caught; in a JS codebase,
or when the value arrives from data, it ships silently. A status column quietly
loses its most important state.

**Expected**
Fall back to `neutral` so the element still reads as a badge, and warn in
development naming the invalid value and the valid set.

**Proposed fix**
Give `badgeVariants` a `defaultVariants.color` of `neutral`, and add a
development-only guard in `Badge` when `color` is outside the union.

---

### Notes

- Verified good in RTL: button order, tag order, input alignment, text
  alignment, Arabic rendering with IBM Plex Sans Arabic.
- Verified good across modes: `light`, `dark`, `blue`, `brown`, and the `sharp`
  radius token.

---

### F-005 · Breadcrumbs — a crumb truncates from its start when its script opposes the document

**Component:** `expanded/Breadcrumbs`, and `expanded/PageHeader` through it
**Severity:** major **Modes:** every mode, both directions
**Repro:** frames `audit-rtl` vs `audit-rtl-proposed`, cases A and B
**Status:** FIXED in `sandboxes/banhaten-proposed`

**What breaks**

Same mechanism as F-003. `ds-breadcrumbs__label` carries no `dir`, so a crumb
inherits the document direction and truncates at its visual end — which is its
logical start when the script runs the other way.

| | Pristine | Proposed |
| --- | --- | --- |
| Standalone | `… de la Vega y Santibáñez` | `Maximiliano Alessandro …` |
| Inside PageHeader | `lez de la Vega y Santibáñez` | `Maximiliano Alessandro Fer…` |

Inside `PageHeader` it is worse: the label is clipped mid-word with no ellipsis
at all, so nothing signals that text is missing.

**Fix applied:** `dir="auto"` on the label span. `PageHeader` delegates its
breadcrumbs to this component, so one change covers both.

---

## The audit that produced F-005

F-001 and F-003 looked unrelated. They are the same defect, so the obvious next
step was to find every other instance. The result was not what was expected.

**The initial hypothesis was wrong.** A first pass suggested Banhaten had no
bidi isolation anywhere. That grep ran from the wrong directory and returned
nothing. The real count:

| | `dir="auto"` occurrences |
| --- | --- |
| Core components | **39** |
| `expanded/` | **2** (both in `EmptyState`) |

So this is not a missing concept. Banhaten applies the correct pattern
throughout its core, and the team clearly knows it. The gap is that the
`expanded/` family — `Table`, `Breadcrumbs`, `PageHeader` — was authored without
it, plus `kbd`, which needs the neutral-symbol variant of the same care.

That reframes the whole report. It is not "please learn about bidi". It is
"your own convention did not reach these four files."

**Verified correct** (controls in the audit view, all already carrying
`dir="auto"`): `tag`, `badge`, `button`.

**Residual risk, not yet reproduced:** `expanded/PageHeader`'s own `title` and
`description` also carry no `dir`. They did not truncate at the widths tested,
so no defect is claimed — but they will behave like F-003 and F-005 in a narrow
column, and they are two lines of the same fix.
