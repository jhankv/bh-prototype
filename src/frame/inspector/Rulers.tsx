import { EDGE_LABEL, round, type Axis, type Candidate, type Gap, type Guide, type Span } from './align'

/**
 * What measure mode draws on top of the prototype.
 *
 * Two colours, and each one means one thing. Amber is the crosshair — where the
 * cursor is now, and gone the moment it moves. Violet is a guide you placed, and
 * it stays until you take it away. Keeping "live" and "kept" in different
 * colours is what lets a screen with six guides on it still be read: you can see
 * at a glance which line is the one you are steering.
 *
 * Every line spans the whole viewport rather than the element it came from. That
 * is the point of the tool — a guide down the middle of a button is only useful
 * because it also crosses everything else, and whether the heading above lands
 * on it is the question you placed it to answer.
 */

function Line({ axis, at, className }: { axis: Axis; at: number; className: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={
        axis === 'x'
          ? { left: at, top: 0, width: 1, height: '100%' }
          : { top: at, left: 0, height: 1, width: '100%' }
      }
    />
  )
}

function Tag({
  axis,
  at,
  offset,
  tone,
  children,
}: {
  axis: Axis
  at: number
  /** Distance along the line, so several tags on one line do not stack. */
  offset: number
  tone: 'live' | 'kept' | 'span'
  children: React.ReactNode
}) {
  const palette = {
    live: 'bg-amber-500 text-white',
    kept: 'bg-violet-600 text-white',
    span: 'bg-neutral-900 text-neutral-100',
  }[tone]

  return (
    <div
      className={`absolute rounded px-1 py-px font-mono text-[10px] leading-4 whitespace-nowrap shadow-sm tabular-nums ${palette}`}
      style={
        axis === 'x'
          ? { left: at + 3, top: offset }
          : { top: at + 3, left: offset, transform: 'translateX(-50%)' }
      }
    >
      {children}
    </div>
  )
}

/**
 * The guides you have placed, with what each one was snapped to.
 *
 * The origin is on the line rather than in a list somewhere, because a guide
 * whose name you have to go and look up is a guide you stop trusting after the
 * third one — and three is where this tool starts being worth using.
 */
export function Guides({ guides }: { guides: Guide[] }) {
  return (
    <>
      {guides.map((guide, order) => (
        <div key={guide.id}>
          <Line axis={guide.axis} at={guide.at} className="bg-violet-500" />
          <Tag
            axis={guide.axis}
            at={guide.at}
            // Stepped down the line so guides placed near each other stay legible.
            offset={guide.axis === 'x' ? 8 + (order % 6) * 18 : 60 + (order % 6) * 74}
            tone="kept"
          >
            {guide.origin ? `${round(guide.at)} · ${guide.origin}` : round(guide.at)}
          </Tag>
        </div>
      ))}
    </>
  )
}

/**
 * The distance between each guide and the next one on its axis.
 *
 * Drawn as a bar between the two lines rather than only listed, because "24"
 * beside a number line tells you nothing about which two of six guides it is
 * between.
 *
 * The bars ride at the crosshair rather than down the middle of the viewport,
 * which was the first version and read as a lie. Three guides on three button
 * centres put `121.9` and `122.9` halfway down the page, across a row of
 * completely different buttons — the numbers were right and every part of where
 * they sat said they were about something else. A measurement has to be drawn
 * where the thing it measures is.
 */
export function Spans({ spans, at }: { spans: Span[]; at: { x: number; y: number } | null }) {
  // With no crosshair — measure mode off, guides kept — the bars park high and
  // left rather than centred, where they overlap least of the page.
  const line = { x: at?.x ?? 40, y: at?.y ?? 40 }

  return (
    <>
      {spans.map((span) => {
        const middle = span.from + span.distance / 2
        const across = span.axis === 'x' ? line.y : line.x

        return (
          <div key={`${span.axis}-${span.from}-${span.to}`}>
            <div
              className="absolute bg-neutral-400"
              style={
                span.axis === 'x'
                  ? { left: span.from, top: across, width: span.distance, height: 1 }
                  : { top: span.from, left: across, height: span.distance, width: 1 }
              }
            />
            <div
              className="absolute rounded bg-neutral-900 px-1 py-px font-mono text-[10px] leading-4 text-neutral-100 shadow-sm tabular-nums"
              style={
                span.axis === 'x'
                  ? { left: middle, top: across, transform: 'translate(-50%, -50%)' }
                  : { top: middle, left: across, transform: 'translate(-50%, -50%)' }
              }
            >
              {span.distance}
            </div>
          </div>
        )
      })}
    </>
  )
}

export type Aim = {
  x: number
  y: number
  snapX: Candidate | null
  snapY: Candidate | null
  /**
   * The box the crosshair is sitting on, which is not the same as the element
   * under the cursor and the difference is not cosmetic.
   *
   * `describe` resolves upward to the nearest thing the sandbox index knows, and
   * a Banhaten button labels its inner text `button-label` — so pointing at the
   * middle of a 110×40 button reported `Button · 90×24`, the label's box, under a
   * crosshair snapped to the button's own centre. A ruler that names one box and
   * measures another is worse than one that says nothing.
   */
  element: Element | null
  /** The clear space on each side of that box, measured when the cursor moved. */
  gaps: Gap[]
}

