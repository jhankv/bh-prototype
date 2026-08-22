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
   * How far the figure escapes the prose column. Prose is ~672px wide, which is
   * right for reading and wrong for evidence: split into two columns it leaves
   * each side around 330px, where a page header renders at 45% and nobody can
   * see what they are being asked to look at.
   *
   * `wide` is the default because most components are wider than a paragraph.
   * Reach for `prose` only when the snippet really is small — a badge, an input.
   */
  bleed?: 'prose' | 'wide' | 'full'
  /**
   * `rows` stacks pristine above proposed at full figure width. For anything
   * approaching a real screen, two half-width columns are worse than two
   * full-width rows, even though the eye has to travel further.
   */
  layout?: 'columns' | 'rows'
  mode?: 'light' | 'dark'
  dir?: 'ltr' | 'rtl'
  theme?: string
  radius?: string
  /** Override the column headings when "Pristine / Proposed" is not the point. */
  labels?: [string, string]
}

const SANDBOXES = ['banhaten', 'banhaten-proposed'] as const

function frameSrc(
  project: string,
  { src, mode = 'light', dir = 'ltr', theme = 'blue', radius = 'default' }: CompareProps,
  sandbox: string,
): string {
  const params = new URLSearchParams({ project, type: 'view', src, sandbox, mode, theme, radius, dir })
  return `/frame.html?${params}`
}

/** Width of the figure itself, before it is split into columns. */
const BLEED: Record<NonNullable<CompareProps['bleed']>, string> = {
  prose: '100%',
  wide: 'min(1120px, 100vw - 3rem)',
  full: 'calc(100vw - 3rem)',
}

export function Compare(props: CompareProps) {
  const {
    viewport = 720,
    height = 160,
    labels = ['Pristine', 'Proposed'],
    bleed = 'wide',
    layout = 'columns',
  } = props
  // Compare only ever renders inside a frame, so the project is in the URL.
  const project = new URLSearchParams(window.location.search).get('project') ?? ''

  const column = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const element = column.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      // Never scale up: a snippet enlarged past its own viewport would show
      // spacing and hairlines that nobody's browser will ever render.
      setScale(Math.min(1, entry.contentRect.width / viewport))
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [viewport])

  const width = BLEED[bleed]

  return (
    <figure
      className="not-prose my-8 grid gap-3"
      style={{
        width,
        // Centres a block wider than its container without a transform, which
        // would otherwise become the containing block for anything fixed inside.
        marginInlineStart: `calc(50% - ${width} / 2)`,
        gridTemplateColumns: layout === 'rows' ? '1fr' : 'repeat(2, minmax(0, 1fr))',
      }}
    >
      {SANDBOXES.map((sandbox, index) => (
        <div key={sandbox} className="min-w-0" ref={index === 0 ? column : undefined}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              {labels[index]}
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
              title={`${labels[index]} — ${props.src}`}
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
  )
}
