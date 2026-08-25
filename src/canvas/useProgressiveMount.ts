import { useEffect, useRef, useState } from 'react'

/**
 * Which frames have a live iframe, and when they got one.
 *
 * Mounting every iframe in one commit blocks the first paint until all of them
 * have booted. Measured on a ten-frame canvas: DOMContentLoaded at 651ms, but
 * first contentful paint at 12,180ms — twelve seconds of blank screen.
 *
 * Two things decide the answer, and the second one used to be ruled out.
 *
 * **Pacing.** Frames mount one per animation frame, so the canvas paints and
 * pans immediately and fills in behind you rather than making you wait for all
 * of it at once.
 *
 * **Viewport.** Only frames near the viewport mount. That was rejected once, for
 * a reason that was true when it was written: the canvas fitted the whole board
 * on open, so every frame was already in view and observing them saved nothing.
 * That fit is gone. The canvas fits the WIDTH now — see `CanvasPage`, and the
 * 7.6% scale that change was made to escape — so two or three rows are in view
 * and the rest are below the fold.
 *
 * The check is `getBoundingClientRect`, on the same tick that paces mounting,
 * and NOT `IntersectionObserver`. The observer is the right tool and it has the
 * same defect rAF does: measured in a hidden tab, zero callbacks fired for a
 * target sitting 89px from the top of a 1752×1214 viewport. Using it would have
 * put back the exact bug the timeout floor below exists to fix. Layout is
 * computed on demand; intersection is computed when the page renders, and a
 * hidden page does not.
 *
 * That matters because the remaining cost is not network. Measured over a
 * 60ms-latency link with a cold cache, twenty-six frames cost 49 network
 * requests in total: the browser cache is warm by the third frame. The cost is
 * that same-origin iframes share one renderer process, so twenty-six documents
 * parse ~1 MB of JS, boot React and lay out a 1420×900 page on ONE main thread,
 * in a queue. About 600ms each, measured standalone, which is the 15 seconds a
 * full canvas took to settle.
 *
 * A frame you have not scrolled to should not be in that queue.
 *
 * Mounting is sticky. A frame that scrolls back out is left alone, because
 * tearing it down would cost its 600ms again the moment you scrolled back — and
 * would throw away the state you were in, which is usually how a defect was
 * found in the first place.
 */
export function useProgressiveMount(ids: readonly string[]): (id: string) => boolean {
  const [mounted, setMounted] = useState<ReadonlySet<string>>(() => new Set())
  const queue = useRef<string[]>([])
  const claimed = useRef<Set<string>>(new Set())

  useEffect(() => {
    // The refs are the effect's own bookkeeping and reset with it. `mounted` is
    // not cleared: a board change remounts this page, and an id that survives
    // into a board that no longer renders it is simply never asked about.
    queue.current = []
    claimed.current = new Set()

    const boxes = [...document.querySelectorAll<HTMLElement>('[data-frame-box]')]
    if (boxes.length === 0) return

    let lastScan = 0

    /**
     * Queue every unclaimed frame within half a viewport in each direction, so
     * a frame is already booting by the time you pan to it rather than starting
     * when it appears.
     *
     * Half, not a whole one: a full viewport of lead mounted 12 of the 26
     * frames on open, which is 7 seconds of the 15 rather than the 4 the change
     * is for. The board is a column, so lead costs rows.
     *
     * Scanning is skipped while there is a backlog — the queue is the work, and
     * looking for more of it changes nothing until it drains.
     */
    function scan(now: number) {
      if (queue.current.length > 0) return
      if (now - lastScan < 200) return
      lastScan = now

      const lead = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

      for (const box of boxes) {
        const id = box.getAttribute('data-frame-box')
        if (!id || claimed.current.has(id)) continue

        const rect = box.getBoundingClientRect()
        const near =
          rect.bottom > -lead.y &&
          rect.top < window.innerHeight + lead.y &&
          rect.right > -lead.x &&
          rect.left < window.innerWidth + lead.x

        if (!near) continue
        claimed.current.add(id)
        queue.current.push(id)
      }
    }

    let frame = 0
    let timer = 0

    /**
     * `requestAnimationFrame` paces mounting against paint, which is the point —
     * but it does not fire AT ALL while the tab is hidden. Open a canvas, switch
     * tabs while it loads, and the chain stopped on its first link: measured at
     * 46 seconds in a background tab with zero frames mounted and
     * `rafTicksIn600ms: 0`. Coming back is what started it, which reads as "it
     * took forever to load" rather than "it never started".
     *
     * The timeout is a floor, not a second chain. Whichever fires first runs the
     * step and cancels the other.
     */
    function schedule() {
      frame = requestAnimationFrame(step)
      timer = window.setTimeout(step, 32)
    }

    function step() {
      cancelAnimationFrame(frame)
      clearTimeout(timer)

      scan(performance.now())

      const next = queue.current.shift()
      if (next) {
        setMounted((current) => {
          if (current.has(next)) return current
          const grown = new Set(current)
          grown.add(next)
          return grown
        })
      }

      // The chain never stops while the canvas is open: panning to a new row
      // puts more ids in the queue long after the first pass has drained it.
      schedule()
    }

    schedule()

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [ids])

  return (id: string) => mounted.has(id)
}
