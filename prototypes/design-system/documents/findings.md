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

### F-003 · Table — a name truncates from its start when its script opposes the document direction

**Component:** `expanded/Table` (`avatarText` cell) **Severity:** major
**Modes:** every mode. Affects LTR and RTL equally.
**Repro:** was `orders-pristine` vs `orders-proposed`, on the removed Orders Dashboard canvas
**Status:** fixed in `sandboxes/banhaten-proposed` — `banhaten diff` shows the change

**What breaks**

The name and caption inside an `avatarText` cell carry no `dir`, so both inherit
the document direction. `text-overflow: ellipsis` clips at the visual end of the
line box. When a string runs opposite to the document, its *logical start* sits
at the *visual end* — so the ellipsis eats the beginning of the name.

Measured in the RTL frame:

| | Pristine | Proposed |
| --- | --- | --- |
| Name | `… de la Vega y Santibáñez` | `Maximiliano Alessandro …` |
| Email | `…e-procurement.example.com` | `maximiliano.alessandro.ferna…` |

The same defect appears mirrored in LTR: Arabic names lose their beginning
there instead.

**Why it matters**

This is not cosmetic. A customer column exists to identify a person, and the
identifying part of a name is its beginning. In an Arabic-first design system,
an Arabic-speaking operator running an English catalogue — or the reverse —
sees every long name arrive already useless. Half the customer base is affected
in each direction, and the cell still looks tidy, so nobody reports it.

**Fix applied**

```diff
-            <strong>{item.name}</strong>
-            {item.caption && <em>{item.caption}</em>}
+            <strong dir="auto">{item.name}</strong>
+            {item.caption && <em dir="auto">{item.caption}</em>}
```

`dir="auto"` gives each string its own base direction from its first strong
character, so truncation always happens at the logical end. The surrounding
layout still mirrors normally.

**Worth checking for the same root cause elsewhere:** any component that
truncates user-supplied text — `Select` items, `Tag`, `Menu` items, breadcrumb
labels, `Tooltip` content.

---

### F-004 · Avatar — initials are not meaningful for Arabic names

**Component:** `avatar` **Severity:** question **Modes:** all
**Repro:** was the customer column on the removed Orders Dashboard canvas

**What happens**

The initials fallback takes the first letter of the first two words:

| Name | Initials |
| --- | --- |
| عاشور عوضية | عع |
| سفيان تومي | ست |
| عبد الرحمن بن محمد بن عبد الله آل سعود الشمري | عا |

Two problems. Arabic script is cursive, so isolated letters lifted out of a word
render in forms a reader does not associate with the name. And initials are not
an Arabic naming convention at all — `عع` carries no identifying signal, while
`ست` happens to read as an unrelated word.

Compounding it, Arabic given names are heavily concentrated (عبد, محمد, أحمد),
so first-letter initials collide constantly. Three different customers in this
dataset would all show `عا`.

**Not filed as a defect** because there may be no good answer — this is a
question for the design system's owners. Options worth discussing: fall back to
a generated colour or icon rather than letters when the name is non-Latin, or
drop initials entirely in favour of a neutral placeholder.

---

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

---

## Verified good

Checked deliberately and found correct, so nobody re-checks them:

- **RTL layout**: column order, header sort affordances, filter chips, search
  field and its icon, pagination controls, toolbar, page header actions and
  breadcrumbs all mirror correctly.
- **Theming**: `brown` and `sharp` change brand colour and corner radius with
  nothing hardcoded leaking through.
- **Dark mode**: status colours, row separators, and surfaces all hold.
- **Arabic typography**: IBM Plex Sans Arabic loads and renders correctly at
  table density.
- **Alignment**: `align: "end"` correctly resolves to the left edge in RTL for
  the numeric columns.

## Investigated and rejected

- **Currency renders as `$US ١٢٬٤٨٠٫٥٠` in RTL, not `US$ …`.** Not a defect.
  `Intl.NumberFormat("ar-EG")` emits `‏` + digits + `US$`, and the `$` is
  bidi-neutral, so the Unicode algorithm correctly places it left of `US` in an
  RTL paragraph. Verified by reading the raw code points in the frame. This is
  correct RTL presentation, not a Banhaten bug.
