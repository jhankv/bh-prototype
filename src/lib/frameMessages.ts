/**
 * Once a frame is activated the user clicks inside it, and keyboard focus moves
 * into the iframe document. From then on the canvas window never sees a keydown
 * — Escape would be dead exactly when it is needed. The frame forwards it.
 */
export const FRAME_MESSAGE_SOURCE = 'prototype-playground-frame'

export type FrameMessage = { source: typeof FRAME_MESSAGE_SOURCE; type: 'release' }

/** Called inside a frame document. */
export function forwardEscapeToCanvas(): () => void {
  function onKey(event: KeyboardEvent) {
    if (event.key !== 'Escape' || window.parent === window) return

    const message: FrameMessage = { source: FRAME_MESSAGE_SOURCE, type: 'release' }
    window.parent.postMessage(message, window.location.origin)
  }

  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}

/** Called in the canvas. Ignores anything not from a frame on this origin. */
export function onFrameRelease(handler: () => void): () => void {
  function onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    if ((event.data as FrameMessage | undefined)?.source !== FRAME_MESSAGE_SOURCE) return

    handler()
  }

  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
