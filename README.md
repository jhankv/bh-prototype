# Prototype Playground

A local environment for prototyping with a design system, and for producing
evidence about it.

A dashboard lists projects. Opening one shows a pan/zoom canvas of **live,
interactive prototypes** — not screenshots — each in its own iframe, so the same
view file can render simultaneously in light and dark, across brand themes, in
LTR and RTL, and against two versions of the design system side by side.

You iterate with a coding agent. The interface only renders.

## Why

Design system defects are easy to feel and hard to prove. This tool exists to
make them visible next to each other, then turn them into something a team can
act on: a note, or a diff.

The first canvas produced five findings, three fixed and demonstrated
side by side, and one hypothesis investigated and rejected. See
[`prototypes/design-system/documents/findings.md`](prototypes/design-system/documents/findings.md).

## Getting started

```bash
pnpm install
pnpm dev
```

Open the dashboard, pick a project, and the canvas opens. Drag empty canvas to
pan; Ctrl/Cmd + wheel to zoom. Click a frame to interact with it, Escape to hand
control back to the canvas. Every frame also opens standalone by URL — the arrow
under it.

## How it fits together

```
prototypes/<project>/     manifest.json, canvas.json, views/*.tsx, documents/*.md
sandboxes/<name>/         a source-installed design system
src/                      the shell (dashboard, canvas) and the frame renderer
docs/                     research and the v1 design spec
```

There is no backend, no database, and no authoring UI. The filesystem is the
database: add a folder under `prototypes/` and a card appears.

## Working on it

- [`AGENTS.md`](AGENTS.md) — the vocabulary and rules for authoring prototypes.
- [`CLAUDE.md`](CLAUDE.md) — commands and architecture for working on the tool.
- [`docs/specs/2026-08-21-playground-v1-design.md`](docs/specs/2026-08-21-playground-v1-design.md) — why it is built this way, including what was measured and what turned out to be wrong.
