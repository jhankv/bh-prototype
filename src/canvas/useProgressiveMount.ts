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
 *
 * The schedule is ONE self-continuing chain, deliberately independent of the
 * rendered count. An earlier version depended on `allowed` and cancelled its
 * pending frame in the effect cleanup, so a re-render arriving between the
 * request and its callback could drop a link — the last frame of a canvas would
 * silently never mount, which reads as a broken prototype rather than a missed
 * tick. Intermittent, and therefore worse than a consistent failure.
 */
export function useProgressiveMount(total: number): number {
  const [allowed, setAllowed] = useState(0)

  useEffect(() => {
    let handle = 0
    let next = 0

    function step() {
      next += 1
      // Monotonic: React re-runs effects on a StrictMode remount, which restarts
      // this chain from zero. Frames already mounted must not be torn down and
      // rebooted — that would cost the second of boot time all over again.
      setAllowed((current) => Math.max(current, next))
      if (next < total) handle = requestAnimationFrame(step)
    }

    handle = requestAnimationFrame(step)
    return () => cancelAnimationFrame(handle)
  }, [total])

  return allowed
}
