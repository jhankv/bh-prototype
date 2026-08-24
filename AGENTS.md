# Prototype Playground — agent rules

Read this before creating or changing anything under `prototypes/`.

---

## The one rule that explains the rest

**The UI is a rendering surface.** It has no authoring actions — no editor, no
drag-to-move, no properties panel, no save button. You edit files; Vite renders
them. Never add UI that mutates project data.

---

## Vocabulary

These terms are binding. Do not invent parallel names or structures.

| Term | What it is |
| --- | --- |
| **Project** | A folder under `prototypes/`. One card on the dashboard. |
| **View** | One interactive React screen. A `.tsx` file with a default export. |
| **Document** | A `.md` file rendered as a frame. Critiques, findings, notes. |
| **Canvas** | `canvas.json` — points at views and documents and groups them. It never imports them, and it no longer positions them: see `src/canvas/layout.ts`. |
| **Section** | A titled group of frames on a canvas. One subject — a product screen, a set of galleries. |
| **Row** | A line of frames inside a section, optionally labelled. A section is one unlabelled row unless it says otherwise. |
| **Frame** | One entry in a canvas: what to render, how large, and in which appearance. A frame is not a view — `mercury` and `mercury-rtl` are two frames pointing at one view. |
| **Sandbox** | An installed copy of Banhaten under `sandboxes/`. Today there is one, `banhaten`, and it is pristine. Frames declare which one they render against. |
| **Finding** | A recorded defect or observation about a design system component. |

---

## Project layout

```
prototypes/<slug>/
  manifest.json          # name, description, optional cover frame id
  canvas.json            # sections -> rows -> frames
  views/*.tsx            # default-exported React components
  documents/*.md         # markdown, rendered as frames
```

Discovery is automatic via `import.meta.glob`. Adding a folder adds a card.
There is no registry to update.

## `canvas.json`

```json
{
  "sections": [
    {
      "title": "Baseline",
      "frames": [
        {
          "id": "orders-ltr-light",
          "src": "views/OrdersTable.tsx",
          "sandbox": "banhaten",
          "width": 1440, "height": 900,
          "appearance": { "mode": "light", "theme": "blue", "radius": "default", "dir": "ltr" },
          "caption": "Orders list — the filter bar is the focus.",
          "reference": "https://mobbin.com/screens/…"
        }
      ]
    }
  ]
}
```

- `id` must be unique across the whole canvas.
- `src` is relative to the project folder. A `.md` or `.mdx` path makes the
  frame a document; anything else is a view. There is no `type` field.
- `reference` is optional, and belongs on any frame that **reproduces a real
  screen**. It renders as a `Reference ↗` link at the end of the caption,
  opening outside the canvas. A faithful reproduction is only worth calling
  faithful if the reader can check it, and a defect claimed against a real
  product is only credible next to the product. Put it on the frame rather than
  the project: two frames of one project can model two different screens.
- `width` and `height` are the **viewport the frame opens at**, not its place on
  the board. There is no `x` or `y` — position is computed from the grouping by
  `src/canvas/layout.ts`. Sections stack, rows stack inside them, frames run
  left to right inside a row.
- A section is a single row by default; write `frames` and stop thinking about
  it. Swap `frames` for `rows` when one line stops being readable:

  ```json
  { "title": "Reports", "rows": [
      { "label": "How to read this",  "frames": [ … ] },
      { "label": "Findings, by area", "frames": [ … ] }
  ] }
  ```

  A section takes exactly one of `frames` or `rows`; both, or neither, fails to
  parse. Row `label` is optional, and an unlabelled row reserves no headroom —
  which is what keeps an ordinary one-row section flush under its title.
- Order is reading order, and it is the only ordering there is. Moving a frame
  means moving it in the file; there is nothing else to keep in sync.

  This replaced 52 hand-written coordinates. They drifted twice: two sections
  were once written with the same `y` and drew on top of each other, and the
  Reports section sat 40px too close to Specimens because its gap was measured
  against the wrong frame height. Neither was visible, and nothing complained —
  the canvas is data and the shell renders exactly what it is given.

Appearance values, matching Banhaten's HTML attributes:

