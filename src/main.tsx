import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import './shell.css'
import { App } from './app/App'
import { maybeMountVercelToolbar } from './lib/vercelToolbar'

maybeMountVercelToolbar()

/**
 * Agentation annotates the wrapper's own UI — the dashboard, the canvas chrome,
 * the frame toolbar. Here it is simply a good tool: one document, plain React,
 * no vendored design system, and its `Source:` line points at code we own.
 *
 * It is deliberately not inside a frame. Two measured reasons: it keys its
 * storage by `pathname`, and every frame is `/frame.html`, so a note left on
 * one frame appeared on all of them; and its line numbers are read after the
 * React Compiler has inflated them, which reported `toolbar.tsx:622` in a file
 * of 539 lines. Annotating a prototype is the Inspector's job, from inside the
 * frame, where both problems are absent by construction.
 *
 * DEV only, so the bundler drops it from any build.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {import.meta.env.DEV && <Agentation />}
  </StrictMode>,
)
