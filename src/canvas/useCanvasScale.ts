import { useCallback, useState } from 'react'
import { useTransformContext, useTransformEffect } from 'react-zoom-pan-pinch'

/**
 * The canvas zoom, for chrome that must not zoom with it.
 *
 * A toolbar drawn inside the transform layer is scaled by it, so at 0.2 it is
 * unreadable and at 2 it dwarfs the frame it belongs to. Counter-scaling by
 * 1/scale keeps it at screen size while its position stays in canvas
 * coordinates, which is the only way an element can be pinned to a frame and
 * still be legible at every zoom.
 *
 * The library ships `KeepScale`, which writes the transform straight to the DOM
 * and never re-renders — cheaper, but it only reacts to *changes*. Chrome that
 * appears mid-session, as this does when a frame is selected, would render once
 * at the wrong size and stay there until the next pan. So the current scale is
 * read synchronously on mount and the subscription only keeps it up to date.
 */
export function useCanvasScale(): number {
  const context = useTransformContext()
  const [scale, setScale] = useState(() => context.state.scale)

  // Inline callbacks resubscribe on every render — the hook lists it as a dep.
  useTransformEffect(useCallback(({ state }) => setScale(state.scale), []))

  return scale
}
