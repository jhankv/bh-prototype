import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { readShellMode, setShellMode } from '@/lib/shellMode'

/**
 * Switches the playground's chrome between light and dark. It does not touch a
 * frame: a prototype's mode is swept from its own toolbar, and this control
 * changing both would make it impossible to read a light component against a
 * dark tool, which is exactly the comparison the canvas exists for.
 *
 * The same Sun/Moon pair as the frame toolbar, because it means the same thing.
 * What tells them apart is where they sit — this one lives in the chrome that
 * frames the board, never over a frame — and the label says so out loud.
 */
export function ShellModeToggle() {
  // Seeded from the DOM: the inline script in `index.html` already decided what
  // is painted, and this button must agree with the page rather than re-derive
  // the answer.
  const [mode, setMode] = useState(readShellMode)
  const next = mode === 'dark' ? 'light' : 'dark'
  const label = `Switch the playground to ${next}`

  return (
    <button
      type="button"
      onClick={() => {
        setShellMode(next)
        setMode(next)
      }}
      title={label}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded text-shell-muted transition-colors hover:bg-shell-bg hover:text-shell-ink"
    >
      {mode === 'dark' ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </button>
  )
}
