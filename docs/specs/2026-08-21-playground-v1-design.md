# Prototype Playground — v1 Design

**Status:** approved for implementation
**Date:** 2026-08-21
**Research basis:** [`docs/research/2026-08-21-sublime-design-studio-teardown.md`](../research/2026-08-21-sublime-design-studio-teardown.md)

---

## 1. Purpose

A local, file-driven environment for building interactive prototypes with the **Banhaten design system**, viewing them on a pan/zoom canvas, and producing actionable feedback for the design system's developer and designer.

Three jobs, in priority order:

1. **Stress-test** Banhaten components in realistic, dense compositions.
2. **Record findings** as artifacts a dev and a designer can act on.
3. **Present** design options and proposed fixes to a design lead.

### Non-goals for v1

Comment system · multi-user scoping · deployment · lo-fi mode · any authoring UI · a "tools" section · sidebar-based layouts.

---

## 2. Core principle: the UI is a rendering surface

The playground exposes **no authoring actions**. There is no editor, no drag-to-move, no properties panel, no save button.

Claude Code edits files. The browser renders them. Vite HMR closes the loop.

This is the single decision that keeps v1 small enough to finish, and it is validated by the reference implementation in the research doc.

---

## 3. Architecture

```
Dashboard  ──>  Project  ──>  Canvas  ──>  Frame  ──>  iframe  ──>  View
  (cards)      (folder)     (JSON)     (JSON entry)   (isolation)   (React)
```

### 3.1 Vocabulary

These terms are binding. They appear in `AGENTS.md` so Claude Code scaffolds consistently and never invents a parallel structure.

| Term | Definition |
| --- | --- |
| **Project** | A folder under `prototypes/`. Appears as one card on the dashboard. |
| **View** | One interactive React screen. A `.tsx` file. |
| **Document** | A markdown file rendered as a frame. Critiques, findings, notes. |
| **Canvas** | A JSON file that *points at* views and documents and positions them. It never imports them. |
| **Frame** | One entry in a canvas: a view or document, its position, its size, and its appearance config. |
| **Sandbox** | An installed copy of a design system. Frames declare which one they render against. |
| **Finding** | A recorded defect or observation about a design system component. |

### 3.2 File layout

```
prototypes/
  orders-dashboard/
    manifest.json          # name, description, cover frame
    canvas.json            # frames
    views/
      orders-table.tsx
    documents/
      findings.md

sandboxes/
  banhaten/                # PRISTINE. Never edited. `banhaten update` always safe.
    banhaten.config.json
    globals.css            # CLI-managed. Never hand-edited.
    frame.css              # ours: imports globals.css + registers @source
    components/ui/
    lib/
  banhaten-proposed/       # OUR FIXES. Same install, edited on purpose.
    banhaten.config.json   # `banhaten diff --cwd sandboxes/banhaten-proposed`
    globals.css
    frame.css
    components/ui/
    lib/

src/
  app/                     # dashboard + canvas shell
    app.css                # shell Tailwind entry — neutral, NOT Banhaten
  canvas/                  # pan/zoom viewport, frame chrome
  frame/
    main.tsx               # iframe entry point
    frame.html

docs/
  principles.md            # our design principles. Written in v1, USED in v2's
                           #   critique workflow. Not in v1's definition of done.
  research/
  specs/

AGENTS.md                  # vocabulary + rules for Claude Code
CLAUDE.md                  # points at AGENTS.md
```

### 3.3 Two Tailwind builds, deliberately isolated

Tailwind v4 auto-detects source files from each stylesheet's location upward. Left alone, the shell's CSS would generate Banhaten's classes and vice versa. Both entries therefore disable auto-detection and register sources explicitly.

```css
/* src/app/app.css — the shell */
@import "tailwindcss" source(none);

@source "../app";
@source "../canvas";

@theme {
  /* neutral shell tokens — deliberately unlike Banhaten */
}
```

```css
/* sandboxes/banhaten/frame.css — wraps the CLI-managed globals.css */
@import "./globals.css";

@source "./components";
@source "../../prototypes";
```

`globals.css` is generated and managed by the Banhaten CLI. We never edit it; `frame.css` is ours and adds the source registration. This keeps the pristine sandbox genuinely pristine.

