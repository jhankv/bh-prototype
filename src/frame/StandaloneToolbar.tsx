import { ArrowLeft } from 'lucide-react'
import { AppearanceSet, Divider, SandboxSwitcher } from '@/chrome/appearanceControls'
import type { Appearance } from '@/lib/schema'

type StandaloneToolbarProps = {
  /** What this frame renders, e.g. "views/BillsList.tsx". */
  title: string
  /** Back to the project this prototype belongs to. */
  projectHref: string
  appearance: Appearance
  onAppearance: (appearance: Appearance) => void
  sandbox: string
  sandboxes: string[]
  onSandbox: (sandbox: string) => void
  themeable: boolean
  onDirection: (dir: Appearance['dir']) => void
}

/**
 * The toolbar a prototype carries when it is opened on its own, outside the
 * canvas.
 *
 * Until it existed a standalone frame had no controls at all: the appearance
 * came from the URL and the only thing that could change it afterwards was a
 * `postMessage` from the canvas — which is not there when the canvas is not
 * there. Opening a prototype full size meant opening it frozen.
 *
 * Rendered only when this document is the top-level one. Inside the canvas the
 * frame already wears `FrameToolbar` above it, and two bars over one prototype
 * is chrome arguing with itself.
 *
 * `dir="ltr"` because this is the tool, not the prototype. The bar lives in the
 * prototype's own document, so an RTL frame would otherwise mirror the tool's
 * controls along with the screen it is testing — and a reader cannot tell a
 * deliberately mirrored UI from a mirrored toolbar by looking.
 */
export function StandaloneToolbar({
  title,
  projectHref,
  appearance,
  onAppearance,
  sandbox,
  sandboxes,
  onSandbox,
  themeable,
  onDirection,
}: StandaloneToolbarProps) {
  return (
    <div
      dir="ltr"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"
      data-standalone-toolbar=""
    >
      <div className="flex items-center gap-1 rounded-lg border border-shell-line bg-shell-surface p-1 whitespace-nowrap shadow-md">
        <a
          href={projectHref}
          title="Back to the project"
          aria-label="Back to the project"
          className="flex size-6 items-center justify-center rounded text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
        </a>

        <span className="max-w-56 truncate px-1.5 text-xs font-medium text-shell-ink">
          {title}
        </span>

        <Divider />

        {themeable && (
          <SandboxSwitcher sandbox={sandbox} sandboxes={sandboxes} onSandbox={onSandbox} />
        )}

        <AppearanceSet
          appearance={appearance}
          onChange={onAppearance}
          themeable={themeable}
          direction="reload"
          onDirection={onDirection}
        />
      </div>
    </div>
  )
}