| Field | Values |
| --- | --- |
| `mode` | `light` `dark` |
| `theme` | `blue` `gray` `brown` `orange` `green` `purple` `teal` |
| `radius` | `default` `rounded` `sharp` |
| `dir` | `ltr` `rtl` |

## Writing views

- Default export a component taking no props.
- Frames render inside an iframe, so a view owns a whole document. Build full
  screens, not fragments.
- Mock data lives beside the view and is shaped like production data. **Seed
  it.** Frames on one canvas exist to be compared; random data makes every
  difference noise. Add explicit edge-case rows too — generated data is average
  by construction, and components break at their extremes.
- **Views may not use the shell's Tailwind classes.** `src/shell.css` scans only
  `src/`, on purpose. Tailwind utilities inside a view are generated by the
  sandbox stylesheet, which is what makes the isolation real.
- **A brand-new project directory needs a dev server restart.** Each sandbox's
  `frame.css` declares `@source "../../prototypes"`, and that glob is resolved
  when the server starts. Create `prototypes/<new>/` while `pnpm dev` is
  running and every Tailwind class in it silently produces no CSS — the page
  renders, unstyled enough to look like a design system defect. Measured:
  `grid-cols-2` computed to a single 2228px track before a restart and to four
  tracks after, from identical source. Restart before you conclude anything
  about layout in a new project.

### Colour mode is a toggle. Direction is a second frame.

The distinction is what the frame is *showing*.

**Light and dark are the same screen wearing different tokens**, so a frame per
mode is a frame wasted — two seconds of boot and a screenful of canvas to say
what one button says. The mode toggle lives in the frame header and switches in
place.

**Left-to-right and right-to-left are not the same screen.** The copy is a
different language, so they are two prototypes and you want both on the canvas
at once. Give the RTL version its own frame beside the LTR one, pointing at the
same view file.

`canvas.json` still declares the appearance a frame *opens* in. For mode, pick
whichever shows the prototype at its most ordinary; the reviewer will toggle.

### RTL means Arabic. Not English laid out backwards.

**A right-to-left frame must render Arabic copy.** English strings in an RTL
container test exactly one thing — Latin text inside an RTL paragraph — and hide
everything else an Arabic interface actually breaks on:

- the script has no uppercase, so `text-transform` silently does nothing
- it needs more line height than Latin at the same font size
- letter-spacing breaks the cursive joins outright
- the font stack has to actually resolve, and a fallback is obvious in Arabic

Write copy twice and let the frame's direction pick it:

```tsx
const c = useCopy({
  orders: { en: 'Orders', ar: 'الطلبات' },
  tabs: { en: ['All statuses', …], ar: ['كل الحالات', …] },
})

<PageHeader title={c.orders} tabs={{ items: c.tabs }} />
```

`@/copy` exports `useCopy` for a dictionary and `t()` for a single phrase.

**Translate the interface, not the data.** Customer names, emails and product
titles stay as they are. A real Arabic console has Arabic chrome and a customer
list that is whatever the customers are called, and that mixture is the only
thing that exercises bidi at all — three of the findings in this repo came from
it. A table of uniformly Arabic rows would look correct and prove nothing.

This rule paid for itself immediately: with the console in Arabic, the first tab
renders `ل الحالات` instead of `كل الحالات`, and the table footer turned out to
be the only English left on the screen (`pagination-1`).

### Two document formats, two jobs

Findings live in `prototypes/component-audit/documents/`, **split by story** —
`keyboard`, `direction`, `forms`, `data`, with `index` explaining how to read
them. One story per document, and each one small enough that the copy button
produces a prompt an agent can actually use. Do not let one grow past roughly a
hundred and fifty lines; split it instead.

`method.md` is separate and is **not part of the report**. It holds how we work,
what we nearly got wrong, and what is still uncovered. A document that mixes
findings about the design system with cautions about our own tooling makes the
reader sort them, and some will sort wrong.

Reports are `.mdx` rather than `.md` so an entry can carry a `<Compare>` figure
beside the claim it makes. Use one when a fix is **visible** and the difference is small
enough to hunt for — `input-3` is one word inside a parenthesis, and no reader
was ever going to find it across two 900px galleries. Do not use one when the fix
is invisible: `input-2` changes an ARIA attribute and nothing on screen moves, so
it carries a measured table instead, and says plainly that no figure is possible.

