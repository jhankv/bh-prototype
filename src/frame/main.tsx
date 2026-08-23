import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import '../shell.css'
import { loadSandbox } from '@/ds'
import { FrameApp } from './FrameApp'

/**
 * Each sandbox owns a stylesheet. Loading it dynamically means a frame pulls in
 * exactly one design system's CSS — the isolation the iframe promises would be
 * hollow if every frame shipped every sandbox's tokens.
 */
const stylesheets = import.meta.glob('/sandboxes/*/frame.css')

const sandbox = new URLSearchParams(window.location.search).get('sandbox') ?? 'none'
const stylesheet = stylesheets[`/sandboxes/${sandbox}/frame.css`]

// Render after the stylesheet and this frame's components resolve, so the frame
// never flashes unstyled and useDS() can stay synchronous inside views.
if (stylesheet) await stylesheet()

/**
 * A <Compare> figure is a frame inside a frame, and it is evidence: it exists to
 * show what a component renders with nothing else on top of it. Six of them
 * opened six more annotation toolbars over the very figures an audit is arguing
 * from. A frame the canvas opened has the canvas as its parent; a snippet a
 * figure opened does not.
 */
const isTopLevelFrame = window.parent === window.top

let sandboxError: string | null = null

if (sandbox !== 'none') {
  try {
    await loadSandbox(sandbox)
  } catch (error) {
    sandboxError = error instanceof Error ? error.message : String(error)
  }
}

/**
 * TRIAL — mounted to find out whether annotating a prototype in place is worth
 * having, not because it is decided that it is.
 *
 * It lives in the frame rather than the shell so that what you annotate is the
 * prototype itself. The shell's own UI is a separate question with a separate
 * answer: there it can be mounted once, in `src/main.tsx`, with none of the
 * complications below.
 *
 * Three things to watch, all consequences of a canvas being many documents:
 *
 *  - Annotations are stored per `pathname`, and every frame is `/frame.html`.
 *    A note left on one frame is a note left on all of them.
 *  - Every frame mounts its own copy, so a canvas carries one floating toolbar
 *    per frame rather than one per canvas. Measured at ten on the sales-console
 *    canvas before the nesting guard below: four frames plus the six snippet
 *    iframes that three <Compare> figures open inside one audit document.
 *  - It injects its own styles into the frame document, which is the document
 *    whose rendering this tool exists to report on honestly. A defect seen with
 *    this mounted is not evidence until it has been seen without it.
 *
 * DEV only: it must never reach a build, and `import.meta.env.DEV` is what
 * lets the bundler drop it entirely.
 */
createRoot(document.getElementById('frame-root')!).render(
  <StrictMode>
    <FrameApp sandboxError={sandboxError} />
    {import.meta.env.DEV && isTopLevelFrame && <Agentation />}
  </StrictMode>,
)
