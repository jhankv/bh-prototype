import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'wouter'
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch'
import { ArrowLeft, Maximize2, Minus, Plus } from 'lucide-react'
import { findProject, loadCanvas } from '@/lib/projects'
import { onFrameRelease, onFrameZoom } from '@/lib/frameMessages'
import { Empty } from '@/app/Empty'
import { CanvasFrame } from './CanvasFrame'
import { layout, type PlacedSection } from './layout'
import { useProgressiveMount } from './useProgressiveMount'
import { useWheelGestures } from './useWheelGestures'
import type { Canvas } from '@/lib/schema'

const MIN_SCALE = 0.05
const MAX_SCALE = 2

export function CanvasPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = findProject(slug)

  if (!project) {
    return <Empty title="Project not found" detail={`No prototypes/${slug}/manifest.json`} />
  }

  const canvas = loadCanvas(slug)

  return (
    <div className="flex h-dvh flex-col">
      <header className="z-10 flex items-center gap-3 border-b border-shell-line bg-shell-surface px-4 py-2.5">
        <Link href="/" className="text-shell-muted hover:text-shell-ink" aria-label="Back">
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-sm font-medium text-shell-ink">{project.manifest.name}</h1>
      </header>

      {!canvas.ok ? (
        <Empty title="Canvas could not be read" detail={canvas.error} />
      ) : (
        <CanvasViewport slug={slug} canvas={canvas.value} />
      )}
    </div>
  )
}

function CanvasViewport({ slug, canvas }: { slug: string; canvas: Canvas }) {
  const board = useMemo(() => layout(canvas), [canvas])

  // Frames mount one at a time so the canvas paints without waiting for all of
  // them. Numbering is global across sections and rows, in reading order.
  const order = useMemo(
    () =>
      board.sections.flatMap((section) =>
        section.rows.flatMap((row) => row.frames.map((frame) => frame.id)),
      ),
    [board],
  )
  const mountedCount = useProgressiveMount(order.length)

  // Exactly one frame takes pointer events at a time. Held here rather than in
  // each frame so Escape can release it and two frames can never both be live.
  const [activeFrameId, setActiveFrameId] = useState<string | null>(null)

  // Figma's contract: space arms panning, and the spacebar would otherwise
  // scroll the page. While a frame is active the space belongs to that frame —
  // the user is typing in it — so Escape is the handoff back to the canvas.
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [panning, setPanning] = useState(false)

  // Derived rather than reset in an effect: an activated frame owns the space
  // key, so arming is a function of both, not a state to keep in sync.
  const spaceArmed = spaceHeld && !activeFrameId

  useEffect(() => {
    if (activeFrameId) return

    function onDown(event: KeyboardEvent) {
      if (event.key !== ' ' || event.repeat) return
      // The library's own key listeners are passive and cannot do this.
      event.preventDefault()
      setSpaceHeld(true)
    }

    function onUp(event: KeyboardEvent) {
      if (event.key === ' ') setSpaceHeld(false)
    }

    // Releasing the key outside the window never fires keyup.
    function onBlur() {
      setSpaceHeld(false)
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [activeFrameId])

  useEffect(() => {
    function release() {
      setActiveFrameId(null)
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') release()
    }

    // Escape from the canvas itself, and Escape forwarded by the focused frame.
    window.addEventListener('keydown', onKey)
    const stopListening = onFrameRelease(release)

    return () => {
      window.removeEventListener('keydown', onKey)
      stopListening()
    }
  }, [])

  return (
    <TransformWrapper
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      limitToBounds={false}
      // Without this the scale bounds are elastic by ±0.4, which pushes the
      // ceiling to 2.4 and — because the floor is smaller than the padding —
      // collapses it to 1e-7, so zooming out hard loses the canvas entirely.
      // A precision canvas wants hard stops; Figma has no rubber-banding either.
      disablePadding
      // The wheel belongs to useWheelGestures — scroll pans, modifier-scroll
      // zooms. The library's own trackpad panning ships disabled, and turning it
      // on would have it negotiating with our zoom over the same event.
      wheel={{ disabled: true }}
      panning={{ activationKeys: [' '] }}
      doubleClick={{ disabled: true }}
      onPanningStart={() => setPanning(true)}
      onPanningStop={() => setPanning(false)}
    >
      <div
        /**
         * Pressing empty canvas clears the selection, the way it does in every
         * canvas tool. On pointerdown rather than click, so the frame lets go
         * the instant you commit to leaving it.
         *
         * A press that lands inside a frame is the frame's business, and one
         * that lands on the zoom bar is nobody's — reaching for a control is
         * not the same gesture as reaching for the background. While a frame is
         * live its own iframe takes the press, so this never sees it.
         */
        onPointerDown={(event) => {
          const target = event.target as Element | null
          if (target?.closest('[data-frame], [data-canvas-chrome]')) return
          setActiveFrameId(null)
        }}
        className={`relative flex-1 overflow-hidden bg-shell-bg ${
          panning ? 'cursor-grabbing' : spaceArmed ? 'cursor-grab' : ''
        }`}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: board.width, height: board.height }}
        >
          <div className="relative" style={{ width: board.width, height: board.height }}>
            {board.sections.map((section) => (
              <SectionGroup
                key={section.title}
                slug={slug}
                section={section}
                activeFrameId={activeFrameId}
                onActivate={setActiveFrameId}
                isMounted={(id) => order.indexOf(id) < mountedCount}
              />
            ))}
          </div>
        </TransformComponent>

        <Controls content={board} activeFrameId={activeFrameId} />
      </div>
    </TransformWrapper>
  )
}

