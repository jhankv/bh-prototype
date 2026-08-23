import { useEffect, useMemo, useRef, useState } from 'react'
import { availableSandboxes } from '@/ds/registry'
import { appearanceToParams, describeAppearance } from '@/lib/appearance'
import { onFrameReady, pushAppearance } from '@/lib/frameMessages'
import { frameUrl } from '@/lib/projects'
import { isDocument, type Appearance, type Frame } from '@/lib/schema'
import { FrameToolbar } from './FrameToolbar'
import { useCanvasScale } from './useCanvasScale'

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
  const themeable = !isDocument(frame.src) && frame.sandbox !== 'none'

  const sandboxes = useMemo(() => (themeable ? availableSandboxes() : []), [themeable])

  const select = useClickWithoutDrag(() => onActivate(frame.id))

  const urlFor = (forSandbox: string, forAppearance: Appearance) =>
    frameUrl(slug, {
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

  /**
   * Hand the frame the keyboard as soon as it is activated, rather than waiting
   * for a click to land inside it.
   *
   * Activating is a click on an overlay in THIS document, so without this the
   * frame is interactive but not focused: Escape does not release it until you
   * have clicked something inside, because the forwarder listens in there.
   *
   * It may also be why scrolling a freshly selected frame sometimes does
   * nothing until you click inside it — the overlay unmounts under a stationary
   * cursor, and a browser re-hit-tests on the next pointer move, not on the DOM
   * change. That part is a hypothesis: it could not be reproduced here, because
   * the automation used to drive this app emits no wheel events at all.
   */
  useEffect(() => {
    if (active) iframe.current?.contentWindow?.focus()
  }, [active])

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
      // Marks everything that belongs to this frame, chrome included, so the
      // canvas can tell a click that lands on a frame from one that lands on
      // nothing without every child having to stop the event itself.
      data-frame=""
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
          // The name selects the frame, as it does in Figma. It is often the
          // only part of a frame you can reach: at low zoom the frame itself is
          // a postage stamp, and its label is drawn at canvas scale beside it.
          <button
            type="button"
            {...select}
            title={`Select ${frame.id}`}
            className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-1 text-start"
          >
            <span className="truncate text-sm font-medium text-shell-ink">{frame.id}</span>
            <span className="shrink-0 font-mono text-[11px] text-shell-muted">
              {describeAppearance(appearance)}
            </span>
          </button>
        )}
      </div>

      <div
        ref={box}
        // Lets a keyboard shortcut in the canvas find this frame's box without
        // the canvas having to keep a ref to every frame it renders.
        data-frame-box={frame.id}
        className="relative overflow-hidden rounded-lg border border-shell-line bg-white"
        style={{ height: frame.height }}
      >
        {mounted ? (
          /**
           * `pointer-events` is deliberately NOT toggled here, and the overlay
           * below does the blocking instead.
           *
           * Flipping it on the iframe made a freshly selected frame ignore the
           * wheel until something inside it was clicked. Measured: the event
           * reached the frame's document, nothing called preventDefault, and
           * the page still did not move — while the arrow keys scrolled it
           * fine. Keyboard scrolling is resolved on the main thread; wheel
           * scrolling is resolved by the compositor against its own map of
           * which regions scroll, and that map is built when the page paints.
           * Turning `pointer-events` back on told the main thread immediately
           * and left the compositor believing the region was still inert. A
           * click forced it to rebuild, which is why clicking inside "fixed" it.
           *
           * An overlay in this document sits above the iframe and takes the
           * events while the frame is inactive, so nothing about the iframe
           * itself ever has to change.
           */
          <iframe ref={iframe} src={iframeSrc} title={frame.id} className="size-full border-0" />
        ) : (
          <div className="size-full animate-pulse bg-shell-bg" />
        )}

        {mounted && !active && (
          <button
            type="button"
            {...select}
            aria-label={`Interact with ${frame.id}`}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          />
        )}

        {active && <SelectionRing />}
      </div>

      {frame.caption && (
        <p className="px-1 text-xs leading-relaxed text-shell-muted">{frame.caption}</p>
      )}
    </div>
  )
}

/** How far the pointer may travel between press and release and still be a click. */
const DRAG_SLOP = 4

/**
 * A drag is not a click.
 *
 * A button fires `click` whenever the press and the release both land on it,
 * however far the pointer travelled in between — so panning the canvas across a
 * frame selected that frame when the drag ended. Measured in screen pixels
 * rather than canvas ones, because the threshold is about what the hand did,
 * not about how far the content happened to move underneath it.
 */
function useClickWithoutDrag(onSelect: () => void) {
  const pressedAt = useRef<{ x: number; y: number } | null>(null)

  return {
    onPointerDown(event: React.PointerEvent) {
      pressedAt.current = { x: event.clientX, y: event.clientY }
    },
    onClick(event: React.MouseEvent) {
      const from = pressedAt.current
      pressedAt.current = null

      if (from && Math.hypot(event.clientX - from.x, event.clientY - from.y) > DRAG_SLOP) return

      onSelect()
    },
  }
}

/**
 * The blue ring on the selected frame, drawn at a constant thickness on screen.
 *
 * A plain border would not do. It lives inside the transformed layer, so a 1px
 * border is 1px only at 100%: at the zoom a ten-frame canvas opens at it is
 * under half a pixel, and the one thing the ring has to say — *this* is the
 * frame you are about to change — is exactly what it stops saying when you zoom
 * out far enough to need it. Dividing by the scale keeps it two real pixels
 * everywhere, which is what Figma draws and why its selection never thins out.
 *
 * Its own component so that subscribing to the zoom re-renders four lines of
 * chrome rather than every frame on the canvas, and `inset` so the box's own
 * `overflow-hidden` cannot clip it.
 */
function SelectionRing() {
  const scale = useCanvasScale()

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 rounded-lg"
      style={{ boxShadow: `inset 0 0 0 ${2 / scale}px var(--color-shell-accent)` }}
    />
  )
}
