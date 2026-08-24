import { useEffect, useRef, useState } from 'react'

/**
 * Renders one snippet against both sandboxes, side by side, inline in the prose
 * that makes the claim about it.
 *
 * Each side is its own nested iframe, and that is not incidental. A document
 * cannot simply import both sandboxes' stylesheets: they define the same
 * `--bh-*` custom properties and the same `ds-*` class names, so the second to
 * load would silently win and the comparison would be a lie. Producing a
 * convincing false finding is the worst thing this tool could do, so each side
 * gets a real document and loads exactly one design system — the same isolation
 * every canvas frame relies on.
 *
 * The snippet lives in `views/snippets/` rather than inline in the MDX for the
 * same reason: it has to cross a document boundary, and a URL can carry a path
 * where it cannot carry a closure.
 */

export type CompareProps = {
  /** Path relative to the project folder, e.g. `views/snippets/TabsClipping.tsx`. */
  src: string
  /**
   * The width the snippet is *laid out* at, before being scaled to fit the
   * column. It is a stated part of the evidence, not a styling choice: tab
   * clipping and text truncation are both functions of available width, so a
   * comparison that did not fix the viewport would not be reproducible.
   */
  viewport?: number
  height?: number
  /**
   * How far the figure escapes the prose column. Leave it alone.
   *
   * The default measures instead of guessing: a snippet that fits the text
   * column stays inside it, and one that does not breaks out by exactly the
   * width it needs and no further. Both failure modes are real — a component
   * squeezed into 330px cannot be examined, and a figure stretched past its own
   * snippet pads it with white space that reads like part of the component.
   *
   * The explicit values exist for the rare case where a figure should be
   * deliberately wider or narrower than its content warrants.
   */
  bleed?: 'auto' | 'prose' | 'wide' | 'full'
  /**
   * Rows by default, and not only because each side then gets the full figure
   * width instead of half.
   *
   * Almost every defect here is a difference in POSITION — a period that moved
   * to the front of a line, a label clipped at its start, a column that
   * truncates from the wrong end. Stacked, both versions begin at the same x,
   * so the difference is a broken vertical alignment and the eye finds it
   * without being told where to look. Side by side, each version starts at a
   * different x and the reader has to mentally translate one onto the other
   * before they can compare. That is why diff tools stack.
   *
   * `columns` is for a snippet tall enough that stacking would push the two
   * versions further apart than a glance can span.
   */
  layout?: 'columns' | 'rows'
  mode?: 'light' | 'dark'
  dir?: 'ltr' | 'rtl'
  theme?: string
  radius?: string
  /** Override the column headings when "Pristine / Proposed" is not the point. */
  labels?: string[]
  /**
   * Which sandboxes to render, in order. Defaults to both.
   *
   * An audit that proposes nothing has no second sandbox to compare against, and
   * a two-up figure whose halves are identical is worse than no figure: it reads
   * as evidence of sameness when it is really evidence of nothing. Passing one
   * sandbox turns the same machinery into a plain specimen — see `Specimen`.
   */
  sandboxes?: readonly string[]
}

const SANDBOXES = ['banhaten', 'banhaten-proposed'] as const
const DEFAULT_LABELS = ['Pristine', 'Proposed']

function frameSrc(
  project: string,
  { src, mode = 'light', dir = 'ltr', theme = 'blue', radius = 'default' }: CompareProps,
  sandbox: string,
): string {
  // Spelled out rather than routed through appearanceToParams, which omits
  // defaults. A Compare figure is evidence: it should keep rendering what the
  // prose says it renders even if a default changes underneath it.
  const params = new URLSearchParams({ project, src, sandbox, mode, theme, radius, dir })
  return `/frame.html?${params}`
}

/** Gutter kept between the figure and the window when it breaks out. */
const GUTTER = 48
/** Grid gap between the two sides, in px — must match the `gap-3` class below. */
const GAP = 12

