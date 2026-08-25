# Method: for us, not for the report

Everything here is about how we work. None of it goes to the design system team.
A document that mixes findings about Banhaten with cautions about our own tooling
makes the reader sort them, and some will sort wrong.

## Two passes, and they do not carry the same confidence

**Pass 1, the eye.** Someone drives the frames and reports what they see. Claude
adds DOM measurement, not source reading. "The search looks big" becomes "220px
inside a 320 container, no max-width". The eye finds it; the measurement makes it
undeniable.

This is not a formality, and `architecture-3` is the proof. Twenty-one findings
came out of building screens and reading source, and none of them was that one.
It took a designer opening the Neon frame and saying the selects looked cramped —
a sentence with no technical content at all. The measurement turned it into
`150×24` against a documented 32, and the source turned that into a defect
affecting every component in the package. Neither pass reaches it alone.

**Pass 2, the code.** Missing props, props that quietly do nothing, combinations
that break. Things nobody can see from outside. This runs last.

They stay separate because what is on screen is incontestable, while a code
reading is a claim about what should happen. One of ours already went wrong. A
grep from the wrong directory produced the claim that Banhaten had no bidi
isolation anywhere. The real count was 39 occurrences.

## Before recording anything, check it is not ours

Eleven near-misses so far, each caught before it reached a report.

**The `Select` that would not open.** Radix opens on `pointerdown`, and the
automation's synthetic click does not emit it. Keyboard opened it fine.

**Two rows that would not both check.** Two clicks in one tick against a
controlled component. With a frame between them, both stuck.

**A toolbar that looked broken.** We had used `Toolbar` for a text formatting
bar. It is a list toolbar, imported by exactly one file in the whole package,
`expanded/Table.tsx`.

**Menu icons a third too large, and the attribute that did nothing.** Asked
whether the row menu's icon sizes were ours or the component's default. Ours, and
the answer was 24px against the 18px the menu intends.

`Button` sizes an icon through `data-icon="inline-start"`. `Menu` does not read
that attribute at all — it sizes icons by wrapping them in `MenuItemIcon`, whose
variant carries `[&_svg]:size-[var(--bh-menu-leading-icon-size)]`. We had written
Button's convention inside a menu, so nothing matched and the icon rendered at
Lucide's own default.

Nothing catches this. The attribute is valid HTML, `tsc` sees a legal prop on an
svg, and `cva` never sees it at all. It is the same failure mode as an
out-of-union variant — a value that looks deliberate and matches no rule — except
that here the two conventions belong to two different components, which is
precisely what `banhaten docs` cannot warn about.

The fix nearly broke two buttons. A regex over the whole file wrapped every
`data-icon` in `MenuItemIcon`, including the ones inside real `Button`s where the
attribute is correct. Caught by reading the diff. Scoped the second attempt to
the inside of a `MenuItem` and checked both kinds afterwards: menu icons 18px and
wrapped, button icons 18px and still carrying `data-icon`.

**A button whose icon padding looked wrong twice, for two different reasons.**
Reported on the bills toolbar: the space before the icon reads tighter than the
space after the label. The box was symmetric — `padding: 6px` on both sides — so
the question was optical.

The first cause was ours. Banhaten sizes button icons itself and compensates them
optically: `[&_svg[data-icon='inline-start']]:ms-[calc(var(--bh-button-icon-offset) + …)]`
with `--bh-button-icon-offset` negative, and a generic centring rule guarded by
`:not([class*='size-'])`. Every icon we wrote carried `className="size-3.5"` and
no `data-icon`, which opted it out of **both**: 14px instead of 18px, and no
offset at all. The documented example marks the slot; we never read it.

The second cause was neither ours nor Banhaten's. With the markup corrected, the
`Filter` button — an icon at each end, so no text side-bearing to confound it —
still measured 6.5px of ink at the leading edge against 9.5px at the trailing
one. The button treats both ends identically. The icons do not:

| Icon | Box | Ink inset, each side |
| --- | --- | --- |
| `list-filter` | 18px | 1.5px |
| `chevron-down` | 18px | **4.5px** |

Three pixels, which is exactly the 3px measured. A chevron carries more empty box
than a hamburger, and no amount of padding on the component can know that. Not
filed: expecting two different glyphs to look identically inset is a property of
the icon set, not a defect in the button.

Fixed in `BillsList`. **Twenty-nine more icons across six views still carry a
hardcoded `size-` class**, and each is rendering smaller than the component
intends with no optical offset. They need marking one at a time, in context —
icon-only buttons take no `data-icon`, and several of those icons are not inside
a button at all.

