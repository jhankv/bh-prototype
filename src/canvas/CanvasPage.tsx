import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'wouter'
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch'
import { ArrowLeft, Maximize2, Minus, Plus } from 'lucide-react'
import { findProject, loadCanvas } from '@/lib/projects'
import { onFrameRelease } from '@/lib/frameMessages'
import { Empty } from '@/app/Empty'
import { CanvasFrame } from './CanvasFrame'
import { useProgressiveMount } from './useProgressiveMount'
import type { Canvas, Section } from '@/lib/schema'

const MIN_SCALE = 0.05
const MAX_SCALE = 2
/** Room for the section title above a frame, and breathing space around the edges. */
const PADDING = 120

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

/** The bounding box of every frame, so the transform layer has real content to fit. */
function measure(canvas: Canvas) {
  const frames = canvas.sections.flatMap((section) => section.frames)

  if (frames.length === 0) return { width: 1, height: 1 }

  return {
    width: Math.max(...frames.map((frame) => frame.x + frame.width)) + PADDING,
    height: Math.max(...frames.map((frame) => frame.y + frame.height)) + PADDING,
  }
}

function CanvasViewport({ slug, canvas }: { slug: string; canvas: Canvas }) {
  const content = useMemo(() => measure(canvas), [canvas])

  // Frames mount one at a time so the canvas paints without waiting for all of
  // them. Numbering is global across sections, in reading order.
  const order = useMemo(
    () => canvas.sections.flatMap((section) => section.frames).map((frame) => frame.id),
    [canvas],
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
      // The array form is evaluated with `every`, so ['Control', 'Meta'] demands
      // both keys at once — Cmd-scroll alone never zoomed. The function form is
      // the only way to express "either modifier".
      wheel={{ step: 0.08, activationKeys: (keys) => keys.includes('Control') || keys.includes('Meta') }}
      panning={{ activationKeys: [' '] }}
      doubleClick={{ disabled: true }}
      onPanningStart={() => setPanning(true)}
      onPanningStop={() => setPanning(false)}
    >
      <div
        className={`relative flex-1 overflow-hidden bg-shell-bg ${
          panning ? 'cursor-grabbing' : spaceArmed ? 'cursor-grab' : ''
        }`}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: content.width, height: content.height }}
        >
          <div className="relative" style={{ width: content.width, height: content.height }}>
            {canvas.sections.map((section) => (
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

        <Controls content={content} />
      </div>
    </TransformWrapper>
  )
}

/**
 * Sections are logical groups, not containers. The title floats above the
 * bounding box of the frames it owns, so moving a frame moves the label.
 */
function SectionGroup({
  slug,
  section,
  activeFrameId,
  onActivate,
  isMounted,
}: {
  slug: string
  section: Section
  activeFrameId: string | null
  onActivate: (id: string | null) => void
  isMounted: (id: string) => boolean
}) {
  if (section.frames.length === 0) return null

  const left = Math.min(...section.frames.map((frame) => frame.x))
  const top = Math.min(...section.frames.map((frame) => frame.y))

  return (
    <>
      <h2
        className="absolute text-xs font-semibold tracking-wide text-shell-muted uppercase"
        style={{ left, top: top - 44 }}
      >
        {section.title}
      </h2>
      {section.frames.map((frame) => (
        <CanvasFrame
          key={frame.id}
          slug={slug}
          frame={frame}
          active={activeFrameId === frame.id}
          onActivate={onActivate}
          mounted={isMounted(frame.id)}
        />
      ))}
    </>
  )
}

function Controls({ content }: { content: { width: number; height: number } }) {
  const { zoomIn, zoomOut, centerView } = useControls()

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

  // Fit on open, after layout has settled enough to measure the wrapper.
  useEffect(() => {
    const frame = requestAnimationFrame(fit)
    return () => cancelAnimationFrame(frame)
  }, [fit])

  const button =
    'flex size-7 items-center justify-center rounded text-shell-muted hover:bg-shell-bg hover:text-shell-ink'

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-0.5 rounded-lg border border-shell-line bg-shell-surface p-1 shadow-sm">
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
      <Key>Space</Key>
      <span className="opacity-60">+ drag to pan</span>
      <span className="mx-0.5 opacity-30">·</span>
      <Key>{zoomKey}</Key>
      <span className="opacity-60">+ scroll to zoom</span>
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
