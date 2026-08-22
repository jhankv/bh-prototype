import { useEffect, useState } from 'react'

/**
 * Mounting every iframe in one commit blocks the first paint until all of them
 * have booted. Measured on a ten-frame canvas: DOMContentLoaded at 651ms, but
 * first contentful paint at 12,180ms — twelve seconds of blank screen.
 *
 * Each frame is a whole document, so ~1s each is inherent to the isolation the
 * canvas is built on; it cannot be optimised away. What can be fixed is making
 * the user wait for all of it at once. Frames mount one per animation frame, so
 * the canvas paints and pans immediately and fills in behind you.
 */
export function useProgressiveMount(total: number): number {
  const [allowed, setAllowed] = useState(0)

  useEffect(() => {
    if (allowed >= total) return

    const handle = requestAnimationFrame(() => setAllowed((current) => current + 1))
    return () => cancelAnimationFrame(handle)
  }, [allowed, total])

  return allowed
}
