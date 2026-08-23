import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { Check, Copy, Crosshair, Trash2, X } from 'lucide-react'
import { loadIndex, resolve, type ComponentHit } from './componentIndex'
import { componentChain, isComponentRoot } from './fiber'
import { measure } from './measure'
import { compose, type Annotation } from './report'

/**
 * Turn on inspect mode to ask "what is this?", then click to say something
 * about it.
 *
 * A composition is where defects appear, and also where you stop being able to
 * name what you are looking at — a filter in a dashboard is a Select inside a
 * Toolbar inside a DataTable, and reading the view file to find out is the loop
 * this tool exists to remove.
 *
 * This began as hold-Alt, on the reasoning that a mode you have to remember to
 * leave is a mode you forget you are in. A visible control answers that better
 * than an invisible shortcut did: the mode is on the screen, so there is nothing
 * to forget. Holding a modifier also made annotating a two-handed gesture for
 * something you do dozens of times in a sitting.
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
    if (!armed) return

    function onMove(event: MouseEvent) {
      point.current = { x: event.clientX, y: event.clientY }
      if (!draft) update()
    }

    /**
     * Inspect mode owns the click on the page — otherwise the prototype would
     * follow the link or submit the form you were only trying to point at,
     * which is the one thing a read-only tool must never cause.
     *
     * It does not own clicks on its own chrome, which it swallowed until this
     * check existed: copy and discard were unreachable while inspecting, and
     * only sometimes, because the guard above lets a click through whenever the
     * cursor happens to be over nothing resolvable. Intermittently dead buttons
     * are worse than dead ones.
     */
    function onClick(event: MouseEvent) {
      if (!target || draft) return
      if ((event.target as Element | null)?.closest('[data-inspector]')) return

      event.preventDefault()
      event.stopPropagation()
      setDraft({ target, note: '' })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick, true)
    }
  }, [armed, draft, target, update])

  /**
   * Escape closes whatever is open, innermost first, and never reaches the
   * canvas while this tool has something to close. Handled here rather than
   * only on the field because the field loses focus the moment you click
   * anything, and Escape has to work anyway — pressing it and having the whole
   * frame deselect instead, losing the note, is the worst outcome available.
   */
  useEffect(() => {
    if (!armed && !draft) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      event.stopPropagation()
      if (draft) setDraft(null)
      else setArmed(false)
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [armed, draft])

  // Losing the window while armed leaves a highlight stranded under a cursor
  // that is somewhere else entirely.
  useEffect(() => {
    function onBlur() {
      setTarget(null)
    }

    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [])

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

  function arm() {
    if (armed) {
      setArmed(false)
      setTarget(null)
      return
    }

    setArmed(true)
    // Loading here rather than on mount keeps a frame nobody inspects free.
    if (!index.current) loadIndex(sandbox).then((loaded) => (index.current = loaded))
  }

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

  /**
   * Copying does not clear. Emptying the list on copy loses the record of what
   * you asked for at exactly the moment you go and read the answer, and there
   * is then no way to check whether the reply addressed all of it. Clearing is
   * a separate, deliberate act.
   */
  function copyAll() {
    navigator.clipboard.writeText(compose(annotations)).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      },
      () => setCopied(false),
    )
  }

  const showing = draft?.target ?? (armed ? target : null)

  return (
    <div
      data-inspector=""
      className="pointer-events-none fixed inset-0 z-[2147483647]"
      aria-hidden="true"
    >
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

      <Bar
        armed={armed}
        count={annotations.length}
        copied={copied}
        onArm={arm}
        onCopy={copyAll}
        onClear={() => setAnnotations([])}
      />
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
        // Escape is caught on the window as well, so this only has to stop the
        // canvas from also hearing it and releasing the whole frame.
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.stopPropagation()
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) onSave()
        }}
        placeholder="What is wrong with it?  ·  Esc discards"
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

/**
 * Collapsed to a single button until there is something to do, then a pill.
 *
 * Bottom right, and out of the way on purpose: this is the tool's chrome
 * sitting on top of the thing being judged, so it should occupy as little of
 * the screen as it can while still being findable without being remembered.
 * Collapsed it is one button; the count, copy and discard only exist once there
 * is a note to count, copy or discard.
 */
function Bar({
  armed,
  count,
  copied,
  onArm,
  onCopy,
  onClear,
}: {
  armed: boolean
  count: number
  copied: boolean
  onArm: () => void
  onCopy: () => void
  onClear: () => void
}) {
  const expanded = armed || count > 0

  if (!expanded) {
    return (
      <div className="pointer-events-auto absolute right-4 bottom-4">
        <button
          type="button"
          onClick={onArm}
          title="Inspect"
          aria-label="Inspect"
          className="flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 shadow-xl transition-colors hover:text-neutral-100"
        >
          <Crosshair className="size-4" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <div className="pointer-events-auto absolute right-4 bottom-4 flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-1.5 shadow-xl">
      <IconButton
        label={armed ? 'Stop inspecting · Esc' : 'Inspect'}
        active={armed}
        onClick={onArm}
      >
        <Crosshair className="size-4" aria-hidden />
      </IconButton>

      {count > 0 && (
        <>
          <span className="px-1 font-mono text-[11px] text-neutral-500 tabular-nums">{count}</span>

          <IconButton label={copied ? 'Copied' : 'Copy for your agent'} onClick={onCopy}>
            {copied ? (
              <Check className="size-4 text-green-400" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
          </IconButton>

          <IconButton label="Discard all notes" onClick={onClear}>
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
        </>
      )}

      {armed && (
        <>
          <span aria-hidden className="mx-0.5 h-4 w-px bg-neutral-800" />
          <IconButton label="Stop inspecting · Esc" onClick={onArm}>
            <X className="size-4" aria-hidden />
          </IconButton>
        </>
      )}
    </div>
  )
}

function IconButton({
  children,
  label,
  active = false,
  onClick,
}: {
  children: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-full transition-colors ${
        active
          ? 'bg-pink-600 text-white hover:bg-pink-500'
          : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
      }`}
    >
      {children}
    </button>
  )
}