/**
 * The crosshair, and the box it is currently locked to.
 *
 * A snapped axis draws a solid line and says what it caught. An unsnapped one is
 * still drawn, faintly, because a free line placed where you want it is a
 * legitimate guide — it just cannot promise it is on anything.
 *
 * Only the axis a click would actually leave is drawn. Showing the full cross
 * while placing one line would be showing a line that is about to not exist,
 * which is the same class of mistake as chrome disagreeing with the pixels: the
 * tool saying one thing and doing another.
 */
export function Crosshair({
  aim,
  name,
  axis,
}: {
  aim: Aim
  name: string | null
  axis: 'x' | 'y' | 'both'
}) {
  const rect = aim.element?.isConnected ? aim.element.getBoundingClientRect() : null

  return (
    <>
      {axis !== 'y' && (
        <>
          <Line axis="x" at={aim.x} className={aim.snapX ? 'bg-amber-500' : 'bg-amber-500/40'} />
          <Tag axis="x" at={aim.x} offset={Math.max(4, aim.y - 34)} tone="live">
            {aim.snapX ? `${round(aim.x)} · ${EDGE_LABEL[aim.snapX.edge]}` : round(aim.x)}
          </Tag>
        </>
      )}

      {axis !== 'x' && (
        <>
          <Line axis="y" at={aim.y} className={aim.snapY ? 'bg-amber-500' : 'bg-amber-500/40'} />
          <Tag axis="y" at={aim.y} offset={aim.x} tone="live">
            {aim.snapY ? `${round(aim.y)} · ${EDGE_LABEL[aim.snapY.edge]}` : round(aim.y)}
          </Tag>
        </>
      )}

      {/* PixelSnap's one indispensable readout: what is this box, and how big.
          Anchored above the box rather than beside the cursor, which is where it
          started and where it had to compete with the crosshair's own tag, the
          span chip and a gap label for the same forty pixels. On the box it is
          also where you are already looking. */}
      {rect && (
        <div
          className="absolute rounded bg-neutral-900 px-1.5 py-0.5 font-mono text-[10px] leading-4 whitespace-nowrap text-neutral-100 shadow-md tabular-nums"
          style={{ left: Math.max(4, rect.left), top: Math.max(4, rect.top - 20) }}
        >
          {name ?? 'box'} · {Math.round(rect.width)}×{Math.round(rect.height)}
        </div>
      )}
    </>
  )
}

/** The box the crosshair is locked to, so you can see what it caught. */
export function Locked({ element }: { element: Element }) {
  if (!element.isConnected) return null

  const rect = element.getBoundingClientRect()

  return (
    <div
      className="absolute rounded-[3px] outline-1 outline-offset-1 outline-amber-500/70"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
    />
  )
}

/**
 * The bounded measurement: how much clear space is on each side of a box.
 *
 * Drawn with a tick at each end rather than as a bare line, and the ticks are
 * not decoration — they are what says the measurement stops there. A plain
 * segment between two cards reads as a guide that happens to be short, and the
 * whole reason this exists beside the guides is that the two mean opposite
 * things about where they end.
 *
 * Rose rather than amber or violet, because it is neither the crosshair nor a
 * guide: it appears and vanishes with the box under the cursor, and belongs to
 * the box, not to the screen.
 */
export function Distances({ gaps, axis }: { gaps: Gap[]; axis: 'x' | 'y' | 'both' }) {
  /**
   * Only the gaps on the axis being measured.
   *
   * All four at once was the first version and it put four numbers around every
   * box you passed over, of which two were always about something you were not
   * asking. Placing a vertical guide is a question about horizontal room; the
   * distance to the section heading above is a different question, and it can
   * wait for the key that asks it.
   */
  const shown = gaps.filter((gap) => {
    const horizontal = gap.side === 'left' || gap.side === 'right'
    return axis === 'both' || (axis === 'x') === horizontal
  })

  return (
    <>
      {shown.map((gap) => {
        const horizontal = gap.side === 'left' || gap.side === 'right'
        const middle = gap.from + gap.distance / 2

        return (
          <div key={gap.side}>
            <div
              className="absolute bg-rose-500"
              style={
                horizontal
                  ? { left: gap.from, top: gap.at, width: gap.distance, height: 1 }
                  : { top: gap.from, left: gap.at, height: gap.distance, width: 1 }
              }
            />

            {[gap.from, gap.to].map((end) => (
              <div
                key={end}
                className="absolute bg-rose-500"
                style={
                  horizontal
                    ? { left: end, top: gap.at - TICK / 2, width: 1, height: TICK }
                    : { top: end, left: gap.at - TICK / 2, height: 1, width: TICK }
                }
              />
            ))}

            {/* Off the line rather than centred on it: a chip sitting on a 12px
                measurement covers the measurement. */}
            <div
              className="absolute rounded bg-rose-600 px-1 py-px font-mono text-[10px] leading-4 whitespace-nowrap text-white shadow-sm tabular-nums"
              style={
                horizontal
                  ? { left: middle, top: gap.at + 6, transform: 'translateX(-50%)' }
                  : { top: middle, left: gap.at + 6, transform: 'translateY(-50%)' }
              }
            >
              {gap.distance}
            </div>
          </div>
        )
      })}
    </>
  )
}

/** Long enough to read as a stop, short enough not to look like a second line. */
const TICK = 9
