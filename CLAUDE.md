# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A local prototyping environment **for the Banhaten design system**. A dashboard
lists projects; opening one shows a pan/zoom canvas of **live, interactive React
prototypes** built with a source-installed copy of Banhaten, rendered across
appearance modes and against two versions of it at once.

Its purpose is not to look nice. It is to **stress Banhaten components and
produce actionable defect reports** — see `prototypes/component-audit/documents/`.

### Scope: Banhaten only — on purpose

This is not a generic design system playground and must not be made into one.
The engine happens to be agnostic — `src/ds/registry.ts` globs `sandboxes/*` and
registers whatever it finds — but that is a consequence of the two-sandbox
comparison, **not an extension point to build on**.

Exactly two places encode Banhaten, and they are the ones to change if a second
design system ever arrives:

| Where | What is Banhaten-specific |
| --- | --- |
| `src/lib/schema.ts` | `AppearanceSchema` — the seven `theme` values and three `radius` values |
| `src/lib/appearance.ts` | The attributes written to `<html>`: `class="dark"`, `data-theme`, `data-radius`, `dir` |

Roughly fifty lines. Do **not** abstract them behind a plugin, adapter, or
config layer in advance: a second design system may express appearance through
CSS variables or a React provider rather than HTML attributes, and an
abstraction designed against one case models that case in disguise.

Two audiences, two documents:

- **This file** — working on the playground itself (`src/`, build, architecture).
- **[AGENTS.md](AGENTS.md)** — authoring prototypes (`prototypes/`, `sandboxes/`).
  Read it before touching either directory. Its vocabulary is binding.

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # tsc -b && vite build
pnpm lint             # eslint . — must stay at zero
pnpm preview          # serve dist/, the only honest place to measure performance

npx tsc -p tsconfig.app.json --noEmit   # typecheck alone, faster than a build
```

There is no test suite. This is an internal tool whose real test is daily use;
`tsc -b`, `eslint`, and driving the running app are the checks.
**Verify UI behaviour by driving the app, not by reading the code** — the
three worst bugs in this repo's history were all invisible on the page.

After installing design system components, `pnpm install` is **required**, not a
hint — `banhaten add` writes dependencies into each sandbox's `package.json` and
the build fails to resolve them until it runs.

## Architecture

Three roles, and the boundaries between them are the whole design.

```
index.html  → src/main.tsx  → the SHELL    dashboard + canvas chrome
frame.html  → src/frame/    → the FRAME    one prototype, one iframe, one document
                              the SANDBOX  a source-installed design system