`documents/<component>-audit.mdx` is an **audit**: one component, and the
evidence rendered live inside the paragraph that makes the claim about it.

```mdx
A Latin description inside an Arabic page renders with its final period at the
**front** of the sentence.

<Compare src="views/snippets/PageHeaderCase.tsx" dir="rtl" viewport={720} height={200} />
```

`<Compare>` renders one snippet against both sandboxes, side by side. It needs
no import — `vite.config.ts` points MDX's `providerImportSource` at
`src/frame/mdx/provider.tsx`. That is not a convenience: an import line inside a
document would be a static ESM import of a design system path, the one thing
views are forbidden from doing, and it would bind the document to one sandbox at
build time.

Three rules for `<Compare>`:

- **Each side is a real nested iframe.** A document cannot simply load both
  stylesheets — they define the same `--bh-*` properties and the same `ds-*`
  classes, so the second to load would win and the comparison would be a lie.
  Producing a convincing false finding is the worst thing this tool can do.
- **The snippet lives in `views/snippets/`**, not inline in the prose. It has to
  cross a document boundary, and a URL can carry a path where it cannot carry a
  closure.
- **`viewport` is part of the evidence, not styling.** Tab clipping and text
  truncation are both functions of available width. The snippet is laid out at
  `viewport` px and then scaled to fit the column, and both the width and the
  resulting scale are printed in the figure caption so the reader can reproduce
  it. A snippet is never scaled *up* past 1 — an enlarged component shows
  spacing and hairlines no browser will ever render.

**The figure sizes itself to the evidence. Do not set `bleed` by hand.**

Prose is about 700px wide, which is right for reading and wrong for evidence. So
a figure is exactly as wide as its snippet needs, capped at the window: it
breaks out of the text column only when the snippet is bigger than the column,
and never grows past the snippet.

Both failure modes are real and both were shipped before this was measured. A
component squeezed into a 330px half-column renders at 45% and cannot be
examined. A figure stretched to 1120px around a 720px snippet pads it with 400px
of white that reads like part of the component — and a reader who mistakes
padding for the component files a defect that does not exist.

Measured on the PageHeader audit, prose column 704px:

| `viewport` | Figure | Dead space | Scale |
| --- | --- | --- | --- |
| 720 | 720 — breaks out by 16px | 0 | 100% |
| 480 | 480 — stays inside | 0 | 100% |

The explicit values `prose`, `wide` and `full` remain for the rare figure that
should be deliberately wider or narrower than its content warrants.


Keep the snippet minimal. Every element that is not part of the claim is
something a reader has to rule out.

### Hold Alt to ask what a component is

Inside any activated frame that renders a sandbox, holding **Alt** highlights
the nearest design system component under the cursor and names it:

```
Badge · components/ui/badge.tsx · badge-label
```

Alt-click copies that line. Releasing Alt clears it. It is read-only — it
highlights and copies, and never changes the page.

This exists for the step between *observing* a defect in a composition and
*isolating* it: a filter in a dashboard is a Select inside a Toolbar inside a
DataTable, and reading the view file to work that out is the loop this tool
removes.

Resolution is exact, not a naming convention. `src/frame/inspector/componentIndex.ts`
scans the active sandbox's own sources for two things: every `data-slot` value,
and every `ds-*` class. Both are needed — measured on the sales console, 378
elements resolve through `data-slot` and **204 through `ds-*` classes**. A
`data-slot`-only inspector would be a third blind, and blind precisely on
`expanded/`, whose four files carry no `data-slot` at all.

Coverage on that page is 96%. The 23 misses are the prototype's own layout
markup, which is the correct answer — if it is not a design system component,
the inspector should say nothing.

### Never import design system components — resolve them

A static ESM import is fixed at build time, so an imported `Button` can only
ever come from one sandbox. That would make the pristine-versus-proposed
comparison impossible. Use the registry:

```tsx
import { useDS } from '@/ds'

export default function OrdersTable() {
  const { Table, Badge, Button } = useDS()
  return <Table>…</Table>
}
```

