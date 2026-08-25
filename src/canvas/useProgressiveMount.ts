import { useEffect, useState } from 'react'

/**
 * Mounting every iframe in one commit blocks the first paint until all of them
 * have booted. Measured on a ten-frame canvas: DOMContentLoaded at 651ms, but
 * first contentful paint at 12,180ms — twelve seconds of blank screen.
 *
 * Each frame is a whole document and pays its own boot, so some of that second
 * is inherent to the isolation the canvas is built on. Not all of it was: the
 * registry used to fan out into 73 chunks with a median size of 1 kB and await
 * every one of them before a frame rendered. See `vite.config.ts`.
 *
 * What this hook fixes is separate — making the user wait for all of it at
 * once. Frames mount one per animation frame, so the canvas paints and pans
 * immediately and fills in behind you.
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
    let frame = 0
    let timer = 0
    let next = 0

    /**
     * `requestAnimationFrame` paces mounting against paint, which is the whole
     * point — but it does not fire AT ALL while the tab is hidden. Open a
     * canvas, switch tabs while it loads, and the chain stops on its first
     * link: measured at 46 seconds in a background tab with zero frames
     * mounted and `rafTicksIn600ms: 0`. Coming back is what starts it, which
     * reads as "it took forever to load" rather than "it never started".
     *
     * The timeout is a floor, not a second chain. Whichever fires first runs
     * the step and cancels the other, so a visible canvas still mounts one
     * frame per paint and a hidden one keeps going at the rate the browser is
     * willing to give a background timer.
     */
    function schedule() {
      frame = requestAnimationFrame(run)
      timer = window.setTimeout(run, 32)
    }

    function run() {
      cancelAnimationFrame(frame)
      clearTimeout(timer)

      next += 1
      // Monotonic: React re-runs effects on a StrictMode remount, which restarts
      // this chain from zero. Frames already mounted must not be torn down and
      // rebooted — that would cost the second of boot time all over again.
      setAllowed((current) => Math.max(current, next))
      if (next < total) schedule()
    }

    schedule()

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [total])

  return allowed
}