**A menu that looked inaccessible and was not.** Wiring the bills filter, the
export list showed no `MenuCheckboxItem` — Radix ships one, Banhaten does not
re-export it — and `MenuItemSwitch` turned out to be a `<span aria-hidden="true">`.
The finding wrote itself: a multi-select filter with no checked state for
assistive technology.

It was wrong. `menu.tsx:304` reads `switchState === undefined ? "menuitem" :
"menuitemcheckbox"`. `MenuItem` inspects its own children, finds the switch, and
renders Radix's `CheckboxItem`. The DOM confirms it: `role="menuitemcheckbox"`,
`aria-checked`, `data-state`. The switch is `aria-hidden` precisely because the
row carries the state — which is correct, not a gap.

Two habits caught it, and only the second would have. Reading further than the
export list found the branch; querying the live DOM proved it. The first query
even hid the answer, because it asked for `[role="menuitem"]` and the rows are
`menuitemcheckbox` — a search shaped by the conclusion it expected.

**A placeholder sitting low, which was our stylesheet.** Reported as "the
placeholder is not vertically centred, and I do not know whether it is density or
alignment". Neither. The box was already symmetric — a 32px surface, a 24px
input, 4px of clearance top and bottom, `line-height: 24px`, no padding.

The text was in the wrong font. `src/frame/main.tsx` imports `shell.css`, which
it must, because document frames and the inspector are tool chrome rendered
inside the frame. But `shell.css` carried a bare `body { font-family: … }`, and
`body` sits nearer than the `html { font-family: Inter, … }` Banhaten sets. Every
frame in this repo rendered its body-inherited text in the system font. The same
rule also set `color` and `background-color`, so on a machine in dark mode a
LIGHT frame had a near-black body and near-white ink, masked only by views that
set their own.

Scoped to `body:has(> #root)` and `body:has(.prose-frame)` — the shell document
and a frame showing a document. A view frame's document now belongs to the design
system.

**The audit's measurements survived, and that was checked rather than hoped.**
`page-header-1` records six tab widths to two decimals. Re-measured after the
fix, all six are identical: 79.08 boxes, 136.11 and 139.63 for the two labels
that overflow. Components that declare their own type stack — `.ds-tabs__label`
does — never inherited from `body` and were never affected. Only text that
inherits was, and no entry measures that.

**A `Tag` that would not close.** Reported from the visual pass as a question
rather than a defect — "does this component have a close option? if not, suggest
adding one." It has one. `showCloseButton` is published in the contract with a
default of `false`, and we passed `onClose` and `closeLabel` and never the flag
that renders the button. The suggestion we were one step away from sending was to
add a feature the component already ships.

The same row carried a second one. Its buttons were `size="sm"` beside an
`Input` at `density="compact"`, which is 36px against 32. Not a Banhaten defect —
`architecture-4` already records that size words are per-component and do not
line up, and this is that entry happening to us. `Button` at `density="compact"`
resolves to `xs` at 32px and matches. The trap is that `sm` on a Button is
**taller** than `md` on an Input, so the vocabulary reads like a scale and is not
one.

**A focus ring cut off on every side.** Reported from the visual pass on frame
`expenses`: click the search field and the ring comes back clipped. It looked
like `input-4` getting worse, and the honest question — asked before we wrote
anything — was whether it was Banhaten or us.

It was us. `Table` already renders `.ds-table-wrap`, which carries `min-width:
0`, `overflow: auto` AND `contain: paint` around the grid alone. We had wrapped
`DataTable` in our own `overflow-x-auto`, which put the search field inside the
clip as well. A focus ring is a `box-shadow`: it paints outside the element's box
and reserves no layout space, so any clipping ancestor cuts it.

The wrapper was redundant in five places. Removed from `ExpensesList` and
`BillsList`; the three in `Specimens` are left alone because those frames are the
evidence for `table-2`, `avatar-1` and `badge-1`, none of them contains a
focusable control outside the grid, and changing specimen markup we cannot
re-verify in a browser is how a specimen quietly stops demonstrating its finding.

The general shape, worth carrying: **before wrapping a design system component,
check what it already wraps itself in.** Redundant containment is invisible until
something paints outside its own box.

**A figure that measured 0×0.** After switching `forms.mdx` from `<Compare>` to
`<Specimen>`, the figure's iframe reported a zero-sized box. Reverting the change
reproduced it on the original component, which ruled out the edit. The cause was
`document.visibilityState === "hidden"`: a background tab gets no rendering
lifecycle, so neither `requestAnimationFrame` nor `ResizeObserver` fires, and the
`prose` width the figure scales itself against never leaves zero. The same
condition had already made an earlier `await requestAnimationFrame` hang for the
full 45-second timeout.

