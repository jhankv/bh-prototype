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

/**
 * The three gaps are a hierarchy, and each roughly doubles the one below it —
 * 60, 160, 320. They used to be 60, 100, 140, which is arithmetic rather than a
 * hierarchy: steps of 40 between frames, rows and sections read as one texture,
 * and the board looked like a single crowded column.
 *
 * The horizontal gap stays tight ON PURPOSE. Frames side by side are a
 * comparison — the same view in ltr and rtl, or against a second sandbox — and
 * pushing them apart is pushing apart the thing you are trying to read together.
 * Vertical distance separates subjects; horizontal closeness joins them.
 */

/** Between frames in a row, which are a comparison and belong close. */
const FRAME_GAP = 60
/** Between rows in a section — a different cut of the same subject. */
const ROW_GAP = 160
/** Between sections — a different subject, with room for its title to belong to it. */
const SECTION_GAP = 320
/**
 * How far each label floats above the frames it names.
 *
 * They live here, beside the gaps, because they are the same measurement seen
 * from the other side: a title needs air, and the gap is where that air comes
 * from. Split across two files they drift — a bigger title silently eats into
 * the section above it, and nothing says so.
 */
export const SECTION_TITLE_OFFSET = 64
export const ROW_LABEL_OFFSET = 34

/** Headroom a LABELLED row reserves above itself, derived so the label always
 *  has clear air. Unlabelled rows reserve none, which is what keeps a plain
 *  one-row section flush under its section title. */
const ROW_LABEL_SPACE = ROW_LABEL_OFFSET + 14
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
