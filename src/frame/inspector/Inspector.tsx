import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { loadIndex, resolve, type ComponentHit } from './componentIndex'
import { componentChain, isComponentRoot } from './fiber'
import { measure } from './measure'
import { compose, type Annotation } from './report'

/**
 * Hold Alt to ask "what is this?", Alt-click to say something about it.
 *
 * A composition is where defects appear, and also where you stop being able to
 * name what you are looking at — a filter in a dashboard is a Select inside a
 * Toolbar inside a DataTable, and reading the view file to find out is the loop
 * this tool exists to remove.
 *
 * Alt is chosen over a toolbar toggle because there is no shell chrome inside a
 * frame, and because a mode you have to remember to leave is a mode you forget
 * you are in.
 *
 * It writes to the clipboard and nothing else. No file changes, nothing is
 * sent anywhere, and nothing survives a reload — the same standing the copy
 * button on document frames has.
 *
 * At a canvas zoom of 0.4 this chrome is unreadable, and deliberately so: it
 * lives inside the frame and scales with it. Zoom to the frame first, which is
 * what judging an interface requires anyway.
 */

type Target = {
  element: Element
  /** Null when the sandbox index does not recognise it: then it is ours. */
  hit: ComponentHit | null
  /** Pink when a component's own root, teal when the markup between them. */
  isComponent: boolean
  rect: DOMRect
}

type Draft = { target: Target; note: string }

export function Inspector({ sandbox }: { sandbox: string }) {
  const index = useRef<Map<string, ComponentHit> | null>(null)
  const [armed, setArmed] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [copied, setCopied] = useState(false)

  const point = useRef({ x: 0, y: 0 })
  const field = useRef<HTMLTextAreaElement>(null)

  // Markers are drawn at their elements' current rects, so anything that moves
  // an element has to redraw them.
  const [, redraw] = useReducer((n: number) => n + 1, 0)

  const describe = useCallback((element: Element | null): Target | null => {
    if (!element || !index.current) return null

    const found = resolve(element, index.current)
    const subject = found?.element ?? element

    return {
      element: subject,
      hit: found?.hit ?? null,
      // A Banhaten component always is one; ours has to be asked of the fiber,
      // because in the DOM it is just a div.
      isComponent: found !== null || isComponentRoot(subject),
      rect: subject.getBoundingClientRect(),
    }
  }, [])

  const update = useCallback(() => {
    setTarget(describe(document.elementFromPoint(point.current.x, point.current.y)))
  }, [describe])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Alt' || armed || draft) return
      setArmed(true)

      // Loading here rather than on mount keeps a frame nobody inspects free.
      if (index.current) {
        update()
      } else {
        loadIndex(sandbox).then((loaded) => {
          index.current = loaded
          update()
        })
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key !== 'Alt') return
      setArmed(false)
      setTarget(null)
    }

    function onMove(event: MouseEvent) {
      point.current = { x: event.clientX, y: event.clientY }
      if (event.altKey && !draft) update()
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
      setDraft({ target, note: '' })
      setArmed(false)
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
  }, [armed, draft, sandbox, target, update])

  useEffect(() => {
    if (annotations.length === 0) return

    window.addEventListener('scroll', redraw, true)
    window.addEventListener('resize', redraw)

    return () => {
      window.removeEventListener('scroll', redraw, true)
      window.removeEventListener('resize', redraw)
    }
  }, [annotations.length])

  useEffect(() => {
    if (draft) field.current?.focus()
  }, [draft])

  function save() {
    if (!draft) return

    const { element, hit } = draft.target

    setAnnotations((current) => [
      ...current,
      {
        id: current.length + 1,
        element,
        hit,
        chain: componentChain(element),
        measurement: measure(element),
        note: draft.note,
      },
    ])
    setDraft(null)
  }

  function copyAll() {
    navigator.clipboard.writeText(compose(annotations)).then(
      () => {
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
          setAnnotations([])
        }, 900)
      },
      () => setCopied(false),
    )
  }

  const showing = draft?.target ?? (armed ? target : null)

  if (!showing && annotations.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[2147483647]" aria-hidden="true">
      {showing && <Highlight target={showing} />}

      {annotations.map((annotation, order) => (
        <Marker key={annotation.id} index={order + 1} element={annotation.element} />
      ))}

      {draft && (
        <Field
          ref={field}
          draft={draft}
          onChange={(note) => setDraft({ ...draft, note })}
          onSave={save}
          onCancel={() => setDraft(null)}
        />
      )}

      {annotations.length > 0 && !draft && (
        <Bar
          count={annotations.length}
          copied={copied}
          onCopy={copyAll}
          onClear={() => setAnnotations([])}
        />
      )}
    </div>
  )
}

