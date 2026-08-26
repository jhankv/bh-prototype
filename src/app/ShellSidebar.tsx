import { Link, useLocation } from 'wouter'
import { Boxes } from 'lucide-react'
import { ShellModeToggle } from './ShellModeToggle'

/**
 * The shell's one permanent surface: the way back to the projects, and the
 * tool's own settings.
 *
 * It exists because the mode toggle was landing in three different corners —
 * the dashboard header, the project header, the canvas header — and a control
 * that moves is a control you have to look for. Chrome that is always in the
 * same place is chrome you stop reading.
 *
 * It deliberately does NOT list the projects. An icon rail can only carry items
 * that have a shape of their own, and projects do not: ten of them would be ten
 * identical squares told apart by a tooltip, which is a list you have to hover
 * to read. The dashboard is where projects are chosen, and this is the button
 * that gets you there from anywhere.
 *
 * A rail of icons rather than a sidebar of labels, and the canvas is the reason.
 * The board fits to WIDTH, and a comparison row is two 1420-wide frames: every
 * pixel this takes comes straight off the scale every canvas opens at. 56px is
 * under four per cent of a laptop viewport, which a named sidebar would not be.
 *
 * It is not in `frame.html`. A frame is a different document showing someone
 * else's design system at full bleed; the tool's navigation has no business
 * inside it, and the prototype carries its own toolbar there instead.
 */
export function ShellSidebar() {
  const [location] = useLocation()

  return (
    <nav
      aria-label="Playground"
      className="flex w-14 shrink-0 flex-col items-center gap-1 border-e border-shell-line bg-shell-surface py-3"
    >
      <Link
        href="/"
        title="All prototypes"
        aria-label="All prototypes"
        aria-current={location === '/' ? 'page' : undefined}
        className={`flex size-8 items-center justify-center rounded-md transition-colors ${
          location === '/'
            ? 'bg-shell-accent/10 text-shell-accent'
            : 'text-shell-muted hover:bg-shell-bg hover:text-shell-ink'
        }`}
      >
        <Boxes className="size-4" aria-hidden />
      </Link>

      {/* Settings sit at the far end, away from navigation — reaching for a
          preference is not the same gesture as reaching for a project. */}
      <div className="mt-auto">
        <ShellModeToggle />
      </div>
    </nav>
  )
}
