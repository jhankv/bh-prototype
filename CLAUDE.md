# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A local prototyping environment **for the Banhaten design system**. A dashboard
lists projects; opening one shows a pan/zoom canvas of **live, interactive React
prototypes** built with a source-installed copy of Banhaten, rendered across
appearance modes and against two versions of it at once.

Its purpose is not to look nice. It is to **stress Banhaten components and
produce actionable defect reports** — see `prototypes/*/documents/findings.md`.

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

Design rationale lives in [`docs/specs/2026-08-21-playground-v1-design.md`](docs/specs/2026-08-21-playground-v1-design.md).

## Commands

```bash
pnpm dev              # Vite dev server
pnpm build            # tsc -b && vite build
pnpm lint             # eslint . — must stay at zero
pnpm preview          # serve dist/, the only honest place to measure performance

npx tsc -p tsconfig.app.json --noEmit   # typecheck alone, faster than a build
```

There is no test suite. This is an internal tool whose real test is daily use;
`tsc -b`, `eslint`, and driving the running app are the checks. See §8 of the
spec. **Verify UI behaviour by driving the app, not by reading the code** — the
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

**3. Frames are inert until clicked.** An iframe swallows pointer events, so a
frame under the cursor would stop the canvas panning. Releasing one needs a
message, not a keyboard handler: once a frame is used, focus lives **inside** the
iframe and the canvas window receives no keydown at all. `src/lib/frameMessages.ts`
forwards Escape by origin-checked `postMessage`.

### Two design systems, side by side

`sandboxes/banhaten/` is **pristine** and never hand-edited, so `banhaten update`
is always safe and demos show honest current behaviour. `sandboxes/banhaten-proposed/`
holds our fixes; `npx banhaten diff --cwd sandboxes/banhaten-proposed` is the
proposal sent upstream. A frame declares which one it renders against, so the
same view file appears twice on one canvas — today's behaviour beside the fix.

Sandboxes are pnpm workspace packages because `banhaten init --cwd` writes a
`package.json` and `tsconfig.json` into each directory. They are vendor code and
are excluded from ESLint: linting them invites an agent to "fix" generated files,
which breaks `banhaten update` and pollutes the proposal diff.

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

A defect found while using the tool ends as exactly one of two artifacts: a note
in `prototypes/*/documents/findings.md`, or a diff in `banhaten-proposed`. Never
only in a conversation.

Record rejected hypotheses too. `findings.md` documents one investigation that
concluded "not a bug" — that entry is what stops the next person spending an hour
on it, and it is why the report stays credible.