/** Pink for a component of any origin, teal for the markup between them. */
function tint(isComponent: boolean) {
  return isComponent
    ? { outline: 'outline-pink-500', fill: 'bg-pink-500' }
    : { outline: 'outline-teal-500', fill: 'bg-teal-500' }
}

function Highlight({ target }: { target: Target }) {
  const { rect, hit, isComponent, element } = target
  const colour = tint(isComponent)

  // Above the box when there is room, below it when the target is near the top.
  const below = rect.top < 34
  const chain = componentChain(element)
  const label = hit
    ? `${hit.component} · ${hit.file} · ${hit.token}`
    : (chain.at(-1) ?? 'layout')

  return (
    <>
      <div
        className={`absolute rounded-[3px] outline-2 outline-offset-1 ${colour.outline}`}
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />
      <div
        className={`absolute max-w-[520px] truncate rounded px-1.5 py-0.5 font-mono text-[11px] leading-4 text-white shadow-sm ${colour.fill}`}
        style={{
          left: Math.max(4, rect.left),
          top: below ? rect.bottom + 6 : Math.max(4, rect.top - 24),
        }}
      >
        {label}
      </div>
    </>
  )
}

function Marker({ index, element }: { index: number; element: Element }) {
  const rect = element.getBoundingClientRect()

  return (
    <>
      <div
        className="absolute rounded-[3px] outline-2 outline-offset-1 outline-pink-400/60"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />
      <div
        className="absolute flex size-4 items-center justify-center rounded-full bg-pink-500 font-mono text-[10px] leading-none text-white shadow"
        style={{ left: rect.left - 6, top: rect.top - 6 }}
      >
        {index}
      </div>
    </>
  )
}

function Field({
  ref,
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  ref: React.Ref<HTMLTextAreaElement>
  draft: Draft
  onChange: (note: string) => void
  onSave: () => void
  onCancel: () => void
}) {
  const { rect, hit, isComponent } = draft.target
  const colour = tint(isComponent)

  return (
    <div
      className="pointer-events-auto absolute w-72 rounded-lg border border-neutral-700 bg-neutral-900 p-2 shadow-xl"
      style={{ left: Math.max(4, rect.left), top: rect.bottom + 8 }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={`size-2 rounded-full ${colour.fill}`} />
        <span className="truncate font-mono text-[10px] text-neutral-400">
          {hit ? `BANHATEN · ${hit.component}` : `OURS · ${isComponent ? 'component' : 'layout'}`}
        </span>
      </div>

      <textarea
        ref={ref}
        value={draft.note}
        onChange={(event) => onChange(event.target.value)}
        // Escape is forwarded to the canvas to release the frame, which would
        // throw the note away along with the selection. It belongs to the field
        // while the field is open.
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onCancel()
          }
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onSave()
        }}
        placeholder="What is wrong with it?"
        rows={3}
        className="w-full resize-none rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-[12px] text-neutral-100 outline-none focus:border-neutral-500"
      />

      <div className="mt-1.5 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-100"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded bg-pink-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-pink-500"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function Bar({
  count,
  copied,
  onCopy,
  onClear,
}: {
  count: number
  copied: boolean
  onCopy: () => void
  onClear: () => void
}) {
  return (
    <div className="pointer-events-auto absolute bottom-3 left-3 flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1 shadow-xl">
      <span className="px-1.5 font-mono text-[11px] text-neutral-400">
        {count} {count === 1 ? 'note' : 'notes'}
      </span>
      <button
        type="button"
        onClick={onCopy}
        className="rounded bg-pink-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-pink-500"
      >
        {copied ? 'Copied' : 'Copy for your agent'}
      </button>
      <button
        type="button"
        onClick={onClear}
        title="Discard without copying"
        className="rounded px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-100"
      >
        Clear
      </button>
    </div>
  )
}
