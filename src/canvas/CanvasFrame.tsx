import { useEffect, useMemo, useRef, useState } from 'react'
import { availableSandboxes } from '@/ds/registry'
import { appearanceToParams, describeAppearance } from '@/lib/appearance'
import { onFrameReady, pushAppearance } from '@/lib/frameMessages'
import { frameUrl } from '@/lib/projects'
import type { Appearance, Frame } from '@/lib/schema'
import { FrameToolbar } from './FrameToolbar'

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
 * canvas.json declares the appearance and sandbox a frame OPENS in; the toolbar
 * changes what you are looking at without changing the file. That asymmetry is
 * the point — the canvas is a saved starting position, not a settings panel.
 */
export function CanvasFrame({ slug, frame, active, onActivate, mounted }: CanvasFrameProps) {
  const [appearance, setAppearance] = useState<Appearance>(frame.appearance)
  const [sandbox, setSandbox] = useState(frame.sandbox)

  const iframe = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)

  // A document frame renders prose, not a design system — nothing to theme,
  // and no second version of prose to compare it against.
  const themeable = frame.type !== 'document' && frame.sandbox !== 'none'

  const sandboxes = useMemo(() => (themeable ? availableSandboxes() : []), [themeable])

  const urlFor = (forSandbox: string, forAppearance: Appearance) =>
    frameUrl(slug, {
      type: frame.type,
      src: frame.src,
      sandbox: forSandbox,
      appearance: appearanceToParams(forAppearance),
    })

  /**
   * Held as state rather than derived, so that changing mode or theme does NOT
   * rebuild it. Rebuilding would reload the document and throw away the state
   * you were in when you noticed something was wrong — which is usually the
   * whole reason you wanted to see it in another mode.
   *
   * Switching sandbox is the exception: a different design system is a
   * different stylesheet, and only a fresh document can load one. That URL is
   * rebuilt with the appearance you are looking at NOW, not the one the canvas
   * declared, so the replacement paints correctly on its first frame instead of
   * flashing the declared appearance and correcting itself afterwards.
   */
  const [iframeSrc, setIframeSrc] = useState(() => urlFor(frame.sandbox, frame.appearance))

  function switchSandbox(next: string) {
    setSandbox(next)
    setIframeSrc(urlFor(next, appearance))
  }

  /** What the toolbar's open-in-a-tab link hands you: exactly what you see now. */
  const standaloneUrl = urlFor(sandbox, appearance)

  useEffect(() => {
    pushAppearance(iframe.current?.contentWindow ?? null, appearance)
  }, [appearance])

  /**
   * A reloading frame cannot be sent anything until it is listening, and `load`
   * fires before React has mounted inside it. So the frame says when, and this
   * re-sends whatever the toolbar has changed since the URL was built.
   */
  useEffect(
    () =>
      onFrameReady(
        () => iframe.current?.contentWindow ?? null,
        () => pushAppearance(iframe.current?.contentWindow ?? null, appearance),
      ),
    [appearance],
  )

  return (
    <div
      className="absolute flex flex-col gap-2"
      style={{ left: frame.x, top: frame.y, width: frame.width }}
    >
      {/* Fixed height so the row does not collapse when the label gives way to
          the toolbar, which floats and must not push the frame down. */}
      <div className="relative h-5">
        {active ? (
          <FrameToolbar
            frameId={frame.id}
            appearance={appearance}
            onAppearance={setAppearance}
            sandbox={sandbox}
            sandboxes={sandboxes}
            onSandbox={switchSandbox}
            themeable={themeable}
            standaloneUrl={standaloneUrl}
            target={box}
            onRelease={() => onActivate(null)}
          />
        ) : (
          <div className="flex items-baseline justify-between gap-3 px-1">
            <span className="truncate text-sm font-medium text-shell-ink">{frame.id}</span>
            <span className="shrink-0 font-mono text-[11px] text-shell-muted">
              {describeAppearance(appearance)}
            </span>
          </div>
        )}
      </div>

      <div
        ref={box}
        className={`relative overflow-hidden rounded-lg border bg-white transition-colors ${
          active ? 'border-shell-accent' : 'border-shell-line'
        }`}
        style={{ height: frame.height }}
      >
        {mounted ? (
          <iframe
            ref={iframe}
            src={iframeSrc}
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
      </div>

      {frame.caption && (
        <p className="px-1 text-xs leading-relaxed text-shell-muted">{frame.caption}</p>
      )}
    </div>
  )
}