**Each sandbox is its own npm project.** Verified by dry run:

```
$ npx banhaten init --cwd . --dry-run --json
would write banhaten.config.json
would write lib/utils.ts
would write app/globals.css
would update tsconfig.json        <-
would update package.json         <-
install: { command: "npm install", required: true }
```

`banhaten init --cwd` writes a `package.json` and `tsconfig.json` into that directory and requires an install there. Two sandboxes therefore mean two npm projects, wired together with a **pnpm workspace**:

```yaml
# pnpm-workspace.yaml
packages:
  - "."
  - "sandboxes/*"
```

Each sandbox keeps its own `banhaten.config.json`, which is what makes `banhaten diff --cwd sandboxes/banhaten-proposed` produce a meaningful proposal.

**Visual consequence:** the shell must not look like Banhaten. Neutral and quiet, so the boundary between "the tool" and "the design" is unmistakable to a reviewer.

---

## 4. Data structures

### 4.1 `manifest.json`

```json
{
  "name": "Orders Dashboard",
  "description": "Table + filter bar stress test for Banhaten.",
  "cover": "orders-ltr-light"
}
```

### 4.2 `canvas.json`

```json
{
  "sections": [
    {
      "title": "Baseline — LTR",
      "frames": [
        {
          "id": "orders-ltr-light",
          "type": "view",
          "src": "views/orders-table.tsx",
          "sandbox": "banhaten",
          "x": 0, "y": 0, "width": 1440, "height": 900,
          "appearance": { "mode": "light", "theme": "blue", "radius": "default", "dir": "ltr" },
          "caption": "Orders list — filter bar is the focus."
        }
      ]
    }
  ]
}
```

`appearance` maps one-to-one onto Banhaten's documented HTML attributes: `class="dark"`, `data-theme`, `data-radius`, `dir`.

### 4.3 Finding format (`documents/findings.md`)

```markdown
### F-001 · Table — row density breaks with avatar + badge
**Component:** table   **Severity:** major   **Modes:** all
**Repro:** frame `orders-dense-ltr`
**What breaks:** row height ignores the vertical rhythm token when a cell
contains both an avatar and a badge; rows grow ~4px inconsistently.
**Expected:** fixed row height; cell content truncates.
**Proposed fix:** `sandboxes/banhaten-proposed` — see `banhaten diff table`
```

Severity vocabulary: `major` · `minor` · `mixed` · `question`.

Every finding resolves to exactly one of two artifacts: a note, or a diff. Nothing lives only in a conversation.

---

## 5. Components

### 5.1 Dashboard (`src/app`)

Discovers projects with `import.meta.glob('/prototypes/*/manifest.json', { eager: true })`. Renders one card per project. No create/delete actions — Claude Code scaffolds projects.

### 5.2 Canvas viewport (`src/canvas`)

A single transformed layer, driven by `react-zoom-pan-pinch`.

- Drag empty canvas, or two-finger trackpad = pan.
- Ctrl/Cmd + wheel = zoom at cursor.
- Zoom clamped to `[0.05, 2]`.
- Frames absolutely positioned from `canvas.json`.
- Section titles and frame captions render as canvas chrome, outside the iframe.

**The transform layer is sized to the content bounding box**, computed from
`canvas.json`, not to the viewport. Without that the library has nothing real to
centre and both "fit" and centre-on-open are no-ops — you land in empty space
several thousand pixels from your frames. The canvas fits to content on open.

Pan and zoom are ephemeral by design; nothing persists.

**Exactly one frame is active at a time**, and that state lives in the canvas
rather than in each frame — see §5.3.

### 5.3 Frame

An `<iframe>` pointing at `/frame.html` with search params:

```
/frame.html?view=orders-dashboard/views/orders-table&sandbox=banhaten
           &mode=light&theme=blue&radius=default&dir=ltr
```

Every frame is therefore **shareable as a standalone URL**. This is a hard requirement — it is what makes deployment later a config change rather than a rewrite.

#### Activation, and why Escape needs a message

An iframe swallows pointer events, so a frame under the cursor would stop the
canvas panning. Frames are therefore inert (`pointer-events: none`) behind a
transparent overlay until clicked.