/**
 * Sections are logical groups, not containers. Both labels float above the
 * frames they own — they are positioned, not wrapped, so nothing sits between
 * the transform layer and a frame.
 *
 * A section splits into rows when one line of frames stops being readable. The
 * row label is lighter than the section title on purpose: the section is what
 * you are looking at, the row is which cut of it.
 */
function SectionGroup({
  slug,
  section,
  activeFrameId,
  onActivate,
  isMounted,
}: {
  slug: string
  section: PlacedSection
  activeFrameId: string | null
  onActivate: (id: string | null) => void
  isMounted: (id: string) => boolean
}) {
  return (
    <>
      <h2
        className="absolute text-xs font-semibold tracking-wide text-shell-muted uppercase"
        style={{ left: section.x, top: section.y - 44 }}
      >
        {section.title}
      </h2>
      {section.rows.map((row) => (
        <Fragment key={row.y}>
          {row.label && (
            <h3
              className="absolute text-xs text-shell-muted"
              style={{ left: row.x, top: row.y - 22 }}
            >
              {row.label}
            </h3>
          )}
          {row.frames.map((frame) => (
            <CanvasFrame
              key={frame.id}
              slug={slug}
              frame={frame}
              active={activeFrameId === frame.id}
              onActivate={onActivate}
              mounted={isMounted(frame.id)}
            />
          ))}
        </Fragment>
      ))}
    </>
  )
}

