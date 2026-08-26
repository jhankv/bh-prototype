/**
 * The playground's own colour mode — the dashboard and the canvas chrome, not
 * the prototypes.
 *
 * It is deliberately NOT in the URL, unlike a frame's appearance. A frame's
 * appearance is part of what the link means: sending someone `mode=dark` is
 * sending them the state the defect appears in. Which colour the tool around it
 * is painted in says nothing about the finding, and putting it in the URL would
 * make every shared link carry a preference the receiver did not choose.
 *
 * The class is applied by the inline script in `index.html`, before the
 * stylesheet paints. This module owns the same key and must keep it in step —
 * an inline script cannot import, and a flash of the wrong palette on every
 * load is the price of removing the duplication.
 */
export type ShellMode = 'light' | 'dark'

export const SHELL_MODE_KEY = 'playground:shell-mode'

/**
 * Read from the DOM rather than from storage, because the DOM is what is on
 * screen. Re-deriving the preference here could disagree with the inline
 * script — over a private-mode storage throw, or a key written by an older
 * build — and a control that reports the opposite of the page it sits on is
 * worse than no control.
 */
export function readShellMode(): ShellMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function setShellMode(mode: ShellMode): void {
  document.documentElement.classList.toggle('dark', mode === 'dark')

  // Storage throws in private mode and when the user blocks it. Losing the
  // preference is survivable; losing the click is not.
  try {
    localStorage.setItem(SHELL_MODE_KEY, mode)
  } catch {
    /* preference is not persisted this session */
  }
}
