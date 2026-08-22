import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shell.css'
import { FrameApp } from './FrameApp'

/**
 * Each sandbox owns a stylesheet. Loading it dynamically means a frame pulls in
 * exactly one design system's CSS — the isolation the iframe promises would be
 * hollow if every frame shipped every sandbox's tokens.
 */
const stylesheets = import.meta.glob('/sandboxes/*/frame.css')

const sandbox = new URLSearchParams(window.location.search).get('sandbox') ?? 'none'
const stylesheet = stylesheets[`/sandboxes/${sandbox}/frame.css`]

// Render after the stylesheet resolves so the frame never flashes unstyled.
if (stylesheet) await stylesheet()

createRoot(document.getElementById('frame-root')!).render(
  <StrictMode>
    <FrameApp />
  </StrictMode>,
)
