/**
 * Guides you place yourself, and the arithmetic between them.
 *
 * The measurement happens inside the frame's own document, which is the only
 * place it can be honest. The canvas scales the `<iframe>` from outside and the
 * document inside never hears about it, so `getBoundingClientRect` here returns
 * the prototype's real CSS pixels at any zoom — no division, no rounding back
 * into a number that was never measured. A ruler drawn on the canvas would have
 * had to convert, and at a scale of 0.4 one pixel of mouse travel is 2.5 pixels
 * of answer.
 *
 * A guide is placed by hand but lands on a box, which is the difference between
 * this and a line dragged in a screenshot. Every edge and centre under the
 * cursor is a candidate, and the crosshair takes the nearest one within a few
 * pixels — so "down the middle of the button" is the button's actual middle,
 * not where the mouse happened to stop.
 *
 * Edges are named physically — `left` is the left of the viewport even in an
 * RTL frame, where it is the *end* of the text. That is deliberate: the numbers
 * come from `getBoundingClientRect`, which is physical, and renaming them
 * logically here would put a translation between the measurement and the report
 * that nobody could check. The report's heading already carries the direction,
 * so a reader knows which one `left` was.
 */

export type Axis = 'x' | 'y'

export type Edge = 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom'

export const EDGE_LABEL: Record<Edge, string> = {
  left: 'left',
  centerX: 'center-x',
  right: 'right',
  top: 'top',
  centerY: 'center-y',
  bottom: 'bottom',
}

const X_EDGES = ['left', 'centerX', 'right'] as const
const Y_EDGES = ['top', 'centerY', 'bottom'] as const

function coordinate(rect: DOMRect, edge: Edge): number {
  switch (edge) {
    case 'left':
      return rect.left
    case 'right':
      return rect.right
    case 'centerX':
      return rect.left + rect.width / 2
    case 'top':
      return rect.top
    case 'bottom':
      return rect.bottom
    case 'centerY':
      return rect.top + rect.height / 2
  }
}

/**
 * Rounded to a tenth, not to a whole pixel.
 *
 * `measure.ts` rounds its box to integers because sub-pixel noise is not
 * evidence of a size defect. Alignment is the opposite case: a half-pixel is
 * exactly the kind of miss that renders as a hairline seam on one screen and
 * nothing on another, and rounding it to zero would report two things flush
 * that a reader can see are not.
 */
export function round(value: number): number {
  return Math.round(value * 10) / 10
}

