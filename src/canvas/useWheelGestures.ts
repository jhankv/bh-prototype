import { useEffect, useRef } from 'react'
import { useControls, useTransformContext } from 'react-zoom-pan-pinch'

/**
 * One owner for the wheel: scroll pans, modifier-scroll zooms.
 *
 * Zoom is ours because the library's is additive — `scale + delta * step`, with
 * `smooth` multiplying the step by |deltaY|. Two consequences, both measured on
 * this canvas: one mouse tick (deltaY 100) crossed the entire 0.05–2 range at
 * once, and a fixed increment is +50% at scale 0.2 but +5% at scale 1.9, so
 * zooming felt ten times faster at one end than the other. Perceived zoom is
 * geometric, so the step has to be a ratio.
 *
 * Panning is ours for a different reason. The library does have trackpad
 * panning, but it refuses to run whenever its own wheel zoom is eligible, and
 * it opts out on `ctrlKey` while knowing nothing about `metaKey` — so on a Mac,
 * ⌘+scroll would zoom here and pan there at the same time. Two handlers
 * negotiating over one event through undocumented internals is a bug waiting
 * for a version bump. One handler that reads the modifier and branches cannot
 * disagree with itself.
 */
const SENSITIVITY = 0.0015

/** Two wheel events further apart than this belong to different gestures. */
const GESTURE_GAP_MS = 200

/** Firefox reports deltas in lines, and page-scroll keys in pages. */
const LINE_HEIGHT = 16
const PAGE_HEIGHT = 800

type Transform = { x: number; y: number; scale: number }

/**
 * The live frame's window, but only if the cursor is inside it.
 *
 * Tested by coordinates rather than by `event.target`, deliberately. The whole
 * reason a wheel meant for a frame can arrive here is that the browser resolved
 * the wrong target — asking that same target where the pointer is would inherit
 * the mistake. A rectangle does not go stale.
 */
function liveFrameUnder(activeFrameId: string | null, x: number, y: number): Window | null {
  if (!activeFrameId) return null

  const box = document.querySelector(`[data-frame-box="${CSS.escape(activeFrameId)}"]`)
  if (!box) return null

  const rect = box.getBoundingClientRect()
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null

  return box.querySelector('iframe')?.contentWindow ?? null
}

export function useWheelGestures(
  minScale: number,
  maxScale: number,
  activeFrameId: string | null,
): void {
  const { setTransform } = useControls()
  const context = useTransformContext()

  /**
   * The library's state lags a frame behind, so two wheel events in quick
   * succession both read the pre-first-event transform and compute the same
   * target — one tick of the gesture is silently dropped. That is barely
   * visible while zooming and unusable while panning, where a trackpad fires
   * dozens of events a second. Within a gesture we track the transform
   * ourselves; between gestures we re-read the library, since dragging, fit and
   * the zoom buttons all move it.
   */
  const gesture = useRef<{ at: number; transform: Transform } | null>(null)

  useEffect(() => {
    const element = context.wrapperComponent
    if (!element) return

    function onWheel(event: WheelEvent) {
      // Not passive: otherwise the browser scrolls or zooms the whole page.
      event.preventDefault()

      /**
       * A wheel over the live frame should scroll that frame, and normally the
       * browser sends it straight there without this listener ever seeing it.
       * When it does arrive here instead, the frame has been robbed of a scroll
       * it should have had — so hand it over rather than panning the canvas
       * underneath a prototype the user is plainly reading.
       *
       * Reported as: select a frame, scroll, nothing moves; click any text
       * inside it and scrolling works from then on. A click is what makes a
       * browser resolve the pointer's target again, which is the tell.
       *
       * Modifier-scroll is not forwarded: zoom belongs to the canvas wherever
       * the cursor happens to be.
       */
      if (!event.ctrlKey && !event.metaKey) {
        const frame = liveFrameUnder(activeFrameId, event.clientX, event.clientY)

        if (frame) {
          frame.scrollBy({
            left: toPixels(event.deltaX, event.deltaMode),
            top: toPixels(event.deltaY, event.deltaMode),
          })
          return
        }
      }

      const now = event.timeStamp
      const continuing = gesture.current && now - gesture.current.at < GESTURE_GAP_MS

      const from: Transform = continuing
        ? gesture.current!.transform
        : {
            x: context.state.positionX,
            y: context.state.positionY,
            scale: context.state.scale,
          }

      // Trackpad pinch arrives as a wheel event with ctrlKey set, so reading the
      // modifier covers the pinch and the keyboard shortcut in one branch.
      const next =
        event.ctrlKey || event.metaKey
          ? zoomAt(from, event, element!, minScale, maxScale)
          : panBy(from, event)

      gesture.current = { at: now, transform: next }

      if (next.x === from.x && next.y === from.y && next.scale === from.scale) return

      setTransform(next.x, next.y, next.scale, 0)
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [activeFrameId, context, maxScale, minScale, setTransform])
}

/**
 * The transform is `translate(x, y) scale(s)`, so the translation is already in
 * screen pixels and the delta needs no correction for zoom. Content under the
 * cursor keeps pace with the fingers at every scale.
 */
function panBy(from: Transform, event: WheelEvent): Transform {
  let x = toPixels(event.deltaX, event.deltaMode)
  let y = toPixels(event.deltaY, event.deltaMode)

  // A mouse wheel has no horizontal axis, and Shift is the universal stand-in.
  // Some browsers do the swap before we see it, so only do it if they have not.
  if (event.shiftKey && x === 0) {
    x = y
    y = 0
  }

  return { ...from, x: from.x - x, y: from.y - y }
}

function zoomAt(
  from: Transform,
  event: WheelEvent,
  element: HTMLElement,
  minScale: number,
  maxScale: number,
): Transform {
  const delta = toPixels(event.deltaY, event.deltaMode)
  const scale = clamp(from.scale * Math.exp(-delta * SENSITIVITY), minScale, maxScale)

  if (scale === from.scale) return from

  // Keep the point under the cursor fixed while the scale changes.
  const rect = element.getBoundingClientRect()
  const cursorX = event.clientX - rect.left
  const cursorY = event.clientY - rect.top
  const ratio = scale / from.scale

  return {
    x: cursorX - (cursorX - from.x) * ratio,
    y: cursorY - (cursorY - from.y) * ratio,
    scale,
  }
}

function toPixels(delta: number, mode: number): number {
  if (mode === WheelEvent.DOM_DELTA_LINE) return delta * LINE_HEIGHT
  if (mode === WheelEvent.DOM_DELTA_PAGE) return delta * PAGE_HEIGHT
  return delta
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
