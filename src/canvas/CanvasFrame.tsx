import { useState } from 'react'
import { ExternalLink, Languages, Moon, Sun } from 'lucide-react'
import { appearanceToParams, describeAppearance } from '@/lib/appearance'
import { frameUrl } from '@/lib/projects'
import type { Appearance, Frame } from '@/lib/schema'

type CanvasFrameProps = {
  slug: string
  frame: Frame
  active: boolean
  onActivate: (id: string | null) => void
  /** False until this frame's turn in the progressive mount queue. */
  mounted: boolean
}

/**
 * One frame on the canvas: chrome rendered by the shell, content rendered
 * inside an iframe so its CSS, viewport, and crashes stay its own.
 *
 * Iframes swallow pointer events, which would stop the canvas panning whenever
 * the cursor crossed a frame. So a frame is inert until it is activated by a
 * click. Pan freely, then opt in to interaction.
 *
 * Which frame is active lives in the canvas, not here, so that Escape can
 * release it and only one frame is ever live at a time.
 *
 * Appearance is switched per frame rather than duplicated into one frame per
 * mode. Four frames of the same screen cost four seconds of boot and a lot of
 * canvas to say what a toggle says, and side-by-side comparison — the reason
 * they existed — now lives in <Compare> inside an audit document, where the two
 * versions can be stacked at the same x. canvas.json still declares the
 * appearance a frame opens in; the toggle only changes what you are looking at.
 */
export function CanvasFrame({ slug, frame, active, onActivate, mounted }: CanvasFrameProps) {
  const [appearance, setAppearance] = useState<Appearance>(frame.appearance)

  const url = frameUrl(slug, {
    type: frame.type,
    src: frame.src,
    sandbox: frame.sandbox,
    appearance: appearanceToParams(appearance),
  })

  // A document frame renders prose, not a design system — nothing to theme.
  const themeable = frame.type !== 'document'

  return (
    <div
      className="absolute flex flex-col gap-2"
      style={{ left: frame.x, top: frame.y, width: frame.width }}
    >
      <div className="flex items-baseline justify-between gap-3 px-1">
        <span className="truncate text-sm font-medium text-shell-ink">{frame.id}</span>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[11px] text-shell-muted">
            {describeAppearance(appearance)}
          </span>
          {themeable && (
            <>
              <AppearanceToggle
                label={appearance.mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
                onClick={() =>
                  setAppearance((current) => ({
                    ...current,
                    mode: current.mode === 'dark' ? 'light' : 'dark',
                  }))
                }
              >
                {appearance.mode === 'dark' ? (
                  <Sun className="size-3.5" aria-hidden />
                ) : (
                  <Moon className="size-3.5" aria-hidden />
                )}
              </AppearanceToggle>
              <AppearanceToggle
                label={appearance.dir === 'rtl' ? 'Switch to English (LTR)' : 'Switch to Arabic (RTL)'}
                active={appearance.dir === 'rtl'}
                onClick={() =>
                  setAppearance((current) => ({
                    ...current,
                    dir: current.dir === 'rtl' ? 'ltr' : 'rtl',
                  }))
                }
              >
                <Languages className="size-3.5" aria-hidden />
              </AppearanceToggle>
            </>
          )}
        </div>
      </div>

      <div
        className={`relative overflow-hidden rounded-lg border bg-white transition-colors ${
          active ? 'border-shell-accent' : 'border-shell-line'
        }`}
        style={{ height: frame.height }}
      >
        {mounted ? (
          <iframe
            src={url}
            title={frame.id}
            className="size-full border-0"
            style={{ pointerEvents: active ? 'auto' : 'none' }}
          />
        ) : (
          <div className="size-full animate-pulse bg-shell-bg" />
        )}

        {mounted && !active && (
          <button
            type="button"
            onClick={() => onActivate(frame.id)}
            aria-label={`Interact with ${frame.id}`}
            className="absolute inset-0 cursor-pointer bg-transparent"
          />
        )}

        {active && (
          <button
            type="button"
            onClick={() => onActivate(null)}
            className="absolute end-2 top-2 rounded border border-shell-line bg-shell-surface px-2 py-1 text-[11px] text-shell-muted shadow-sm hover:text-shell-ink"
          >
            Release · Esc
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

function AppearanceToggle({
  children,
  label,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded border px-1.5 py-1 transition-colors ${
        active
          ? 'border-shell-accent text-shell-accent'
          : 'border-shell-line text-shell-muted hover:text-shell-ink'
      }`}
    >
      {children}
    </button>
  )
}
