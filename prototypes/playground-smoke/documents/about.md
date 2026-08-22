# Phase 1 — what this project verifies

This project has no design system. Its views are plain HTML with inline styles.
That is deliberate: Phase 1 proves the **shell**, not the components.

## Checks

| # | Check | Frame |
| --- | --- | --- |
| 1 | Dashboard discovers projects from the filesystem | — |
| 2 | Canvas pans and zooms | all |
| 3 | Appearance reaches the frame document | `appearance-probe-*` |
| 4 | Frames are live applications, not screenshots | `interaction` |
| 5 | A crashing view is contained by its own frame | `broken` |
| 6 | Documents render as frames | this one |
| 7 | Every frame opens standalone by URL | the arrow on each frame |

## Canvas controls

- **Trackpad two fingers** or **drag empty canvas** — pan
- **Ctrl / Cmd + wheel** — zoom
- **Click a frame** — activate it, then it takes your clicks
- **Release** — hand control back to the canvas

## Why frames are inert until clicked

An iframe swallows pointer events. Without the click-to-activate step, dragging
across a frame would stop the canvas panning. Pan freely, then opt in.
