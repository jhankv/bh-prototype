# Prototype Playground

A local environment for prototyping with the **Banhaten** design system, and for
producing evidence about it. It is scoped to Banhaten deliberately — see
[CLAUDE.md](CLAUDE.md) for why, and for the two files that would change if that
ever stopped being true.

A dashboard lists projects. Opening one shows a pan/zoom canvas of **live,
interactive prototypes** — not screenshots — each in its own iframe, so the same
view file can render simultaneously in LTR and RTL, and — when a second sandbox
is installed — against two versions of the design system side by side. Mode,
theme, radius and direction are switched per frame from its own toolbar.

You iterate with a coding agent. The interface only renders.

## Why

Design system defects are easy to feel and hard to prove. This tool exists to
make them visible next to each other, then turn them into something a team can
act on.

## The current audit

[`prototypes/component-audit/`](prototypes/component-audit/) is the working
project: eleven reproductions of real product screens, built on Banhaten 0.4.0,
driven until they break.

**Start at
[`documents/index.mdx`](prototypes/component-audit/documents/index.mdx).** It
explains how an entry is named, what `major` and `minor` mean, and why no entry
proposes a fix.

| Report | Covers |
| --- | --- |
| [Keyboard](prototypes/component-audit/documents/keyboard.mdx) | `toolbar`, `button-group` |
| [Direction](prototypes/component-audit/documents/direction.mdx) | `kbd`, `tooltip`, `Table`, `Breadcrumbs`, `PageHeader` |
| [Forms](prototypes/component-audit/documents/forms.mdx) | `input`, `badge`, `checkbox`, `progress`, `select`, `avatar`, `button`, `menu` |
| [Data](prototypes/component-audit/documents/data.mdx) | `Table`, `PageHeader`, `pagination` |
| [Method](prototypes/component-audit/documents/method.md) | How the findings were reached, and the ones we nearly got wrong |

Thirty-five entries: twenty-one confirmed, thirteen open questions, one that
narrows an earlier entry rather than adding to it. Every one names a frame you
can open and an appearance to open it in.

Read [Method](prototypes/component-audit/documents/method.md) if you only read
one. It records the investigations that concluded "not a bug", including the
several times a defect turned out to be our own composition — those are what
make the other thirty-five worth trusting.

## Getting started

```bash
pnpm install
pnpm dev
```

Open the dashboard, pick a project, and the canvas opens fitted to its content.

The canvas follows Figma's gestures: **hold space and drag to pan**, **Cmd/Ctrl +
scroll to zoom**, two-finger trackpad to pan. Click a frame to interact with it,
Escape to hand control back to the canvas — while a frame is active it owns your
keyboard, space included. Every frame also opens standalone by URL, from the
arrow beneath it.

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
- [`docs/specs/2026-08-21-playground-v1-design.md`](docs/specs/2026-08-21-playground-v1-design.md) — how it started. A build plan from August, kept as a record. The two files above are the current contract; read this one for history, not for how the tool works today.
