import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shell.css'
import { loadSandbox } from '@/ds/registry'
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

let sandboxError: string | null = null

if (sandbox !== 'none') {
  try {
    await loadSandbox(sandbox)
  } catch (error) {
    sandboxError = error instanceof Error ? error.message : String(error)
  }
}

createRoot(document.getElementById('frame-root')!).render(
  <StrictMode>
    <FrameApp sandboxError={sandboxError} />
  </StrictMode>,
)