function Controls({
  content,
  activeFrameId,
}: {
  content: { width: number; height: number }
  activeFrameId: string | null
}) {
  const { zoomIn, zoomOut, centerView, zoomToElement } = useControls()

  useWheelGestures(MIN_SCALE, MAX_SCALE)

  /**
   * Figma's ⌘0, pointed at the selected frame.
   *
   * It has to arrive two ways. Fired at the canvas it is a keydown like any
   * other; fired at a frame the user is working inside, focus is in the iframe
   * and this window never hears it, so the frame forwards it as a message. Same
   * handler either way — the shortcut should not care where the caret is.
   */
  const zoomToFrame = useCallback(() => {
    if (!activeFrameId) return

    const node = document.querySelector<HTMLElement>(
      `[data-frame-box="${CSS.escape(activeFrameId)}"]`,
    )
    if (node) zoomToElement(node, 1, 240)
  }, [activeFrameId, zoomToElement])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!activeFrameId) return

      // ⌘0 is the one people reach for, but the browser owns it too and does not
      // always hand it over. Figma's actual zoom-to-selection is Shift+2, which
      // nothing competes for — so both work, and one of them is guaranteed to.
      //
      // Shift+2 is deliberately not forwarded from inside a frame: there it is
      // the "@" key, and a prototype you are typing into must keep its own
      // keyboard. ⌘0 types nothing, which is what makes it safe to forward.
      // Matched on `code`, the physical key, not `key`, the character it
      // produces. Shift+2 is "@" on a US layout and a double quote on a Spanish
      // one — a shortcut bound to the character silently stops existing when
      // someone changes keyboard layout. `code` is where the finger goes.
      const noModifiers = !event.metaKey && !event.ctrlKey && !event.altKey

      const zoomKey =
        (event.code === 'Digit0' && (event.metaKey || event.ctrlKey)) ||
        (event.code === 'Digit2' && event.shiftKey && noModifiers)

      if (!zoomKey) return

      // With no selection the browser keeps its own reset-zoom shortcut.
      event.preventDefault()
      zoomToFrame()
    }

    window.addEventListener('keydown', onKey)
    const stopListening = onFrameZoom(zoomToFrame)

    return () => {
      window.removeEventListener('keydown', onKey)
      stopListening()
    }
  }, [activeFrameId, zoomToFrame])

  /**
   * Fit is not decorative. A canvas is thousands of pixels wide, so opening one
   * without fitting drops you into empty space with no idea where the frames are.
   */
  const fit = useCallback(() => {
    const wrapper = document.querySelector('.react-transform-wrapper')
    if (!wrapper) return

    const { width, height } = wrapper.getBoundingClientRect()
    const scale = Math.min(width / content.width, height / content.height, 1) * 0.94

    centerView(Math.max(scale, MIN_SCALE), 0)
  }, [centerView, content.height, content.width])

  /**
   * Fit on open, after layout has settled enough to measure the wrapper — and
   * exactly once.
   *
   * Depending on `fit` alone means "on every render", which is not obvious and
   * cost real time to find: `useControls()` builds a fresh object of fresh
   * functions on every call, so `centerView`, and therefore `fit`, has a new
   * identity each time. Every re-render re-fitted the canvas and threw away the
   * zoom the user had chosen — and selecting a frame is a re-render.
   *
   * The guard is a ref rather than empty deps so the effect still closes over a
   * `fit` that can measure, instead of a stale one captured before layout. It
   * is raised inside the frame callback, not beside it: StrictMode mounts,
   * cleans up and mounts again, so a flag set on the way in would be true on the
   * second pass while the first pass's fit had already been cancelled — and the
   * canvas would open unfitted, which is how this was caught.
   */
  const fitted = useRef(false)

  useEffect(() => {
    if (fitted.current) return

    const frame = requestAnimationFrame(() => {
      fitted.current = true
      fit()
    })

    return () => cancelAnimationFrame(frame)
  }, [fit])

  const button =
    'flex size-7 items-center justify-center rounded text-shell-muted hover:bg-shell-bg hover:text-shell-ink'

  return (
    <div
      data-canvas-chrome=""
      className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-lg border border-shell-line bg-shell-surface p-1 shadow-sm"
    >
      <button type="button" onClick={() => zoomOut()} className={button} aria-label="Zoom out">
        <Minus className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={() => zoomIn()} className={button} aria-label="Zoom in">
        <Plus className="size-4" aria-hidden />
      </button>
      <button type="button" onClick={fit} className={button} aria-label="Fit to content">
        <Maximize2 className="size-4" aria-hidden />
      </button>

      <ShortcutHint />
    </div>
  )
}

/**
 * Figma's gestures are muscle memory for designers but invisible to everyone
 * else, and this canvas has no other affordance for them. A shortcut nobody can
 * see does not exist.
 */
function ShortcutHint() {
  const zoomKey = navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl'

  return (
    <p className="ms-2 me-1 flex items-center gap-1.5 text-[11px] whitespace-nowrap text-shell-muted">
      <span className="opacity-60">Scroll to pan</span>
      <span className="mx-0.5 opacity-30">·</span>
      <Key>{zoomKey}</Key>
      <span className="opacity-60">+ scroll to zoom</span>
      <span className="mx-0.5 opacity-30">·</span>
      <Key>Space</Key>
      <span className="opacity-60">+ drag</span>
    </p>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      dir="ltr"
      className="rounded border border-shell-line bg-shell-bg px-1.5 py-0.5 font-mono text-[10px] text-shell-ink"
    >
      {children}
    </kbd>
  )
}

