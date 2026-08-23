import { useControls } from 'react-zoom-pan-pinch'
import { ExternalLink, Moon, Scan, Sun, X } from 'lucide-react'
import { AppearanceSchema, type Appearance } from '@/lib/schema'
import { useCanvasScale } from './useCanvasScale'

/** Read off the schema so adding a Banhaten theme never means editing chrome. */
const THEMES = AppearanceSchema.shape.theme.unwrap().options
const RADII = AppearanceSchema.shape.radius.unwrap().options

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
 * Direction is shown but not switchable, and that is not an omission. Light and
 * dark are one screen in two token sets; left-to-right and right-to-left are
 * two different screens, because RTL means the copy is Arabic. A toggle would
 * imply the frame can show you something it cannot.
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

  const set = <K extends keyof Appearance>(key: K, value: Appearance[K]) =>
    onAppearance({ ...appearance, [key]: value })

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

          {themeable && (
            <>
              <Divider />

              {/* The comparison this whole repo exists to make, in one frame:
                  flipping a single frame between sandboxes beats reading two
                  side by side, because the difference is almost always a shift
                  in POSITION and only a shared origin makes that jump out. */}
              {sandboxes.length > 1 && (
                <div className="flex items-center gap-0.5">
                  {sandboxes.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onSandbox(name)}
                      title={`Render against ${name}`}
                      className={`rounded px-1.5 py-1 font-mono text-[10px] transition-colors ${
                        name === sandbox
                          ? 'bg-shell-accent/10 text-shell-accent'
                          : 'text-shell-muted hover:text-shell-ink'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              <Divider />

              <IconButton
                label={appearance.mode === 'dark' ? 'Switch to light' : 'Switch to dark'}
                onClick={() => set('mode', appearance.mode === 'dark' ? 'light' : 'dark')}
              >
                {appearance.mode === 'dark' ? (
                  <Sun className="size-3.5" aria-hidden />
                ) : (
                  <Moon className="size-3.5" aria-hidden />
                )}
              </IconButton>

              <Picker
                label="Theme"
                value={appearance.theme}
                options={THEMES}
                onChange={(value) => set('theme', value)}
              />
              <Picker
                label="Radius"
                value={appearance.radius}
                options={RADII}
                onChange={(value) => set('radius', value)}
              />

              <span
                title="Direction is declared per frame — RTL frames render Arabic copy"
                className="cursor-default rounded px-1.5 py-1 font-mono text-[10px] text-shell-muted"
              >
                {appearance.dir}
              </span>
            </>
          )}

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

function Divider() {
  return <span aria-hidden className="mx-0.5 h-4 w-px bg-shell-line" />
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex size-6 items-center justify-center rounded text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
    >
      {children}
    </button>
  )
}

/**
 * A native select rather than a custom popover: seven themes do not fit on a
 * toolbar as buttons and do not survive being cycled blind, and the browser
 * already renders its list at screen scale outside the transformed layer.
 */
function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <select
      value={value}
      title={label}
      aria-label={label}
      onChange={(event) => onChange(event.target.value as T)}
      className="cursor-pointer rounded border-0 bg-transparent py-1 ps-1.5 pe-0.5 font-mono text-[10px] text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink focus:outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
