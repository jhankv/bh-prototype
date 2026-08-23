import { AppearanceSchema, type Appearance } from './schema'

/**
 * Once a frame is activated the user clicks inside it, and keyboard focus moves
 * into the iframe document. From then on the canvas window never sees a keydown
 * — Escape would be dead exactly when it is needed. The frame forwards it.
 */
export const FRAME_MESSAGE_SOURCE = 'prototype-playground-frame'

export type FrameMessage = {
  source: typeof FRAME_MESSAGE_SOURCE
  type: 'release' | 'ready'
}

function toCanvas(type: FrameMessage['type']): void {
  if (window.parent === window) return

  const message: FrameMessage = { source: FRAME_MESSAGE_SOURCE, type }
  window.parent.postMessage(message, window.location.origin)
}

/** Called inside a frame document. */
export function forwardEscapeToCanvas(): () => void {
  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') toCanvas('release')
  }

  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}

/**
 * Called inside a frame once it is listening for appearance, never before.
 *
 * `load` fires when the document is parsed, which is earlier than when React
 * has mounted and subscribed — and postMessage has no queue, so anything the
 * canvas sends in that gap is simply gone. That gap is not theoretical: it is
 * how a frame ended up rendering light-blue while its toolbar read dark-brown.
 * Readiness has to be announced by the side that knows.
 */
export function announceFrameReady(): void {
  toCanvas('ready')
}

/** Called in the canvas. Ignores anything not from a frame on this origin. */
export function onFrameRelease(handler: () => void): () => void {
  return onFrameMessage('release', () => true, handler)
}

/**
 * Fires when one specific frame's document starts listening. Frames all post to
 * the same window, so the sender is matched by identity rather than by name.
 */
export function onFrameReady(frame: () => Window | null, handler: () => void): () => void {
  return onFrameMessage('ready', (source) => source !== null && source === frame(), handler)
}

function onFrameMessage(
  type: FrameMessage['type'],
  accept: (source: MessageEventSource | null) => boolean,
  handler: () => void,
): () => void {
  function onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return

    const data = event.data as FrameMessage | undefined
    if (data?.source !== FRAME_MESSAGE_SOURCE || data.type !== type) return
    if (!accept(event.source)) return

    handler()
  }

  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

export const CANVAS_MESSAGE_SOURCE = 'prototype-playground-canvas'

export type CanvasMessage = {
  source: typeof CANVAS_MESSAGE_SOURCE
  type: 'appearance'
  appearance: Appearance
}

/**
 * Appearance travels back down to a live frame by message rather than by
 * rebuilding its `src`.
 *
 * Changing the URL would reload the document, and a reload discards the state
 * the prototype was in — the row you had expanded, the text you had typed, the
 * menu you had open. That state is usually *how* you noticed the defect, so
 * losing it to see the same screen in dark mode is losing the finding. It is
 * also what makes stepping through seven themes a usable gesture instead of
 * seven one-second reloads.
 *
 * The frame's URL still carries the appearance it opened in, so the standalone
 * link stays honest and shareable.
 */
export function pushAppearance(frame: Window | null, appearance: Appearance): void {
  if (!frame) return

  const message: CanvasMessage = { source: CANVAS_MESSAGE_SOURCE, type: 'appearance', appearance }
  frame.postMessage(message, window.location.origin)
}

/** Called inside a frame document. Validates the payload — a message is input. */
export function onAppearanceMessage(handler: (appearance: Appearance) => void): () => void {
  function onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return

    const data = event.data as CanvasMessage | undefined
    if (data?.source !== CANVAS_MESSAGE_SOURCE || data.type !== 'appearance') return

    const parsed = AppearanceSchema.safeParse(data.appearance)
    if (parsed.success) handler(parsed.data)
  }

  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}
