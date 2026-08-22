# Findings — Banhaten 0.3.0

One entry per defect. Severity is `major`, `minor`, `mixed`, or `question`.
Every finding ends as a note here or a diff in `sandboxes/banhaten-proposed`.

---

### F-001 · Kbd — modifier and key swap order in RTL

**Component:** `kbd` **Severity:** major **Modes:** any `dir="rtl"`
**Repro:** frame `probe-banhaten-rtl` — compare against `probe-banhaten-light`

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
