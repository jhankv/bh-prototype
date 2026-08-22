import { useCallback, useEffect, useRef, useState } from 'react'
import { loadIndex, resolve, type ComponentHit } from './componentIndex'

/**
 * Hold Alt to ask "what component is this?".
 *
 * A composition is where defects appear, but a composition is also where you
 * stop being able to name what you are looking at — a filter in a dashboard is
 * a Select inside a Toolbar inside a DataTable, and reading the view file to
 * find out is exactly the loop this tool exists to remove.
 *
 * Strictly read-only. It highlights and it copies; it never changes the page.
 * Alt is chosen over a toolbar toggle because there is no shell chrome inside a
 * frame, and because a mode you have to remember to leave is a mode you forget
 * you are in.
 */

type Target = { hit: ComponentHit; rect: DOMRect }

export function Inspector({ sandbox }: { sandbox: string }) {
  const index = useRef<Map<string, ComponentHit> | null>(null)
  const [armed, setArmed] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [copied, setCopied] = useState(false)

  const point = useRef({ x: 0, y: 0 })

  const update = useCallback(() => {
    if (!index.current) return
    const element = document.elementFromPoint(point.current.x, point.current.y)
    const found = resolve(element, index.current)
    setTarget(found ? { hit: found.hit, rect: found.element.getBoundingClientRect() } : null)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Alt' || armed) return
      setArmed(true)
      // Loading here rather than on mount keeps a frame nobody inspects free.
      if (!index.current) {
        loadIndex(sandbox).then((loaded) => {
          index.current = loaded
          update()
        })
      } else {
        update()
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key !== 'Alt') return
      setArmed(false)
      setTarget(null)
      setCopied(false)
    }

    function onMove(event: MouseEvent) {
      point.current = { x: event.clientX, y: event.clientY }
      if (event.altKey) update()
    }

    // Alt+Tab and losing focus both leave the key "held" forever otherwise.
    function onBlur() {
      setArmed(false)
      setTarget(null)
    }

    function onClick(event: MouseEvent) {
      if (!event.altKey || !target) return
      event.preventDefault()
      event.stopPropagation()
      const line = `${target.hit.component} — ${target.hit.file} (${target.hit.token})`
      navigator.clipboard.writeText(line).then(
        () => setCopied(true),
        () => setCopied(false),
      )
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('blur', onBlur)
    window.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('click', onClick, true)
    }
  }, [armed, sandbox, target, update])

  if (!armed || !target) return null

  const { rect, hit } = target
  // Above the box when there is room, below it when the target is near the top.
  const below = rect.top < 34

  return (
    <div className="pointer-events-none fixed inset-0 z-[2147483647]" aria-hidden="true">
      <div
        className="absolute rounded-[3px] outline-2 outline-offset-1 outline-sky-500"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />
      <div
        className="absolute max-w-[520px] truncate rounded bg-sky-500 px-1.5 py-0.5 font-mono text-[11px] leading-4 text-white shadow-sm"
        style={{ left: Math.max(4, rect.left), top: below ? rect.bottom + 6 : Math.max(4, rect.top - 24) }}
      >
        {copied ? 'copied' : `${hit.component} · ${hit.file} · ${hit.token}`}
      </div>
    </div>
  )
}
