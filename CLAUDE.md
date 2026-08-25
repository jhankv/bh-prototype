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

**Scanning scope is not isolation.** `src/shell.css` scans only `src/`, which
keeps shell *utilities* out of a view — but the frame imports that stylesheet for
its own chrome, so any **global selector** in it lands in the frame's document
too. A bare `body { font-family; color; background-color }` did exactly that: it
beat Banhaten's `html { font-family: Inter }` for everything that inherits, and
painted a light frame's body in the shell's dark palette. Global selectors in
`shell.css` must say which document they mean.

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

The cost is the iframe itself. `IntersectionObserver` — the mitigation originally
planned — would not have helped, because the canvas fits to content on open and
every frame is already in view. `src/canvas/useProgressiveMount.ts` mounts one
frame per animation frame instead: first paint 12.2 s → 3.8 s.

Roughly one second per frame is the ceiling. Measure against `pnpm preview`;
`performance.memory` is process-wide across same-origin frames and attributes
nothing.

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
