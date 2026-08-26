import { useControls } from 'react-zoom-pan-pinch'
import { ExternalLink, Scan, X } from 'lucide-react'
import {
  AppearanceSet,
  Divider,
  IconButton,
  SandboxSwitcher,
} from '@/chrome/appearanceControls'
import type { Appearance } from '@/lib/schema'
import { useCanvasScale } from './useCanvasScale'

type FrameToolbarProps = {
  frameId: string
  appearance: Appearance
  onAppearance: (appearance: Appearance) => void
  sandbox: string
  sandboxes: string[]
  onSandbox: (sandbox: string) => void
  /** False for documents: prose has no design system to theme. */
  themeable: boolean
  standaloneUrl: string
  /** The frame's box, so the canvas can zoom to it. */
  target: React.RefObject<HTMLDivElement | null>
  onRelease: () => void
}

/**
 * The controls for the selected frame, floating above it.
 *
 * They appear on selection rather than living permanently above every frame for
 * the reason a canvas exists at all: ten frames each wearing a row of buttons is
 * a control panel, not a page of screens. Unselected, a frame carries a name and
 * nothing else, so the eye compares prototypes instead of chrome.
 *
 * Selection is the same act as activation here, deliberately. Tools that
 * separate them — click to select, click again to interact — do it because
 * their primary verb is *arranging* frames. Ours is *using* them: the whole
 * point is to drive a prototype until a component breaks, so putting a second
 * click in front of the first interaction taxes the one thing this tool is for.
 *
 * The appearance controls themselves live in `@/chrome`, shared with the
 * toolbar a frame carries when it is opened on its own. Direction is the one
 * control that behaves differently here — see `AppearanceSet`.
 */
export function FrameToolbar({
  frameId,
  appearance,
  onAppearance,
  sandbox,
  sandboxes,
  onSandbox,
  themeable,
  standaloneUrl,
  target,
  onRelease,
}: FrameToolbarProps) {
  const scale = useCanvasScale()
  const { zoomToElement } = useControls()

  return (
    <div
      className="absolute bottom-full left-1/2 z-20"
      /**
       * Counter-scaled so the chrome stays screen-sized at any zoom, and
       * centred on the frame rather than pinned to its left edge — the toolbar
       * belongs to the whole frame, so hanging it off one corner reads as if it
       * belonged to that corner.
       *
       * The two halves of the transform work in different units, which is what
       * makes this hold at every zoom. `scale` runs first, about the bottom
       * centre, so the frame's top edge stays put while the bar grows upward.
       * `translateX(-50%)` then resolves against the element's *untransformed*
       * width, so the shift is exactly half of what `left-1/2` overshot by,
       * whatever the scale happens to be.
       */
      style={{
        transform: `translateX(-50%) scale(${1 / scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* Inside the counter-scale, so the gap is 8 screen pixels at every zoom. */}
      <div className="pb-2">
        <div className="flex items-center gap-1 rounded-lg border border-shell-line bg-shell-surface p-1 whitespace-nowrap shadow-md">
          <span className="max-w-56 truncate px-1.5 text-xs font-medium text-shell-ink">
            {frameId}
          </span>

          <Divider />

          {themeable && (
            <SandboxSwitcher sandbox={sandbox} sandboxes={sandboxes} onSandbox={onSandbox} />
          )}

          <AppearanceSet
            appearance={appearance}
            onChange={onAppearance}
            themeable={themeable}
            direction="fixed"
          />

          <Divider />

          <IconButton
            label={`Zoom to this frame · 0`}
            onClick={() => target.current && zoomToElement(target.current, 1, 240)}
          >
            <Scan className="size-3.5" aria-hidden />
          </IconButton>

          <a
            href={standaloneUrl}
            target="_blank"
            rel="noreferrer"
            title="Open full size in a new tab"
            aria-label="Open full size in a new tab"
            className="flex size-6 items-center justify-center rounded text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
          >
            <ExternalLink className="size-3.5" aria-hidden />
          </a>

          <IconButton label="Release · Esc" onClick={onRelease}>
            <X className="size-3.5" aria-hidden />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
