import { useEffect, useRef } from 'react'
import { useControls, useTransformContext } from 'react-zoom-pan-pinch'

/**
 * The library's wheel zoom is additive: `scale + delta * step`, and with its
 * default `smooth` the step is further multiplied by |deltaY|. Two consequences,
 * both measured on this canvas:
 *
 *  - one mouse tick (deltaY 100) crossed the entire 0.05–2 range at once;
 *  - a fixed increment is +50% at scale 0.2 and +5% at scale 1.9, so zooming
 *    feels ten times faster at one end of the canvas than the other.
 *
 * Perceived zoom is geometric, not linear, so the step has to be a ratio. This
 * replaces the library's handler with an exponential one anchored at the cursor,
 * which is what every canvas tool does.
 */
const SENSITIVITY = 0.0015

/** Two wheel events further apart than this belong to different gestures. */
const GESTURE_GAP_MS = 200

type Transform = { x: number; y: number; scale: number }

export function useWheelZoom(minScale: number, maxScale: number): void {
  const { setTransform } = useControls()
  const context = useTransformContext()

  /**
   * The library's state lags a frame behind, so two wheel events in quick
   * succession both read the pre-first-event scale and compute the same target
   * — one tick of the gesture is silently dropped. Within a gesture we track the
   * transform ourselves; between gestures we re-read the library, since panning,
   * fit and the zoom buttons all move it.
   */
  const gesture = useRef<{ at: number; transform: Transform } | null>(null)

  useEffect(() => {
    const element = context.wrapperComponent
    if (!element) return

    function onWheel(event: WheelEvent) {
      // Trackpad pinch arrives as a wheel event with ctrlKey set, so the same
      // gesture check covers both the modifier and the pinch.
      if (!event.ctrlKey && !event.metaKey) return

      event.preventDefault()

      const now = event.timeStamp
      const continuing = gesture.current && now - gesture.current.at < GESTURE_GAP_MS

      const from: Transform = continuing
        ? gesture.current!.transform
        : {
            x: context.state.positionX,
            y: context.state.positionY,
            scale: context.state.scale,
          }

      const scale = clamp(from.scale * Math.exp(-event.deltaY * SENSITIVITY), minScale, maxScale)
      gesture.current = { at: now, transform: { ...from, scale } }

      if (scale === from.scale) return

      // Keep the point under the cursor fixed while the scale changes.
      const rect = element!.getBoundingClientRect()
      const cursorX = event.clientX - rect.left
      const cursorY = event.clientY - rect.top
      const ratio = scale / from.scale

      const next: Transform = {
        x: cursorX - (cursorX - from.x) * ratio,
        y: cursorY - (cursorY - from.y) * ratio,
        scale,
      }

      gesture.current = { at: now, transform: next }
      setTransform(next.x, next.y, next.scale, 0)
    }

    // Not passive: the browser zooms the whole page otherwise.
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [context, maxScale, minScale, setTransform])
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