Releasing one is less obvious than it looks. Once a frame is activated the user
clicks inside it and keyboard focus moves **into the iframe document**, so the
canvas window stops receiving keydown events entirely — an Escape handler on the
canvas is dead exactly when it is needed.

The frame therefore forwards Escape to the canvas with `postMessage`, and the
canvas accepts it only from its own origin (`src/lib/frameMessages.ts`). The
canvas keeps its own Escape handler too, for when focus is outside a frame.

Which frame is active is held in the canvas, not in each frame, so that two
frames can never both be live.

### 5.4 Frame entry (`src/frame/main.tsx`)

1. Parse search params.
2. Apply appearance to `document.documentElement`: `classList.toggle('dark')`, `dataset.theme`, `dataset.radius`, `dir`, `lang`.
3. Load the sandbox stylesheet for the requested `sandbox`.
4. Resolve the view via `import.meta.glob('/prototypes/**/views/*.tsx')`.
5. Mount it inside `<DesignSystemProvider sandbox={sandbox}>` (see §5.6).

### 5.6 Design system resolution — the `useDS()` registry

**A static ESM import resolves at build time.** A view file cannot change where `Button` comes from based on a runtime search param. Per-frame sandbox switching — the side-by-side comparison that justifies the two-sandbox design — is therefore impossible with plain imports.

Views consume components through a registry instead:

```tsx
export function OrdersTable() {
  const { Table, Badge, Button } = useDS()
  return <Table>…</Table>
}
```

The provider builds the registry once per frame:

```ts
const modules = import.meta.glob('/sandboxes/*/components/ui/*.tsx', { eager: true })
// -> { banhaten: { Button, Table, … }, 'banhaten-proposed': { Button, Table, … } }
```

`DesignSystemProvider` reads `?sandbox=` and supplies the matching namespace.

**Trade-off, accepted:** views lose idiomatic imports and gain a hook. This is the price of rendering one view file against two design system versions on the same canvas.

**Failure mode:** a view requesting a component absent from the selected sandbox gets a clear error naming the component and the sandbox, contained by the frame's error boundary (§7).

### 5.5 Document frame

Markdown rendered inside the frame iframe with the shell's neutral styling, not Banhaten's — a critique document is playground chrome, not a prototype.

---

## 6. The first prototype: Orders Dashboard

Chosen to maximize component coverage and breakage, not for domain realism. No sidebar.

| Zone | Banhaten components |
| --- | --- |
| Header | `page-header`, `breadcrumbs`, `button` |
| Filter bar | `select`, `autocomplete`, `command`, `tag`, `popover`, `date-picker`, `segmented-control`, `toolbar` |
| Table | `table`, `checkbox`, `badge`, `avatar`, `menu`, `tooltip`, `skeleton` |
| Footer | `pagination`, `empty-state` |
| Actions | `button-group`, `modal`, `toast`, `slideout` |

### 6.1 Mock data requirements

Data is the test. Generic filler proves nothing. The dataset must include:

- **Bilingual strings.** Arabic and Latin customer names and addresses. Banhaten is Arabic-first; Arabic has different line height, character width, and no capitals. A table that survives `"John Smith"` can still break on `"محمد عبد الرحمن"`.
- Names short enough to leave whitespace and long enough to truncate.
- All five status values, to exercise the full badge color scale.
- Amounts with currency, right-aligned, exercising tabular figures.
- Both relative and absolute dates.
- At least one empty cell and one row with every optional field populated.

### 6.2 Baseline frame matrix

| Frame | Sandbox | Mode | Theme | Dir |
| --- | --- | --- | --- | --- |
| `orders-ltr-light` | banhaten | light | blue | ltr |
| `orders-ltr-dark` | banhaten | dark | blue | ltr |
| `orders-rtl-light` | banhaten | light | blue | rtl |
| `orders-sharp-brown` | banhaten | light | brown | ltr |

The RTL frame is the highest-value cell in this matrix. Dense tables with trailing action menus are where direction handling fails.

---

### 6.3 Technology choices

Verified against npm on 2026-08-21: versions, React 19 peer support, weekly downloads, and last publish date.

#### Dependencies to add