export function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`
}

/** The six lines a box can offer: its four edges and its two centres. */
export function edgesOf(rect: DOMRect): Array<{ axis: Axis; at: number; edge: Edge }> {
  return [
    ...X_EDGES.map((edge) => ({ axis: 'x' as const, at: coordinate(rect, edge), edge })),
    ...Y_EDGES.map((edge) => ({ axis: 'y' as const, at: coordinate(rect, edge), edge })),
  ]
}

export type Candidate = { axis: Axis; at: number; edge: Edge; element: Element }

/** How near the cursor has to be before a guide gives up its own position. */
const SNAP_RADIUS = 6

/**
 * Every edge worth snapping to at this point on the page.
 *
 * Taken from the elements under the cursor rather than from the whole document,
 * which is both faster and more correct: an edge somewhere off in the sidebar is
 * not what you meant by "the middle of this button", and offering it would make
 * the crosshair jump to lines that have nothing to do with what is under it.
 */
export function candidatesAt(x: number, y: number): Candidate[] {
  return document
    .elementsFromPoint(x, y)
    .slice(0, 8)
    .flatMap((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return []

      return edgesOf(rect).map(({ axis, at, edge }) => ({ axis, at, edge, element }))
    })
}

/**
 * The candidate the crosshair should lock onto, or null to stay where it is.
 *
 * Ties go to the innermost element, because `elementsFromPoint` returns the
 * stack from the top down and a button shares its edges with every wrapper
 * around it. Snapping to the outermost would report the layout's name for a
 * line the button drew.
 */
export function nearest(candidates: Candidate[], axis: Axis, at: number): Candidate | null {
  let best: Candidate | null = null
  let closest = Infinity

  for (const candidate of candidates) {
    if (candidate.axis !== axis) continue

    const distance = Math.abs(candidate.at - at)
    if (distance > SNAP_RADIUS) continue
    if (distance < closest) {
      closest = distance
      best = candidate
    }
  }

  return best
}

export type Guide = {
  id: number
  axis: Axis
  at: number
  /** What it snapped to when it was placed, e.g. `Button center-x`. Null if free. */
  origin: string | null
}

export type Span = { axis: Axis; from: number; to: number; distance: number }

/**
 * The distance between each guide and the next one on its axis.
 *
 * Consecutive rather than every pair: three guides make three pairs but only two
 * gaps, and the third number is the sum of the other two — arithmetic the reader
 * can do, presented as if it were a measurement.
 */
export function spansOf(guides: Guide[]): Span[] {
  const spans: Span[] = []

  for (const axis of ['x', 'y'] as const) {
    const line = guides
      .filter((guide) => guide.axis === axis)
      .map((guide) => guide.at)
      .sort((a, b) => a - b)

    for (let i = 1; i < line.length; i += 1) {
      spans.push({ axis, from: round(line[i - 1]), to: round(line[i]), distance: round(line[i] - line[i - 1]) })
    }
  }

  return spans
}

/** What the clipboard report carries: where the guides are, and what is between them. */
export type GuideReport = { guides: Guide[]; spans: Span[] }

export type Side = 'left' | 'right' | 'top' | 'bottom'

export type Gap = {
  side: Side
  distance: number
  /** Where the measured line starts and ends, along the axis it measures. */
  from: number
  to: number
  /** Where to draw it on the other axis — inside both boxes, so it reads as between them. */
  at: number
  /** The neighbour it measured to, or null when it measured to the container. */
  neighbour: Element | null
}

/**
 * The clear space on each side of a box.
 *
 * This is the other half of a ruler, and the half a guide cannot do. A guide
 * crosses the whole viewport on purpose — you place one to find out what else
 * lands on that line. A gap is the opposite question, and drawing it full-bleed
 * would be a lie about what was measured: the 12 pixels between two buttons are
 * between those two buttons, and a line carrying that number across the sidebar
 * claims a relationship with everything it passes through.
 *
 * Found by walking outward from each edge until something that is not the box
 * itself is in the way — not by looking at DOM siblings, which was the first
 * version and measured the wrong thing. Every button in the row was wrapped in
 * its own cell, so no button had a sibling at all and all four gaps fell back to
 * the container's padding: 6, reported with total confidence, where the answer
 * was 12. What is beside something on screen is a question about geometry, and
 * the DOM is under no obligation to agree with it.
 *
 * Ancestors are stepped over rather than counted. The container fills the space
 * between two buttons, so the first thing a ray leaving a button meets is always
 * its own parent — stopping there would measure every gap as zero.
 */

/** Far enough to cross a column gutter, near enough that nothing distant counts. */
const MAX_PROBE = 240

/**
 * Coarse on purpose. The step decides how many `elementFromPoint` calls a ray
 * costs, and that call is 0.063ms — at a 4px step, four rays that find nothing
 * are 260 calls and 16ms, a whole frame spent per mouse movement. Hovering
 * anything with space around it made the page stutter badly enough to look
 * hung.
 *
 * Precision is not lost with it, because the ray only has to *land inside* the
 * neighbour: the distance comes from that element's own rect, which is exact
 * wherever the ray happened to hit it. The only thing a coarse step can do is
 * step clean over something thinner than itself — a hairline divider — and
 * report the box behind it instead.
 */
const PROBE_STEP = 8

function probe(target: Element, rect: DOMRect, side: Side): Element | null {
  const midX = rect.left + rect.width / 2
  const midY = rect.top + rect.height / 2

  for (let step = 1; step <= MAX_PROBE; step += PROBE_STEP) {
    const x = side === 'left' ? rect.left - step : side === 'right' ? rect.right + step : midX
    const y = side === 'top' ? rect.top - step : side === 'bottom' ? rect.bottom + step : midY

    if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return null

    const found = document.elementFromPoint(x, y)
    if (!found) return null

    // Itself, anything inside it, and everything it sits inside are all "still
    // the same thing" as far as a gap is concerned.
    if (found === target || target.contains(found) || found.contains(target)) continue

    return outermostAt(found, target, side)
  }

  return null
}

/**
 * Climbs from whatever the ray hit to the box that actually owns that edge.
 *
 * A ray leaving a button to the left lands on the neighbouring button — or on
 * the wrapper around it, or on the label inside it, depending on what happens to
 * be topmost at that pixel. They share the edge; the outermost one is the thing
 * a person would say the gap is to.
 */
function outermostAt(found: Element, target: Element, side: Side): Element {
  const facing: Side = side === 'left' ? 'right' : side === 'right' ? 'left' : side === 'top' ? 'bottom' : 'top'
  let box = found

  while (box.parentElement && !box.parentElement.contains(target)) {
    const parent = box.parentElement
    if (Math.abs(parent.getBoundingClientRect()[facing] - box.getBoundingClientRect()[facing]) > 0.5) break
    box = parent
  }

  return box
}

const ALL_SIDES: Side[] = ['left', 'right', 'top', 'bottom']

export function gapsAround(element: Element, sides: Side[] = ALL_SIDES): Gap[] {
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return []

  const parent = element.parentElement
  if (!parent) return []

  const style = getComputedStyle(parent)
  const parentRect = parent.getBoundingClientRect()
  const inset = (side: Side) =>
    (parseFloat(style[`padding${cap(side)}` as 'paddingLeft']) || 0) +
    (parseFloat(style[`border${cap(side)}Width` as 'borderLeftWidth']) || 0)

  const inner = {
    left: parentRect.left + inset('left'),
    right: parentRect.right - inset('right'),
    top: parentRect.top + inset('top'),
    bottom: parentRect.bottom - inset('bottom'),
  }

  const gaps: Gap[] = []

  // Only the sides asked for. The overlay draws two of them at a time, and
  // computing the other two every frame is half the cost of the feature spent on
  // numbers nobody is looking at.
  for (const side of sides) {
    const horizontal = side === 'left' || side === 'right'
    const neighbour = probe(element, rect, side)
    const box = neighbour?.getBoundingClientRect() ?? null

    let from: number
    let to: number

    if (box) {
      if (side === 'left') [from, to] = [box.right, rect.left]
      else if (side === 'right') [from, to] = [rect.right, box.left]
      else if (side === 'top') [from, to] = [box.bottom, rect.top]
      else [from, to] = [rect.bottom, box.top]
    } else {
      if (side === 'left') [from, to] = [inner.left, rect.left]
      else if (side === 'right') [from, to] = [rect.right, inner.right]
      else if (side === 'top') [from, to] = [inner.top, rect.top]
      else [from, to] = [rect.bottom, inner.bottom]
    }

    // Drawn where both boxes exist, so the line reads as being between them.
    const at = box
      ? horizontal
        ? (Math.max(box.top, rect.top) + Math.min(box.bottom, rect.bottom)) / 2
        : (Math.max(box.left, rect.left) + Math.min(box.right, rect.right)) / 2
      : horizontal
        ? rect.top + rect.height / 2
        : rect.left + rect.width / 2

    const distance = round(to - from)

    // A negative gap is an overlap and a zero one is a shared edge; neither is a
    // measurement anyone placed a ruler to take.
    if (distance > 0.5) gaps.push({ side, distance, from, to, at, neighbour })
  }

  return gaps
}

function cap(side: Side): string {
  return side.charAt(0).toUpperCase() + side.slice(1)
}