The lesson is narrower than "automation lies". Static layout reads — 
`getBoundingClientRect`, `scrollWidth`, `getComputedStyle` — are computed on a
hidden tab and every measurement in these reports is one of those. Anything
driven by a rendered frame is not. Check `document.visibilityState` before
believing a zero.

**A header that printed its own column id.** Reading the Neon grid with
`textContent`, the actions column came back as `"actions"` — the column id
leaking into a header that should be blank. The source explains it: when a column
has no `header`, `Table` falls back to the id, or to the literal `"Actions"` for
`kind: "actions"`. What the source also does, on the same line, is wrap that
fallback in `<span className="sr-only">`. It is an accessible name, not a visible
label, and the computed style confirmed it: `position: absolute`, 1×1,
`overflow: hidden`. `textContent` reads visually-hidden text. The eye would never
have reported this, and the DOM did.

**A header where nothing lined up, and three of the four reasons were ours.**
Reported from the visual pass on frame `mercury`: "review this header layout".
Measured at the frame's own 1420px, the row carried four control heights — 36 for
the field, 40 for the button, 32 for the icon buttons, 24 for the avatar — and
the search that the code plainly meant to centre sat 258px left of the header's
centre line.

Only the first of those is worth reporting, and not as a defect. The centring was
ours: `mx-auto` on a flex item absorbs the space left over **after** the other
items are placed, so it centred the field against the region beside the actions
rather than against the header. The heights were ours too, and they are
`architecture-4` happening again — `Input` at its default is 36 and `Button` at
its default is 40, and `Button` only reaches 36 through `density`, never through
`size`. The icon buttons were hand-rolled markup at `size-8` in a file whose own
rule says plain markup is only for what Banhaten does not ship; it ships an
`icon-*` size scale.

The fourth was the interesting one. Our wrapper said `w-full max-w-[560px]` and
the field rendered at 320, leaving 240px of the wrapper empty — which is what
pushed the search so far off centre. `Input` is `w-[var(--bh-input-width)]
max-w-full`: fixed, and only ever shrinking. That is `input-5`, filed as a
question, because the fixed width is real and deliberate and the contract simply
never mentions it.

A convincing false finding is the worst thing this playground can produce.

## `tsc` catches prop misuse now, and used not to

For most of this audit `useDS()` returned components typed as
`ComponentType<Record<string, unknown>>`, so prop types were erased. We wrote
`ToolbarButton variant="brand"`, `Button variant="tertiary"`, `Select size="sm"`
and `Badge dot`, and nothing complained. Every one rendered a default and looked
deliberate. Two of them became findings only because a designer noticed a control
was four pixels short.

The reasoning behind that erasure was wrong, and it is worth writing down because
it stood unexamined for weeks. A frame picks its sandbox from a search param, so
the registry has to resolve components at runtime and a static import cannot.
That is a constraint on **values**. It was never a constraint on **types**:
`import type` is erased at build time, reaches no bundle, and binds no frame to
any sandbox.

`src/ds/types.ts` now intersects the pristine sandbox's modules and filters to
capitalised exports, and `useDS()` returns that. Turning it on surfaced sixteen
errors in one run, half of them real bugs nobody had seen — including three
`size="md"` on `Table`, whose union is `sm | lg`, written the same afternoon.

What still holds: **a prototype compiling is not evidence about behaviour.** The
compiler now proves a value is inside a union. It cannot tell you the component
does what the union implies — `input-2` typechecks perfectly and never reaches
the control.

`views/Specimens.tsx` passes values that are wrong on purpose, each under a
`@ts-expect-error` naming the entry it belongs to. That directive fails when the
error stops happening, so if a union ever widens to include one of them, the
build breaks and that entry needs rereading.

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

## The package documents itself and we audited without reading it

`sandboxes/banhaten/.banhaten/USAGE.md` is twenty-seven lines, and behind it sits
a CLI: `banhaten search`, `banhaten docs <component>`, `banhaten view`,
`banhaten doctor`, plus golden recipes in `docs/design-system/form-recipes.md`.
Every component ships a registry contract listing its RTL rules, its supported
exports, and its token surface.

The first twenty-one findings were written without any of it. Re-reading the
registry changed six entries, and not all in the same direction.

| Entry | What the registry did to it |
| --- | --- |
| `kbd-1` | Stronger. `inheritsDirection: false` is declared and the code inherits. |
| `kbd-3` | Stronger. `tooltip` declares `dir="auto"` for its text; the shortcut slot gets neither. |
| `table-1` | Sharper. The invented count is a hardcoded demo string, not a miscalculation. |
| `toolbar-1` | Reframed. Documented as a layout surface for filter bars, so the role is the only promise. Moved from "one right answer" to Question. |
| `breadcrumbs-1`, `page-header-2` | Weaker. Both declare no RTL contract, so this is a gap rather than a violation. |
| `architecture-2` | Stronger, and now the entry the report leads on. The metadata records the gap. |
| `pagination-1` | Rewritten. "Direction does not select language" is documented policy; the defect is the missing seam in `DataTable`. |