| Need | Package | Version | Why this one |
| --- | --- | --- | --- |
| Canvas pan/zoom | `react-zoom-pan-pinch` | 4.0.4 | 1.9M weekly, published this month. Ships `zoomToElement`, `KeepScale`, `MiniMap`, `Virtualize` — exactly our feature list. |
| Routing | `wouter` | 3.10.0 | ~2.6 kB for two routes. `react-router` v8 is far more machinery than a dashboard and a canvas need. |
| Markdown documents | `react-markdown` + `remark-gfm` | 10.1.0 | 27M weekly. Tables and task lists come from GFM, which findings documents use. |
| Mock data | `@faker-js/faker` | 10.6.0 | **Ships `locale/ar`** (verified in the tarball) alongside `locale/en`. Directly serves the bilingual requirement in §6.1. |
| Schema validation | `zod` | 4.4.3 | Validates `canvas.json` / `manifest.json` at load time so failures become error frames instead of thrown exceptions. |
| Tailwind build | `@tailwindcss/vite` | 4.3.3 | Official v4 Vite plugin. Required by Banhaten's peer dependency anyway. |
| Icons | `lucide-react` | 1.33.0 | Already arrives with Banhaten (42 of 68 components depend on it). Zero marginal cost to use it in the shell. |

#### Rejected, with reasons

| Package | Why not |
| --- | --- |
| `@xyflow/react` | A node-and-edge graph editor. We have frames, not graphs, and no edges at all. We would spend the project fighting its interaction model and its internal state. |
| `@use-gesture/react` | Last published 2024-03-21. Also a gesture primitive, not a canvas — we would still build everything on top. |
| Hand-rolled pan/zoom | A naive `translate` + `scale` layer is genuinely small. Zoom-at-cursor, trackpad pinch, bounds clamping, and zoom-to-frame are where it stops being small. Not worth rebuilding what is maintained and 1.9M-downloads proven. |
| `zustand` / `jotai` / `valtio` | See below. |

#### No global state library in v1 — on purpose

This deserves an explicit decision, because reaching for a store is the reflex.

Every piece of state in this app already has an owner:

| State | Lives in | Why not a store |
| --- | --- | --- |
| Which project is open | URL | Must be linkable. |
| Which canvas is open | URL | Must be linkable. |
| Frame appearance (mode/theme/radius/dir) | URL search params | Already a hard requirement in §5.3. |
| Pan and zoom | `react-zoom-pan-pinch` internals | Deliberately ephemeral. |
| Projects, canvases, views, documents | The filesystem, via `import.meta.glob` | The filesystem is the database. |
| Findings | Markdown files in git | Reviewable, diffable, permanent. |

Adding a store would create a **second source of truth beside the URL**, and the two would drift. The URL already has to be authoritative because every frame must open standalone.

Revisit only if v2 introduces genuinely cross-cutting ephemeral state. `zustand` is the pick if that day comes.

#### Vite multi-entry

Two HTML entry points, no extra package:

```js
build: {
  rollupOptions: {
    input: {
      main:  resolve(__dirname, 'index.html'),
      frame: resolve(__dirname, 'frame.html'),
    },
  },
}
```

#### Live iframes — measured, not assumed

Every frame is a full document with its own React runtime. The v1 plan assumed
the mitigation would be `IntersectionObserver`, mounting only frames in view.
Measurement said otherwise on both counts.

**What was measured** (production build, ten-frame canvas):

| | Before | After |
| --- | --- | --- |
| First contentful paint | 12,180 ms | **3,776 ms** |
| Load event | 13,885 ms | 3,473 ms |

DOMContentLoaded was already 651 ms. The screen simply stayed blank for twelve
seconds while ten documents booted in one commit.

**Two hypotheses were tested and rejected before the real one:**

1. *The design system registry is the cost.* It eagerly instantiated every
   component of both sandboxes in every frame. Making it lazy and per-sandbox
   shrank the chunk from 485 kB to 14 kB — and load time did not move. The
   change was kept because a frame paying for the other sandbox is waste
   regardless, but it was not the bottleneck.
2. *Banhaten's CSS and webfonts are the cost.* The `playground-smoke` canvas has
   no design system at all — plain HTML views, no tokens, no fonts — and still
   cost 995 ms per frame against 1,389 ms with it. The design system adds ~40%
   on top of a baseline that is simply the iframe.