export function Compare(props: CompareProps) {
  const {
    viewport = 720,
    height = 160,
    bleed = 'auto',
    layout = 'rows',
    sandboxes = SANDBOXES,
  } = props
  const labels = props.labels ?? (sandboxes.length === 1 ? [''] : DEFAULT_LABELS)
  // Compare only ever renders inside a frame, so the project is in the URL.
  const project = new URLSearchParams(window.location.search).get('project') ?? ''

  // Measured on the wrapper, which is always the width of the prose column: a
  // block element takes its width from its container, so the figure overflowing
  // it cannot feed back into the measurement.
  const wrapper = useRef<HTMLDivElement>(null)
  const [prose, setProse] = useState(0)
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth)

  useEffect(() => {
    const element = wrapper.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => setProse(entry.contentRect.width))
    observer.observe(element)

    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // What the figure would need to show every side at its own scale.
  const needed =
    layout === 'rows' ? viewport : viewport * sandboxes.length + GAP * (sandboxes.length - 1)
  const ceiling = Math.max(prose, windowWidth - GUTTER)

  const figureWidth =
    bleed === 'prose' ? prose
    : bleed === 'wide' ? Math.min(1120, ceiling)
    : bleed === 'full' ? ceiling
    // The figure is exactly as wide as the evidence, capped at the window: it
    // breaks out of the text column only when the snippet needs the room, and
    // never grows past the snippet, so there is no white margin inside the frame
    // for a reader to mistake for part of the component.
    : Math.min(needed, ceiling)

  const columnWidth =
    layout === 'rows'
      ? figureWidth
      : (figureWidth - GAP * (sandboxes.length - 1)) / sandboxes.length
  // Never scale up: a snippet enlarged past its own viewport would show spacing
  // and hairlines that nobody's browser will ever render.
  const scale = prose === 0 ? 0 : Math.min(1, columnWidth / viewport)

  return (
    <div ref={wrapper} className="not-prose w-full">
      <figure
        className="my-8 grid gap-3"
        style={{
          width: figureWidth || undefined,
          // Centres a block wider than its container without a transform, which
          // would otherwise become the containing block for anything fixed inside.
          marginInlineStart: figureWidth ? (prose - figureWidth) / 2 : undefined,
          gridTemplateColumns:
            layout === 'rows' ? '1fr' : `repeat(${sandboxes.length}, minmax(0, 1fr))`,
        }}
      >
      {sandboxes.map((sandbox, index) => (
        <div key={sandbox} className="min-w-0">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              {labels[index] ?? ''}
            </span>
            <span className="truncate font-mono text-[10px] text-neutral-400">{sandbox}</span>
          </div>
          {/* The box shrinks to the scaled snippet, not to the column. When the
              column is wider than the viewport the snippet was laid out at,
              scale is capped at 1 and the surplus would otherwise render as dead
              space that reads like part of the component. */}
          <div
            className="overflow-hidden rounded border border-neutral-200 bg-white dark:border-neutral-700"
            style={{ width: viewport * scale, height: height * scale }}
          >
            <iframe
              title={`${labels[index] || sandbox} — ${props.src}`}
              src={frameSrc(project, props, sandbox)}
              width={viewport}
              height={height}
              className="block border-0"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              loading="lazy"
            />
          </div>
        </div>
      ))}
      <figcaption className="font-mono text-[10px] text-neutral-400" style={{ gridColumn: '1 / -1' }}>
        {props.src} · laid out at {viewport}px, shown at {Math.round(scale * 100)}% ·{' '}
        {props.mode ?? 'light'} · {props.dir ?? 'ltr'}
      </figcaption>
      </figure>
    </div>
  )
}

/**
 * One snippet, one design system, inline in the prose that makes the claim.
 *
 * The audit reports defects and proposes nothing, so most figures have only one
 * thing to show. This is `Compare` with the second sandbox removed rather than a
 * separate implementation: the scaling, the bleed measurement and the nested
 * iframe all exist for the same reasons here.
 */
export function Specimen(props: Omit<CompareProps, 'sandboxes'>) {
  return <Compare {...props} sandboxes={['banhaten']} />
}
