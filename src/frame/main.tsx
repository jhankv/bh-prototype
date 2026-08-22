import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../shell.css'
import { FrameApp } from './FrameApp'

createRoot(document.getElementById('frame-root')!).render(
  <StrictMode>
    <FrameApp />
  </StrictMode>,
)
