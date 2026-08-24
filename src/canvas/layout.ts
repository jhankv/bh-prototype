import type { Canvas, Frame } from '@/lib/schema'

/**
 * Where every frame goes, computed from how the canvas is grouped.
 *
 * canvas.json used to carry an `x` and a `y` per frame, and every one of them
 * was a running sum the author worked out by hand. They drifted: two sections
 * were once written with the same `y` and drew on top of each other, silently,
 * because the canvas is data and the shell renders exactly what it is given.
 * The rule that replaced it — "recompute every y when you add a section" — was
 * a paragraph in AGENTS.md asking a human to be a calculator.
 *
 * So the grouping IS the layout. Sections stack, rows stack inside them, frames
 * run left to right inside a row, and nothing positional is authored at all.
 * `width` and `height` stay in the file because those are not layout: they are
 * the viewport a frame opens at, and a dialog wants a different one from a
 * table browser.
 */

/** Between frames in a row. */
const FRAME_GAP = 60
/** Between rows in a section. */
const ROW_GAP = 100
/** Between sections, wide enough that the next section's title reads as its own. */
const SECTION_GAP = 140
/** Headroom a LABELLED row reserves above itself. Unlabelled rows reserve none,
 *  which is what keeps a plain one-row section flush under its section title. */
const ROW_LABEL_SPACE = 28
/** Breathing room past the last frame, so the board can be panned off its edge. */
const PADDING = 120

export type PlacedFrame = Frame & { x: number; y: number }
export type PlacedRow = { label?: string; frames: PlacedFrame[]; x: number; y: number }
export type PlacedSection = { title: string; rows: PlacedRow[]; x: number; y: number }
export type Layout = {
  sections: PlacedSection[]
  /** The content box the pan/zoom layer scrolls over. */
  width: number
  height: number
}

export function layout(canvas: Canvas): Layout {
  const sections: PlacedSection[] = []
  let cursor = 0

  for (const section of canvas.sections) {
    const rows: PlacedRow[] = []
    const top = cursor
    let bottom = cursor

    for (const row of section.rows) {
      if (row.frames.length === 0) continue

      const y = (rows.length === 0 ? top : bottom + ROW_GAP) + (row.label ? ROW_LABEL_SPACE : 0)

      let x = 0
      const frames: PlacedFrame[] = []
      for (const frame of row.frames) {
        frames.push({ ...frame, x, y })
        x += frame.width + FRAME_GAP
      }

      rows.push({ label: row.label, frames, x: 0, y })
      bottom = y + Math.max(...row.frames.map((frame) => frame.height))
    }

    if (rows.length === 0) continue

    sections.push({ title: section.title, rows, x: 0, y: top })
    cursor = bottom + SECTION_GAP
  }

  const frames = sections.flatMap((section) => section.rows.flatMap((row) => row.frames))

  return {
    sections,
    width: Math.max(0, ...frames.map((frame) => frame.x + frame.width)) + PADDING,
    height: Math.max(0, ...frames.map((frame) => frame.y + frame.height)) + PADDING,
  }
}