**The real cost is the iframe itself**, and it is inherent to the isolation the
canvas is built on. It cannot be optimised away — only spread out.

**`IntersectionObserver` would not have helped**, because the canvas fits to
content on open, so every frame is in view. The fix is `useProgressiveMount`:
frames mount one per animation frame, so the canvas paints and pans immediately
and fills in behind you. Unmounted frames show their chrome and a placeholder,
so the layout never shifts.

Roughly one second per frame remains the ceiling. Revisit if a canvas ever needs
to hold dozens.

---

## 7. Error handling

| Failure | Behavior |
| --- | --- |
| `canvas.json` malformed | Canvas renders an error frame naming the file and the parse error. Other projects unaffected. |
| Frame references a missing view | That frame renders "View not found: `<path>`". Siblings still render. |
| Frame references an unknown sandbox | Frame renders "Unknown sandbox: `<name>`" listing available sandboxes. |
| View throws at runtime | Error boundary inside the frame iframe. The crash stays inside its own document; the canvas survives. |
| Project has no `manifest.json` | Folder is ignored, with a console warning. |

Failures are always **local to one frame**. A broken prototype must never take down the canvas — that is the whole point of the iframe.

---

## 8. Testing

Deliberately light. This is an internal tool whose real test is daily use.

- **Type checking** via `tsc -b` — the existing build script already runs it.
- **Schema validation** for `canvas.json` and `manifest.json` at load time, surfaced as error frames rather than thrown exceptions.
- **Manual verification** for v1: the baseline frame matrix in §6.2 renders, pans, and zooms; each frame opens standalone by URL; an intentionally broken view is contained to its own frame.

No unit test suite in v1. Revisit once the canvas primitives stop changing shape.

---

## 8.5 Delivery phases

Built and verified one phase at a time. The two corrections above are both Phase 2 concerns; Phase 1 does not touch them.

### Phase 1 — The shell
Vite multi-entry · isolated shell Tailwind build · `wouter` routing · dashboard discovery · canvas pan/zoom · frames as iframes · zod validation · error boundaries.

Ships with a **smoke-test project** whose views are plain HTML with no design system at all.

*Verified when:* pan and zoom work, four frames render, every frame opens standalone by URL, and a deliberately broken view is contained to its own frame.

### Phase 2 — The sandboxes
pnpm workspace · `banhaten init` into both sandboxes · the two isolated Tailwind builds · the `useDS()` registry · an appearance-probe view showing token swatches and the active config.

*Verified when:* one view file renders in four appearances, and the same view file renders against both sandboxes side by side.

### Phase 3 — Orders Dashboard
Bilingual faker data · the screen itself · `documents/findings.md`.

*Verified when:* §9 below is satisfied.

---

## 9. Definition of done for v1

1. Dashboard lists `orders-dashboard` as a card.
2. Opening it shows a canvas with the four baseline frames from §6.2.
3. Pan and zoom work.
4. All four frames are live and interactive — filters open, dropdowns work, rows select.
5. Every frame opens standalone by URL.
6. `documents/findings.md` renders as a frame on the canvas.
7. `AGENTS.md` documents the vocabulary well enough that Claude Code can scaffold a second project unassisted.
8. At least one real finding recorded from actually using the thing.

Item 8 is the one that matters. The tool is not done when it runs — it is done when it has already produced value.

### v1 status — 2026-08-22

All eight items verified. Items 1–6 were checked by driving the running app,
not by reading the code. Item 4 was verified inside the canvas, not only on a
standalone frame: activating a frame, applying the `paid` filter (24 rows → 5),
and selecting a row to raise the bulk-action bar.

Three shell defects were found during that verification and fixed:

1. The canvas opened into empty space — the transform layer was viewport-sized,
   so nothing could fit or centre it.
2. `Escape` did not release an active frame. It called `blur()`, which never
   touched the frame's own state.
3. Focus inside an iframe stopped the canvas hearing keyboard events at all,
   so no canvas-side Escape handler could have worked. Fixed with `postMessage`.

Item 7 is written and was followed while scaffolding two projects, but has not
been independently tested by scaffolding a project from `AGENTS.md` alone.
