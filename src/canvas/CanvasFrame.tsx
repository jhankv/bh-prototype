import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { appearanceToParams, describeAppearance } from '@/lib/appearance'
import { frameUrl } from '@/lib/projects'
import type { Frame } from '@/lib/schema'

type CanvasFrameProps = {
  slug: string
  frame: Frame
}

/**
 * One frame on the canvas: chrome rendered by the shell, content rendered
 * inside an iframe so its CSS, viewport, and crashes stay its own.
 *
 * Iframes swallow pointer events, which would stop the canvas panning whenever
 * the cursor crossed a frame. So a frame is inert until it is activated by a
 * click, and Escape releases it. Pan freely, then opt in to interaction.
 */
export function CanvasFrame({ slug, frame }: CanvasFrameProps) {
  const [active, setActive] = useState(false)

  const url = frameUrl(slug, {
    type: frame.type,
    src: frame.src,
    sandbox: frame.sandbox,
    appearance: appearanceToParams(frame.appearance),
  })

  return (
    <div
      className="absolute flex flex-col gap-2"
      style={{ left: frame.x, top: frame.y, width: frame.width }}
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <span className="truncate text-sm font-medium text-shell-ink">{frame.id}</span>
        <span className="shrink-0 font-mono text-[11px] text-shell-muted">
          {describeAppearance(frame.appearance)}
        </span>
      </div>

      <div
        className={`relative overflow-hidden rounded-lg border bg-white transition-colors ${
          active ? 'border-shell-accent' : 'border-shell-line'
        }`}
        style={{ height: frame.height }}
      >
        <iframe
          src={url}
          title={frame.id}
          className="size-full border-0"
          style={{ pointerEvents: active ? 'auto' : 'none' }}
        />

        {!active && (
          <button
            type="button"
            onClick={() => setActive(true)}
            aria-label={`Interact with ${frame.id}`}
            className="absolute inset-0 cursor-pointer bg-transparent"
          />
        )}

        {active && (
          <button
            type="button"
            onClick={() => setActive(false)}
            className="absolute end-2 top-2 rounded border border-shell-line bg-shell-surface px-2 py-1 text-[11px] text-shell-muted shadow-sm hover:text-shell-ink"
          >
            Release
          </button>
        )}
      </div>

      <div className="flex items-start justify-between gap-3 px-1">
        <p className="text-xs leading-relaxed text-shell-muted">{frame.caption}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          title="Open this frame standalone"
          className="shrink-0 text-shell-muted hover:text-shell-accent"
        >
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>
    </div>
  )
}
