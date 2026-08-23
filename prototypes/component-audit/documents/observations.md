# Observations — component audit

**Phase 1: what is visible on screen.** Every entry here was seen in a running
frame and then measured in the DOM. None of it was read out of component source
— that pass comes last and lands in its own document, because an observation and
a code reading do not carry the same confidence and must never be mistaken for
each other.

**Every screen here is a faithful reproduction**, not a composition of our own.
That is the control variable, and without it a finding can always be answered
with "that layout is not real".

| Surface | Reference | Components |
| --- | --- | --- |
| Notification settings | [Mercury](https://mobbin.com/screens/cd614ddf-6c42-41be-b0ed-1e1a1653e70e) | `toggle` `badge` `menu` `input` `avatar` `button` |
| Table browser | [Neon](https://mobbin.com/screens/926541e1-1d12-4677-8faf-54193a709b17) | `checkbox` `select` `select-content` `segmented-control` `toolbar` `expanded/Table` |
| Document editor | [Coda](https://mobbin.com/screens/d43c69b1-4c44-461a-8af9-4b9047d0ab0a) | `button-group` `tooltip` `menu` `select` |
| Bulk import | [PandaDoc](https://mobbin.com/screens/6e7783c1-2ce2-4ba2-832d-bab89ec45f67) | `progress` `spinner` |
| Nothing created yet | [Laravel Cloud](https://mobbin.com/screens/5a0b71b3-f06f-4b14-af43-b862c1550a8f) | `EmptyState` |

Nothing was added to any screen to raise coverage. Where a screen needed
something Banhaten does not ship — navigation lists, prose, page tabs — that is
plain markup, so a defect found on it would be ours and not theirs.

**`Toolbar` is a list toolbar, and that governs where it appears.** It is
imported by exactly one file in the whole design system — `expanded/Table.tsx` —
and its exports are `ToolbarSearch`, `ToolbarFilterButton`, `ToolbarMoreButton`,
`ToolbarBadge` and `ToolbarText`. Search, filters, more, a count. So it lives on
Neon's table row, not on Coda's formatting bar, where a first attempt did put it
and produced something that looked broken. Forcing a component into a shape it
was not built for manufactures a convincing false defect, which is the worst
thing this playground can make.

Coda's bar therefore uses the components whose contracts match: `ToggleGroup
type="multiple"` for bold/italic/underline/strike, since those are independent
states that can all be on at once, and `ButtonGroup` for link/comment/image/AI,
since those are actions — a toggle group there would tell a screen reader that
"Comment" is currently on. The floating surface under the bar is plain markup;
Banhaten ships no floating-toolbar surface.

`table-elements` is not covered visually and that is on purpose. It exports
structural wrappers with almost no styling — `TableCell` and `TableBody` add no
classes at all — so a screen built on them would be showing our CSS. It belongs
to the code pass.

**A caution for the code pass.** `useDS()` returns components typed as
`ComponentType<Record<string, unknown>>`, so an invalid prop on a design system
component typechecks cleanly inside a prototype. `ToolbarButton variant="brand"`
was written here and silently did nothing — `brand` is not one of its variants.
`tsc` cannot catch misuse in these files; only reading the component can.

---

## The formatting toolbar

Four observations from one screen, frame `coda`. They are listed separately
because only the first has a single right answer — the other three are decisions
that belong to the design system's owners, not to us.

Reference for all four: [W3C ARIA Toolbar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/),
whose own worked example is a text formatting toolbar, and
[Radix Toolbar](https://www.radix-ui.com/primitives/docs/components/toolbar).

---

### F-201 · `Toolbar` promises keyboard navigation and implements none

**Component:** `toolbar.tsx` · **Severity:** major · **Status:** OPEN — fixable, one right answer

`Toolbar` sets `role="toolbar"`. That role tells assistive technology two
specific things: the bar is **one** tab stop, and arrow keys move between the
controls inside it. Neither happens — `toolbar.tsx` contains no keyboard handler
at all.

Measured on the formatting bar:

| | |
| --- | --- |
| Tab stops in the bar | **11** |
| What the role promises | **1** |

**Why it matters.** A wrong role is worse than no role. Someone using a screen
reader is told arrow keys will work, tries them, and nothing moves — and they
have no way to know the announcement was wrong rather than their input. With
`role="group"` they would simply Tab, which is slow but never misleading.

**This is not a feature request.** The component already claims this behaviour.
Adding the roving tabindex does not change what `Toolbar` is; it makes it do
what it already says. That is why it is the only one of the four we would patch.

---

### F-202 · `ButtonGroup` makes the container a tab stop as well as every button

**Component:** `button-group.tsx` · **Severity:** minor · **Status:** OPEN — needs a decision

`ButtonGroup` renders `role="group"` with `tabIndex={0}` on the wrapper, and
leaves every button inside focusable too. So Tab stops on an empty container
that does nothing, then again on each button in it.

Measured: two of the eleven tab stops above are container `<div>`s.

**Why we did not patch it.** Removing `tabIndex` from the wrapper changes the
tab order of every screen already using `ButtonGroup`. That is the same reason
F-006 chose `aria-required` over the native `required` attribute — a fix that
silently changes behaviour for existing consumers is a decision, not a
correction.

---

### F-203 · There is no separator for a toolbar

**Component:** `toolbar.tsx` · **Severity:** minor · **Status:** OPEN — new API

A real toolbar groups its controls and divides the groups with a rule. Radix
ships `Toolbar.Separator` for exactly this. Banhaten has no equivalent, so the
dividers in our prototype are hand-written `<span>`s.

That works visually and is wrong structurally: a hand-drawn line is invisible to
assistive technology, where a separator with the right role announces that one
group of controls has ended and another has begun.

**Why we did not patch it.** Adding a component is a product decision about what
the package contains. That is yours.

---

### F-204 · The two hand-rolled components are the two with keyboard gaps

**Components:** `toolbar.tsx`, `button-group.tsx` · **Severity:** question · **Status:** OPEN

This is the observation worth sending upstream, because it explains the other
three rather than adding to them.

Nearly every interactive component in Banhaten wraps a Radix primitive —
`avatar`, `checkbox`, `dropdown-menu`, `select`, `switch`, `tabs`, `tooltip` are
all in `package.json`. **`@radix-ui/react-toolbar` and
`@radix-ui/react-toggle-group` are not.** Those two are written by hand.

And they are exactly the two with the gaps above. Measured:

| | `role` | Arrow keys | Roving tabindex |
| --- | --- | --- | --- |
| `ToggleGroup` | `group` | yes — Bold → `→` → Italic | no |
| `ButtonGroup` | `group` | no — Link → `→` → stays on Link | no |
| `Toolbar` | `toolbar` | no handler at all | no |

`ToggleGroup` is the near miss: someone did write the arrow keys, including the
RTL reversal, and stopped before the roving tabindex. So it is half the pattern,
which is easy to mistake for all of it.

**The question.** Adopting `@radix-ui/react-toolbar` would close F-201 and F-203
together and bring the two outliers back in line with how the rest of the
package is built. Whether that trade is worth a dependency is an architectural
call, and it is the one we would most like to hear an answer to.

---

*No further entries yet.*
