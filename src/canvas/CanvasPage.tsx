import { useEffect } from 'react'
import { Link, useParams } from 'wouter'
import { TransformComponent, TransformWrapper, useControls } from 'react-zoom-pan-pinch'
import { ArrowLeft, Maximize2, Minus, Plus } from 'lucide-react'
import { findProject, loadCanvas } from '@/lib/projects'
import { Empty } from '@/app/Empty'
import { CanvasFrame } from './CanvasFrame'
import type { Section } from '@/lib/schema'

const MIN_SCALE = 0.1
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
        <TransformWrapper
          minScale={MIN_SCALE}
          maxScale={MAX_SCALE}
          initialScale={0.5}
          limitToBounds={false}
          centerOnInit
          wheel={{ step: 0.08, activationKeys: ['Control', 'Meta'] }}
          doubleClick={{ disabled: true }}
        >
          <div className="relative flex-1 overflow-hidden bg-shell-bg">
            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: '100%', height: '100%' }}
            >
              <div className="relative size-full">
                {canvas.value.sections.map((section) => (
                  <SectionGroup key={section.title} slug={slug} section={section} />
                ))}
              </div>
            </TransformComponent>

            <ZoomControls />
          </div>
        </TransformWrapper>
      )}
    </div>
  )
}

/**
 * Sections are logical groups, not containers. The title floats above the
 * bounding box of the frames it owns, so moving a frame moves the label.
 */
function SectionGroup({ slug, section }: { slug: string; section: Section }) {
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
        <CanvasFrame key={frame.id} slug={slug} frame={frame} />
      ))}
    </>
  )
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls()

  // Escape releases an activated frame by moving focus back to the document.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') (document.activeElement as HTMLElement | null)?.blur()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      <button
        type="button"
        onClick={() => {
          resetTransform()
          centerView(0.5)
        }}
        className={button}
        aria-label="Fit"
      >
        <Maximize2 className="size-4" aria-hidden />
      </button>
    </div>
  )
}