Only capitalised exports are registered — `buttonVariants` and other helpers are
not available through `useDS()`. Asking for a component the sandbox does not
have throws a message naming it and the `banhaten add` command that installs
it.

### Read the component's contract before you call it

Run `banhaten docs <component>` first. It prints the real prop table, the
defaults, the RTL rules and the recommended recipe, and it is generated from the
installed registry, so it is current in a way this file can never be. Also
`banhaten search <need>` when you do not know which component you want, and
`banhaten view <component>` before wrapping or extending one.

Two rules from `.banhaten/USAGE.md` that this repo has broken more than once:

- **One semantic `density` across every control in a row.** `compact` is 32px,
  `default` is 36px, `comfortable` is 40px. Not `size`.
- **Never a raw height, padding, radius or font-size utility on a design system
  control.** Width and responsive layout utilities are fine.

#### What `banhaten docs` will not tell you

It documents one component at a time, so it cannot warn you about the traps that
only exist between components. These cost this audit four findings:

| Trap | What happens |
| --- | --- |
| `size="sm"` | Real on `Button`, `Table` and `Badge`. Absent from `Select` and `Input`, where it silently applies no padding and the control collapses onto its text. |
| `density` | Every control accepts it. Nothing propagates it — no context, no cascade, not even from `Toolbar` to its own children. Miss one control and it renders 36 beside its neighbours at 32. |
| Any out-of-union value | `cva` matches no rule and applies no class. `defaultVariants` does not rescue it: those apply when a prop is `undefined`, not when it is wrong. `variant="tertiary"`, `color="red"` and `size="sm"` all render something that looks deliberate. |
| `dot`, `hasLeadingIcon` | Not props. `type="dot"` is, and `hasLeadingIcon` is deprecated in favour of passing `leadingIcon` alone. |

**`tsc` catches all of it, and only since `src/ds/types.ts` existed.** `useDS()`
returns the pristine sandbox's real module shapes, so an out-of-union value is a
compile error in your editor. Before that it typed everything as
`ComponentType<Record<string, unknown>>`, and every row above shipped at least
once.

Two things it still does not cover. `banhaten doctor` scans the sandbox, not
`prototypes/`, so it sees none of your calls. And a value being inside a union
says nothing about whether the component honours it — `isRequired` typechecks and
never reaches the input.

So: read the docs, then read the table above, then write the call, and let the
compiler confirm rather than discover.

When a value must be wrong on purpose — the specimen frames exist for exactly
that — use `@ts-expect-error` with the entry name in the comment, never a cast.
The directive fails when the error stops happening, which is precisely when that
finding needs rereading.

## Writing findings

Findings live in `prototypes/component-audit/documents/`, split into four
reports by subject — `keyboard`, `direction`, `forms`, `data` — with `index.mdx`
explaining how to read them. Put an entry in the report its subject belongs to;
do not start a fifth, because a reader who has to search two places trusts
neither.

`method.md` in the same folder is **not** part of the report. It is ours: how the
two passes work, what the registry corrected, near-misses caught before they
reached a report, and our own misuse of the package. Keep audit findings out of
it and keep our own mistakes out of the four reports.

**Name an entry after its component**, numbered in the order it was found:

```markdown
### `table-4` · Row density breaks with an avatar and a badge in one cell
**File:** `expanded/Table.tsx` · **Severity:** major · **Status:** open
**Repro:** frame `neon`, the customer column at 900px.
What breaks, measured. Why it matters. Then the fix, or the question.
```

A name carries its subject before the reader reaches the text, and it survives a
retitle — which matters, because entries cite each other (`kbd-2` exists only to
narrow `kbd-1`). Never number findings `F-001`; that scheme said nothing to
anyone outside the repo.

Severity is `major` `minor` or omitted. Status is **Confirmed** — it reproduces
on a named frame and the cause is identified in the source — or **Question**,
meaning more than one answer is reasonable and the choice belongs to the design
system's owners, not to us.

**Always give a `Repro` line naming the frame.** A finding nobody can reproduce
is an opinion.

Every finding ends as a note in `prototypes/*/documents/`. Never leave one only
in a conversation.

### This is an audit. Do not write fixes.