It also stopped two wrong entries. `.ds-table`'s 960px floor is
`--bh-table-min-width`, a token, not a hardcode. And a claim that five badge
tones never arrive was false: `badgeColor()` forwards them and all ten render,
so the restriction is in the type alone.

**The rule going forward: read `banhaten docs <component>` before recording a
finding about it.** A defect stated against a documented contract is a bug
report. The same defect stated without one is an opinion about someone else's
design, and it will be answered that way.

## Our own screens do not follow it either

`USAGE.md` rules that our prototypes break, all of them ours to fix and none of
them findings about Banhaten:

- ~~`size="sm"` on `Input` and `Select`~~ — fixed in `TableStudio`, and it turned
  into `architecture-3`. Still present in `BillsList`, `AppsOverview` and
  `ExpensesList`.
- ~~`variant="tertiary"` on `Button`~~ — fixed in `TableStudio`. Still in
  `DocEditor`, twice.
- `dot` as a bare prop on `Badge` in `ExpensesList`. The API is `type="dot"`.
- `hasLeadingIcon` in `BillsList` and `TableStudio`, documented as deprecated in
  favour of passing `leadingIcon` alone.
- `ToolbarSelect` used as an option menu in `TableStudio`, where the manual says
  it is only a trigger-shaped primitive and functional `Select` is the answer.
- `<Kbd>⌘C</Kbd>` hard-coded throughout `ShortcutsDialog`, where the manual says
  never to hard-code one Command glyph for every platform.

The last two matter most, because both screens exist to test the thing they are
misusing. `banhaten doctor` does not catch any of it: it scans the sandbox, and
our prototypes live outside it.

## Checked against 0.4.0, and all twenty-one survive

The pristine sandbox now runs 0.4.0. `banhaten doctor` reports no adoption
issues. The update touched twelve component files, which is nearly every file the
report names:

`kbd` `toolbar` `button-group` `pagination` `input` `avatar` `button` `select`
`tag` `menu` `expanded/breadcrumbs.css` `expanded/table.css`

So the whole report was at risk of describing bugs somebody had already fixed.
Every entry was re-checked. **None of them was.**

Seven were re-measured in the browser after the update:

| Entry | On 0.4.0 |
| --- | --- |
| `breadcrumbs-1` | Still no `dir`, still clipped |
| `table-2` | Still no `dir`, still clipped |
| `page-header-2` | Final period still renders at x=1796, left of the `E` at x=1800 |
| `avatar-1` | Still `عع` `ست` `عا` |
| `badge-2` | `red` still renders transparent beside ten that do not |
| `table-1` | `Showing 1 to 10 of 20 results` still sits under `Showing 1 to 3 of 3 rows` |
| `pagination-1` | Both captions still English on a fully Arabic screen |

The rest were confirmed in the 0.4.0 source: `Kbd`'s root still sets no `dir`;
`Toolbar` still defaults to `role="toolbar"` with no keyboard handler;
`ButtonGroup` still ships `role="group"` with `tabIndex = 0`; `toolbar.tsx` still
exports no separator; `pagination.tsx` still hardcodes
`caption: "Showing 1 to 10 of 20 results"`; `DataTablePagination` still has no
`messages`; the `tone` union is still seven values; `input.tsx` still guards the
optional slot on `hasRenderableContent(optionalText)` and still leaves the
required asterisk `aria-hidden` while the control takes `required` from the
native prop alone.

0.4.0 did change one thing we had written about. `KbdShortcut` is replaced by a
`Shortcut` component, and it keeps `dir="ltr"` — so `kbd-2`'s narrowing holds
under the new name, and `input.tsx` now renders `<Shortcut keys={shortcutKeys} />`.
`kbd-2` should be reread against the new component before the report ships.

**Both sandboxes now run 0.4.0 and neither carries a patch.** The five fixes we
had written into `banhaten-proposed` were removed with `banhaten update --force`;
they are recoverable from commit `2e9830c` if they are ever wanted. `banhaten
diff` reports no local changes in either sandbox.

That is a scope decision, not a cleanup. This is an audit: it finds and documents
defects, and choosing what to do about them belongs to the design system team.
The two `-proposed` frames left the canvas with the patches, and the `<Compare>`
figure in `forms.mdx` became a `<Specimen>` — a two-up figure whose halves are
identical reads as evidence of sameness when it is evidence of nothing.