```

**The shell has no authoring actions.** No editor, no drag-to-move, no
properties panel, no save button. You edit files; Vite renders them. This single
constraint is why the project is small enough to exist. Never add UI that
mutates project data.

The copy button on document frames (`src/frame/CopyHandoff.tsx`) is not an
exception to that rule and must not be cited as precedent for one. It reads a
`.md` file that Vite already loaded and writes to the clipboard; nothing in the
project changes. It exists because a findings document that cannot leave this
repository is worth nothing — the reader on the other side is an agent sitting
on the real design system source, so the button composes a handoff telling it
which entries carry a diff and which need a human decision.

**The filesystem is the database.** `import.meta.glob` over `prototypes/*`
discovers projects, views, and documents. There is no registry to keep in sync
and no backend, which is also what keeps deployment a config change.

**One rail, everywhere in the shell.** `src/app/ShellSidebar.tsx` is the only
permanent surface: the way back to the projects, and the mode toggle. It exists
because that toggle was landing in three different corners, and a control that
moves is one you have to look for.

It does **not** list the projects, and should not be made to. An icon rail can
only carry items with a shape of their own, and projects have none: ten of them
would be ten identical squares told apart by a tooltip. The dashboard chooses a
project; the rail is how you reach the dashboard from anywhere. It is a 56px icon rail rather than a named sidebar because
the canvas fits to WIDTH — a comparison row is two 1420-wide frames, so every
pixel here comes off the scale every board opens at. It is **not** in
`frame.html`: a frame shows someone else's design system at full bleed, and the
tool's navigation has no business inside it.

The rail owns the viewport height and the routed column scrolls inside it.
Scrolling the document instead would carry the rail off the top of the screen,
which is the one thing it may not do.

**Three routes, and the canvas is the last of them.** `/` lists projects,
`/p/:slug` is the project page, `/p/:slug/canvas` is the board. The project page
is the front door because the canvas is the wrong one: it mounts frames until
the board is covered, so reading one findings document used to cost a whole
canvas, and it answers "how do these compare" when the question is usually
"where is the one about forms".

Its list comes from `canvas.json`, never from a glob over the folder, and
`projectIndex` in `src/lib/projects.ts` is where that is enforced. `views/` also
holds data modules and snippets used inside an MDX document, none of which
render on their own — and a frame is a file *plus* a sandbox *plus* an
appearance, which only the canvas declares. Frames sharing a `src` collapse into
one row: on the board a screen and its Arabic twin are deliberately two frames
because you compare them side by side, but a list of links is not a comparison,
and the same name twice with nothing to tell them apart is a list you have to
read carefully to use.

**A frame opened on its own carries its own toolbar** (`src/frame/`), rendered
only when `window.parent === window` — inside the canvas the shell already draws
one above it. Until it existed a standalone frame had no controls at all: the
appearance came from the URL and the only thing that could change it afterwards
was a message from a canvas that was not there.

Mode, theme and radius change in place and correct the URL with
`history.replaceState`, because the URL is what you copy and a link that reopens
a different screen than the one you copied is worse than no link. **Direction
and sandbox reload instead, and neither is laziness.** `useCopy` in
`src/copy.ts` reads `dir` off `window.location.search` rather than off React
state, so flipping it without a reload renders an RTL layout still carrying
English copy; a sandbox is a different stylesheet, and only a fresh document
loads one. The shared controls live in `src/chrome/`, so the same toolbar
appears in both places and `direction` — a label on the canvas, a switch
standalone — is the one prop that names the difference.

**Scanning scope is not isolation.** `src/shell.css` scans only `src/`, which
keeps shell *utilities* out of a view — but the frame imports that stylesheet for
its own chrome, so any **global selector** in it lands in the frame's document
too. A bare `body { font-family; color; background-color }` did exactly that: it
beat Banhaten's `html { font-family: Inter }` for everything that inherits, and
painted a light frame's body in the shell's dark palette. Global selectors in
`shell.css` must say which document they mean.

**The shell has a colour mode of its own, and it is not in the URL.** A frame's
appearance is part of what its link means — sending someone `mode=dark` sends
them the state the defect appears in — while the colour of the tool around it
says nothing about the finding, so it lives in `localStorage` and an inline
script in `index.html` applies it before the stylesheet paints.

What that forced is the more useful rule: **`shell.css` reads `.dark` on
`<html>`, never `prefers-color-scheme`.** Both documents already carry that
class — the shell from the stored preference, a frame from `applyAppearance` —
so one signal now serves both. The media query answered to something no control
in the tool could reach, and it took the `dark:` variant with it: a document
frame switched to light from its toolbar kept dark prose and a dark copy button
on a dark-mode machine. `shell.css` therefore redeclares the variant
(`@custom-variant dark`) so the tokens and the utilities cannot drift apart.

**Every frame is an iframe.** That buys CSS isolation, real viewport and media
queries, per-frame `<html>` attributes for theming and direction, and crash
containment. It costs roughly one second per frame — measured, inherent, not
optimisable. See "Performance" below.

### Three things that are not what they look like

**1. `@` is not a Vite alias.** It is resolved by the `scoped-at-alias` plugin in
`vite.config.ts`. `@/…` means three different roots — `src/`, and each design
system under `sandboxes/` whose CLI writes `@/lib/utils` into its own components.
A global alias cannot express that, and Rolldown applies `resolve.alias` in its
**native resolver before any JS plugin runs**, so an `enforce: 'pre'` plugin
never sees an aliased specifier. The plugin owns the prefix outright and resolves
against the filesystem rather than delegating back.

**2. Views never import design system components.** A static ESM import is fixed
at build time, so an imported `Button` could only ever come from one sandbox —
and the pristine-versus-proposed comparison is the point of the tool. Views call
`useDS()` from `@/ds`, backed by a lazy per-sandbox registry in
`src/ds/registry.ts`. Only capitalised exports are registered.

That constrains **values**, not types, and the difference went unexamined long
enough to cost real findings. `import type` is erased at build time, so
`src/ds/types.ts` can intersect the pristine sandbox's modules and hand `useDS()`
their real prop types without binding any frame to a sandbox. Before it existed
every component arrived as `ComponentType<Record<string, unknown>>` and
`variant="tertiary"`, `size="sm"` and a bare `dot` all compiled and did nothing.
Turning it on found sixteen errors in one run.

Two consequences worth knowing. `tsconfig.app.json` maps `@/*` to `src/` **and**
to the sandbox root, because the Banhaten CLI writes `@/lib/utils` into the files
it installs. And `noUnusedLocals` moved to ESLint, which already ignores
`sandboxes/`: typing against vendor code puts it in the program, and those rules
would then report errors in generated files nobody may fix.

**3. Frames are inert until clicked, and talk back by message.** An iframe
swallows pointer events, so a frame under the cursor would stop the canvas
panning. An inactive frame is covered by an overlay in the shell's document,
which takes the events instead.

That overlay is not a style choice, and **the iframe's own `pointer-events` must
never be toggled**. Doing so made a freshly selected frame ignore the scroll
wheel until something inside it was clicked. It took three wrong guesses and an
on-screen counter to find: the wheel *was* delivered to the frame's document,
nothing called `preventDefault`, the page did not move — and the arrow keys
scrolled it perfectly. Keyboard scrolling is resolved on the main thread; wheel
scrolling is resolved by the compositor against its own map of which regions
scroll, and that map is built when the page paints. Flipping `pointer-events`
told the main thread at once and left the compositor believing the region was
inert. Leave the iframe alone and change what sits on top of it.

Releasing a frame needs a message, not a keyboard handler: once a frame is used,
focus lives **inside** the iframe and the canvas window receives no keydown at
all. `src/lib/frameMessages.ts` carries three origin-checked messages — Escape
and readiness upward, appearance downward.

Appearance goes by message rather than by rebuilding the frame's `src` because a
new URL reloads the document, and the state you were in is usually *how* you
found the defect. Only a sandbox switch reloads, since a different design system
means a different stylesheet. Two rules fall out of that, and both were bugs
first:

- A reloading frame must announce **`ready`** before it can be sent anything.
  `load` fires before React has mounted inside, `postMessage` has no queue, and
  the lost message left a frame rendering light-blue under a toolbar that read
  dark-brown. The chrome disagreeing with the pixels is the worst failure this
  tool has, because it makes a *finding* wrong.
- Every listener filters on message **type**, not just source. They share one
  window.

### One design system today, two by construction

`sandboxes/banhaten/` is **pristine** and never hand-edited, so `banhaten update`
is always safe and demos show honest current behaviour.

A second sandbox, `banhaten-proposed`, held our patches until the work became an
audit rather than a proposal. It was removed: with nothing to compare against,
the frame toolbar showed a switcher that changed nothing, and an unwatched copy
of the design system is somewhere an accidental edit can hide. `AGENTS.md` has
the three-command recipe for bringing it back.

Nothing in the shell was changed for that. `src/ds/registry.ts` globs
`sandboxes/*` and the toolbar renders its switcher only when more than one
exists, so both the one-sandbox and two-sandbox cases already worked. A frame
still declares which sandbox it renders against, which is what lets the same view
file appear twice on one canvas when there is something to compare.

Sandboxes are pnpm workspace packages because `banhaten init --cwd` writes a
`package.json` and `tsconfig.json` into each directory. They are vendor code and
are excluded from ESLint: linting them invites an agent to "fix" generated files,
which breaks `banhaten update` and pollutes the proposal diff.

## Dependencies

Small on purpose, and each line is a decision someone can otherwise undo by
reflex.

| Need | Package | Why this one |
| --- | --- | --- |
| Canvas pan/zoom | `react-zoom-pan-pinch` | Ships `zoomToElement` and `KeepScale`, which is most of the feature list |
| Routing | `wouter` | ~2.6 kB for two routes. `react-router` is far more machinery than a dashboard and a canvas need |
| Markdown documents | `react-markdown` + `remark-gfm` | Findings documents use GFM tables |
| Mock data | `@faker-js/faker` | Ships `locale/ar` beside `locale/en`, which the RTL frames need |
| Schema validation | `zod` | Parses `canvas.json` at load time, so failures become error frames instead of thrown exceptions |
| Icons | `lucide-react` | Already arrives with Banhaten. Zero marginal cost |

**Rejected, and why it stays rejected.** `@xyflow/react` is a node-and-edge graph
editor — we have frames, not graphs, and no edges at all. A hand-rolled pan/zoom
layer is genuinely small until zoom-at-cursor, trackpad pinch, bounds clamping
and zoom-to-frame, which is where it stops being small.

**No global state library — the reflex to add one is the thing to resist.** Every
piece of state here already has an owner, and a store would create a second
source of truth beside the URL:

| State | Lives in |
| --- | --- |
| Which project and canvas are open | The URL — it must be linkable |
| Frame appearance | URL search params — every frame must open standalone |
| Pan and zoom | `react-zoom-pan-pinch`, deliberately ephemeral |
| Projects, views, documents | The filesystem, via `import.meta.glob` |
| Findings | Markdown in git — reviewable, diffable, permanent |

The URL has to be authoritative because every frame must open standalone by URL.
Two sources of truth would drift, and the one that loses is the shareable one.

## Performance

Opening a ten-frame canvas once took 12.2 seconds to first paint. Two plausible
causes were measured and **both were wrong** — the eager component registry
(shrunk 485 kB → 14 kB, no effect) and the design system's CSS and webfonts (a
canvas with no design system at all still cost ~1 s per frame).

`src/canvas/useProgressiveMount.ts` mounts one frame per animation frame rather
than all of them in one commit: first paint 12.2 s → 3.8 s.

It also mounts only what is near the viewport, which was **rejected once and the
reason expired.** The canvas used to fit the whole board, so every frame was in
view and observing them saved nothing. It fits the width now, so two or three
rows are in view: a twenty-six frame canvas opens with eight mounted, and
panning mounts the rest. That is the difference between 15 seconds and 5.

The check is `getBoundingClientRect` on the pacer's own tick, **not**
`IntersectionObserver`. The observer is the right tool and shares rAF's defect:
measured in a hidden tab, zero callbacks for a target 89px from the top of a
1752×1214 viewport. Layout is computed on demand; intersection is computed when
the page renders, and a hidden page does not.

**"The cost is the iframe itself" was half right, and the half that was wrong
stood for months.** That first pass measured *bytes* — the registry shrank
485 kB to 14 kB with no effect — and concluded the remaining second per frame
was inherent. What it never counted was *requests*. Splitting the registry per
component produced **73 chunks with a median size of 1 kB**, and `loadSandbox`
awaits every one of them before a frame renders. Seventy-three round trips
carrying nothing, per document, in a canvas of twenty-six documents that share
no module graph. `vite.config.ts` now collapses them: one frame went from 96
requests to 41.

So some of the per-frame second is inherent to booting a document, and some was
ours. Count requests before concluding a cost is a law of physics.

**Anything that paces work with `requestAnimationFrame` needs a timeout floor,
and the same goes for `IntersectionObserver`.** Neither fires at all while the
tab is hidden, and both the mount chain and the fit-on-open depended on rAF
alone. Measured in a background tab: 46 seconds,
zero frames mounted, `rafTicksIn600ms: 0` — and the canvas sitting at scale 1
because the fit never ran either. Both now race a timeout, so a canvas left
loading in another tab is loaded when you come back to it.

Measure against `pnpm preview`; `performance.memory` is process-wide across
same-origin frames and attributes nothing.

## Recording findings

A defect found while using the tool ends as a note in
`prototypes/component-audit/documents/`. Never only in a conversation.

**Report the cause, not the remedy.** This is an audit: it says what happens,
where to reproduce it, and what in the source produces it, and it stops there.
A report that arrives with fixes attached asks the reader to judge the problem
and the solution at once, and a rejected fix takes a real finding with it.

**Check the contract first.** `banhaten docs <component>` prints the prop table
and the RTL rules each component publishes. A defect stated against a documented
contract is a bug report; the same defect without one is an opinion about someone
else's design. Re-reading the registry changed six of the first twenty-one
entries here, in both directions, and stopped two wrong ones from being written.

That rule also applies before writing a component call, not only before recording
a defect — which is the moment it would have saved the most time. AGENTS.md
carries the build-time version, together with the cross-component traps
`banhaten docs` cannot warn about, because it documents one component at a time
and those traps only exist between them.

Record rejected hypotheses too. The reports document investigations that
concluded "not a bug" — those entries are what stop the next person spending an
hour on it, and they are why the report stays credible.