Report what happens, where to see it, and what in the source causes it. Stop
there. No patches, no diffs, no recommended API, and no "suggested:" paragraph.

The reason is not modesty. An audit that arrives with fixes attached asks the
reader to review two things at once — whether the problem is real, and whether a
stranger's solution is the one they want. The second question is easier, so it
gets answered first, and a rejected fix takes a real finding down with it.

State the cause, which is audit. Do not state the remedy, which is proposal.
`dir` is missing from the label span → yes. Add `dir="auto"` → no.

**Check the contract before calling something a defect.** Run
`banhaten docs <component>` and read its RTL rules and prop table. Where a
component declares a contract and breaks it, say so — that is a bug report. Where
it declares nothing, say that instead and mark it a Question. The same defect
without a contract behind it is an opinion about someone else's design, and it
will be answered that way.

---

## Sandboxes

| Sandbox | Rule |
| --- | --- |
| `sandboxes/banhaten/` | **Pristine.** Never edit. `banhaten update` must always be safe here, and `banhaten diff` must always come back empty. |

There used to be a second sandbox, `banhaten-proposed`, holding our patches. It
was removed when the work became an audit: with nothing to compare against, the
canvas toolbar showed a switcher that changed nothing, and an unwatched copy of
the design system is somewhere an accidental edit can hide.

Restoring it is three commands, so do it the moment a proposal is actually
wanted — and not before:

```bash
cp -r sandboxes/banhaten sandboxes/banhaten-proposed
# then set "name" to "@sandbox/banhaten-proposed" in its package.json
pnpm install
```

The frame toolbar shows its sandbox switcher only when more than one exists, so
it comes back on its own.

`globals.css` in either sandbox is generated by the Banhaten CLI — never edit it
by hand. `frame.css` is ours: it registers which sources this build generates
classes for.

Adding a component:

```bash
npx banhaten add <component> --cwd sandboxes/banhaten
pnpm install   # NOT optional — add writes new deps into the sandbox's
               # package.json, and the build fails to resolve them until this runs
```

If a second sandbox exists, install into **both** or they drift.

`sandbox: "none"` means a view with no design system — the shell's own smoke
tests. It mounts no provider and loads no sandbox stylesheet, so `useDS()` will
throw there.

Inside a sandbox, `@/…` resolves to that sandbox's root, not to `src/`. This is
handled by the `scoped-at-alias` plugin in `vite.config.ts`, because Vite's
`resolve.alias` is global and cannot mean three different roots at once.

---

## Working on the tool itself

`src/` is a different job with different rules — see [CLAUDE.md](CLAUDE.md).
Two that matter from here:

- `sandboxes/` is vendor code and is excluded from ESLint. Do not "fix" lint in
  generated files; it breaks `banhaten update` and pollutes the proposal diff.
- Verify visible behaviour by driving the running app. Every serious bug this
  project has had was invisible when reading the code.

## Invariants

Breaking any of these breaks the tool's reason to exist.

1. **Frames are live applications, never screenshots.**
2. **Every frame opens standalone by URL.** Appearance travels in search params.
   This is what keeps deployment a config change rather than a rewrite.
3. **Failures stay local to one frame.** A broken view must never blank the canvas.
   Only one frame is interactive at a time; `Escape` releases it, forwarded from
   inside the frame by `postMessage` because focus lives in the iframe.
4. **No backend, no database, no user system.** The filesystem is the database.
5. **The shell must not look like the design system under test.** A reviewer has
   to be able to tell tool chrome from prototype.

---

## Keeping this file honest

When you change the canvas schema, the project layout, or any invariant above,
update this file in the same change. A stale rule file silently teaches the next
agent to do the wrong thing.

**Do not link a build-time document as if it were the contract.** This file used
to open with a pointer to the v1 design spec, and three of the templates in it
had gone stale without anyone noticing: `type: "view"`, frames carrying `x` and
`y`, and a finding format with a **Proposed fix** field that the audit scope now
forbids. The spec was never wrong — it correctly records what was decided in
August. It was the link that was wrong, because a document describing how the
tool was *built* cannot also describe how it *is* once you start iterating.

The rule files carry the contract. History stays in `docs/`, unlinked.
