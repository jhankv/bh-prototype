# Findings — Orders Dashboard

Defects found while building a dense, realistic screen with Banhaten 0.3.0.
Severity is `major`, `minor`, `mixed`, or `question`.
Numbering continues from `prototypes/design-system/documents/findings.md`.

---

### F-003 · Table — a name truncates from its start when its script opposes the document direction

**Component:** `expanded/Table` (`avatarText` cell) **Severity:** major
**Modes:** every mode. Affects LTR and RTL equally.
**Repro:** `orders-pristine` vs `orders-proposed` on this canvas
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
**Repro:** the customer column in any frame on this canvas

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
