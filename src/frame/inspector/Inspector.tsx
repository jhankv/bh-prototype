import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import {
  Check,
  Copy,
  Crosshair as CrosshairIcon,
  Eraser,
  Plus,
  Ruler,
  SeparatorHorizontal,
  SeparatorVertical,
  Trash2,
  X,
} from 'lucide-react'
import {
  EDGE_LABEL,
  candidatesAt,
  gapsAround,
  nearest,
  spansOf,
  type Guide,
  type Side,
} from './align'
import { loadIndex, resolve, type ComponentHit } from './componentIndex'
import { componentChain, isComponentRoot } from './fiber'
import { measure } from './measure'
import { compose, type Annotation } from './report'
import { Crosshair, Distances, Guides, Locked, Spans, type Aim } from './Rulers'

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
 *
 * **Measure mode** is the second question the same overlay answers: not "what is
 * this" but "where does this line fall". A crosshair follows the cursor and
 * sticks to the edges and centres under it; clicking leaves the lines behind.
 * They accumulate, they cross the whole viewport, and the distance between them
 * is drawn — which is the whole job, because a guide down the middle of a button
 * is placed to find out what else does or does not land on it.
 *
 * It lives here rather than beside the Inspector because two full-screen
 * overlays both listening on `mousemove` and both swallowing clicks would spend
 * their lives negotiating over which one the pointer belonged to — and
 * everything a ruler needs is already built: the `elementFromPoint` loop, the
 * index that names what you are pointing at, the Escape chain, and the clipboard
 * report a finding has to end up in.
 *
 * It belongs inside the frame rather than on the canvas, and that is the whole
 * reason it is accurate. See the note at the top of `align.ts`.
 */

type Mode = 'identify' | 'measure'

/** Vertical line, horizontal line, or the corner where they cross. */
type PlaceAxis = 'x' | 'y' | 'both'

/** Placing a vertical guide is a question about horizontal room, and the reverse. */
const SIDES: Record<PlaceAxis, Side[]> = {
  x: ['left', 'right'],
  y: ['top', 'bottom'],
  both: ['left', 'right', 'top', 'bottom'],
}

type Target = {
  element: Element
  /** Null when the sandbox index does not recognise it: then it is ours. */
  hit: ComponentHit | null
  /** Pink when a component's own root, blue when the markup between them. */
  isComponent: boolean
  rect: DOMRect
}

type Draft = { target: Target; note: string }

export function Inspector({ sandbox }: { sandbox: string }) {
  const index = useRef<Map<string, ComponentHit> | null>(null)

  /** Whether the tool is on screen at all. */
  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)

  /**
   * Identify answers "what is this"; measure answers "where does this line fall";
   * null is neither, and it is what used to be a pause button.
   *
   * The middle state is real and has to exist: notes and guides still on screen
   * while the prototype takes its own clicks again, which is most of what you do
   * between one finding and the next. It was a separate control for a while, and
   * that was one concept too many — "which tool" and "is a tool running" are the
   * same question asked twice, and answering it twice let them disagree. Pressing
   * the running tool's own icon puts it down.
   *
   * `aim` is the crosshair and lives only as long as the cursor is over the
   * page; `guides` are the lines left behind, and they are coordinates rather
   * than elements. Holding an element would have been tidier and wrong: you
   * place a guide on the button's centre to find out what *else* sits on that
   * line, so the moment it is placed it stops belonging to the button.
   */
  const [mode, setMode] = useState<Mode | null>('identify')
  const armed = open && mode !== null
  const [aim, setAim] = useState<Aim | null>(null)
  const [guides, setGuides] = useState<Guide[]>([])

  /**
   * Which line a click leaves behind.
   *
   * It used to leave both, every time, on the reasoning that a crosshair is what
   * you were steering. That was the tool answering a question nobody asked:
   * checking that a column of buttons shares a left edge needs one vertical
   * line, and the horizontal one that came with it had to be undone every time.
   * PixelSnap adds horizontal and vertical guides as separate acts for the same
   * reason.
   *
   * It is a visible control rather than a held modifier because this tool
   * already decided that argument once — see the note on hold-Alt above. Both is
   * still offered: lining a card up against a corner wants two lines at once,
   * and making that two clicks would be its own small tax.
   */
  const [placeAxis, setPlaceAxis] = useState<PlaceAxis>('x')

  const [draft, setDraft] = useState<Draft | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [copied, setCopied] = useState(false)

  const point = useRef({ x: 0, y: 0 })
  const field = useRef<HTMLTextAreaElement>(null)

  /**
   * One measurement per frame, not one per mouse event.
   *
   * A pointer fires far more often than the screen repaints, and the work behind
   * the crosshair — snapping, and four rays looking for what is beside the box —
   * is a few milliseconds. Run per event it saturates the main thread and the
   * page stops responding to anything, including the mouse that is causing it.
   * Nothing is lost by coalescing: the answer is only ever read when it is drawn.
   *
   * A timeout races the frame, which is not belt-and-braces. `requestAnimationFrame`
   * does not fire at all in a hidden tab — the same defect that once left a
   * background canvas at scale 1 with nothing mounted — and the flag guarding
   * against a second schedule is only cleared by the callback. Switch tabs
   * mid-hover with a frame outstanding and it is never cleared, so the crosshair
   * is dead for the rest of the session. Whichever fires first cancels the other.
   */
  const pending = useRef<{ frame: number; timer: number } | null>(null)

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
    const { x, y } = point.current
    const element = document.elementFromPoint(x, y)

    // Otherwise the tool highlights its own toolbar and offers to annotate it,
    // which is both useless and, briefly, quite funny.
    if (element?.closest('[data-inspector]')) {
      setTarget(null)
      setAim(null)
      return
    }

    setTarget(describe(element))

    if (mode !== 'measure') {
      setAim(null)
      return
    }

    /**
     * Each axis snaps on its own, and that is not an accident of the loop.
     * Locking a crosshair only when both axes find something would make the one
     * gesture people actually perform — running down a column to check a left
     * edge — impossible, because nothing in the vertical direction is near
     * anything as you pass between two rows.
     */
    const candidates = candidatesAt(x, y)
    const snapX = nearest(candidates, 'x', x)
    const snapY = nearest(candidates, 'y', y)

    // When both axes caught the same box, that is unambiguously the box. When
    // they caught different ones, the horizontal lock is the one people were
    // steering — a vertical edge is what you aim at when you aim at a column.
    /**
     * Snapping decides where the lines go; it does not decide what box is being
     * measured. Tying the two together meant the distances only appeared while
     * the cursor was within six pixels of an edge — so hovering the middle of a
     * button, which is what hovering a button means, measured nothing at all.
     *
     * With no snap it falls back to whatever is under the cursor, unresolved.
     * `describe` would climb to the nearest component and measure a box the
     * cursor is not on; here the deepest element is the one you can see.
     */
    const locked = snapX?.element ?? snapY?.element ?? element

    setAim({
      x: snapX?.at ?? x,
      y: snapY?.at ?? y,
      snapX,
      snapY,
      element: locked,
      // Measured here rather than in render: it changes when the cursor moves,
      // and every other render — a note saved, a guide placed — would redo it.
      // Only the sides the overlay is about to draw; see `gapsAround`.
      gaps: locked ? gapsAround(locked, SIDES[placeAxis]) : [],
    })
  }, [describe, mode, placeAxis])

  useEffect(() => {
    if (!armed) return

    function run() {
      if (pending.current) {
        cancelAnimationFrame(pending.current.frame)
        clearTimeout(pending.current.timer)
        pending.current = null
      }
      update()
    }

    function onMove(event: MouseEvent) {
      point.current = { x: event.clientX, y: event.clientY }
      if (draft || pending.current) return

      pending.current = { frame: requestAnimationFrame(run), timer: window.setTimeout(run, 32) }
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
      if (draft) return
      if ((event.target as Element | null)?.closest('[data-inspector]')) return

      /**
       * Measure mode does not need a target, and identify mode does. A guide is
       * a coordinate, so it can be dropped over blank page — which is exactly
       * where you drop one when the thing you are lining up against is a margin.
       */
      if (mode === 'measure') {
        if (!aim) return

        event.preventDefault()
        event.stopPropagation()

        // Both lines land, because a crosshair is what you were steering. An
        // axis that snapped to nothing still leaves a guide: a line placed where
        // you want it is legitimate, it just cannot claim to be on anything.
        // Named by the exact box the line landed on, not by the nearest
        // component above it — see `lockedName`.
        const origin = (snap: (typeof aim)['snapX']) =>
          snap ? `${lockedName(snap.element, index.current) ?? 'layout'} ${EDGE_LABEL[snap.edge]}` : null

        setGuides((current) => {
          let id = current.length > 0 ? Math.max(...current.map((guide) => guide.id)) : 0

          /**
           * A line already on this coordinate is not placed twice.
           *
           * Two guides at the same place draw as one and leave a span of zero
           * between them — a measurement the tool invented, sitting on the
           * screen looking exactly like one it took. Dropping a second crosshair
           * on a row you already marked is normal, not an error, so this is
           * silent.
           */
          const taken = (axis: Guide['axis'], at: number) =>
            current.some((guide) => guide.axis === axis && Math.abs(guide.at - at) < 0.5)

          const placed = [...current]
          if (placeAxis !== 'y' && !taken('x', aim.x)) {
            id += 1
            placed.push({ id, axis: 'x', at: aim.x, origin: origin(aim.snapX) })
          }
          if (placeAxis !== 'x' && !taken('y', aim.y)) {
            id += 1
            placed.push({ id, axis: 'y', at: aim.y, origin: origin(aim.snapY) })
          }

          return placed
        })
        return
      }

      if (!target) return

      event.preventDefault()
      event.stopPropagation()
      setDraft({ target, note: '' })
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click', onClick, true)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick, true)
      if (pending.current) {
        cancelAnimationFrame(pending.current.frame)
        clearTimeout(pending.current.timer)
        pending.current = null
      }
    }
  }, [aim, armed, describe, draft, mode, placeAxis, target, update])

  /**
   * Escape closes whatever is open, innermost first, and never reaches the
   * canvas while this tool has something to close. Handled here rather than
   * only on the field because the field loses focus the moment you click
   * anything, and Escape has to work anyway — pressing it and having the whole
   * frame deselect instead, losing the note, is the worst outcome available.
   */
  useEffect(() => {
    if (!open && !draft) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return

      event.stopPropagation()
      /**
       * Innermost first, and a guide is a rung of its own — one per press, most
       * recent first, because the line you want back is nearly always the one
       * you just put down. Escape clearing all of them would make one misplaced
       * guide cost the five that were right.
       */
      if (draft) setDraft(null)
      else if (guides.length > 0) setGuides((current) => current.slice(0, -1))
      else collapse()
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [open, draft, guides.length])

  /**
   * The axis is switched more often than anything else here — a column check
   * then a baseline check is two guides and one switch — so it gets keys as well
   * as buttons. Matched on `code`, the physical key, for the reason the canvas
   * shortcuts are: a binding to the character stops existing when someone
   * changes keyboard layout.
   *
   * Never while a note is open, where these are just letters someone is typing.
   */
  useEffect(() => {
    if (!open || mode !== 'measure' || draft) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const next = { KeyV: 'x', KeyH: 'y', KeyB: 'both' }[event.code] as PlaceAxis | undefined
      if (!next) return

      event.preventDefault()
      setPlaceAxis(next)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, mode, draft])

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

  /**
   * Opening always hands back a running tool.
   *
   * Whichever mode was last used comes back with it; only a session that was put
   * down mid-flight reopens on identify, because a bar with neither tool lit is
   * a bar you have to press twice to use.
   */
  function expand() {
    setOpen(true)
    setMode((current) => current ?? 'identify')
    // Loading here rather than on mount keeps a frame nobody inspects free.
    if (!index.current) loadIndex(sandbox).then((loaded) => (index.current = loaded))
  }

  /**
   * Collapsing keeps the notes and hides them. They are still there when you
   * come back — losing work to tidying the screen would make tidying the screen
   * a decision, and it should not be one.
   */
  function collapse() {
    setOpen(false)
    setTarget(null)
    setDraft(null)
    setAim(null)
  }

  /**
   * Switching modes keeps the guides on screen.
   *
   * They are work — you placed each one — and the reason to switch is usually to
   * name the thing a guide just caught, which is the one moment losing them
   * would hurt most. Only the crosshair goes, because it is where the cursor is
   * and the cursor is about to be somewhere else.
   *
   * Pressing the mode already running stops it rather than doing nothing. That
   * is the whole of what the pause button used to be, spent on no extra pixels
   * and no second idea: the control that says which tool is running is the same
   * one that says a tool is running.
   */
  function changeMode(next: Mode) {
    setMode(next === mode ? null : next)
    setTarget(null)
    setAim(null)
    setDraft(null)
  }

  function save() {
    if (!draft) return

    const { element, hit, isComponent } = draft.target

    setAnnotations((current) => [
      ...current,
      {
        id: current.length + 1,
        element,
        isComponent,
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
    navigator.clipboard.writeText(compose(annotations, { guides, spans: spansOf(guides) })).then(
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
      {/* Guides outlive the mode that placed them, so they draw either way. */}
      {open && guides.length > 0 && (
        <>
          <Guides guides={guides} />
          <Spans spans={spansOf(guides)} at={mode === 'measure' ? aim : null} />
        </>
      )}

      {mode === 'measure' && armed && aim && (
        <>
          {aim.element && <Locked element={aim.element} />}
          <Distances gaps={aim.gaps} axis={placeAxis} />
          <Crosshair aim={aim} name={lockedName(aim.element, index.current)} axis={placeAxis} />
        </>
      )}

      {/* The identify highlight would fight the crosshair for the same box. */}
      {mode === 'identify' && showing && <Highlight target={showing} />}

      {/* Hidden while collapsed: the markers sit on top of the interface being
          judged, so putting the tool away has to put them away too. */}
      {open &&
        annotations.map((annotation, order) => (
          <Marker
            key={annotation.id}
            index={order + 1}
            element={annotation.element}
            isComponent={annotation.isComponent}
          />
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
        open={open}
        mode={mode}
        onMode={changeMode}
        placeAxis={placeAxis}
        onPlaceAxis={setPlaceAxis}
        placing={mode === 'measure' && guides.length === 0}
        guideCount={guides.length}
        onClearGuides={() => setGuides([])}
        count={annotations.length}
        copied={copied}
        onExpand={expand}
        onCollapse={collapse}
        onCopy={copyAll}
        onClear={() => setAnnotations([])}
      />
    </div>
  )
}

/**
 * How the reference is named in the report.
 *
 * The file comes along when Banhaten recognises it, because "vs Button" and
 * "vs Button (components/ui/button.tsx)" are different amounts of help to a
 * reader who has the design system open and does not have this screen.
 */
/**
 * Names the box the crosshair caught, without going through `describe`.
 *
 * `describe` walks up to the nearest indexed ancestor, which is right for "what
 * am I pointing at" and wrong here: the crosshair already chose an exact box,
 * and resolving away from it would label the guide with something it is not on.
 *
 * The slot wins over the component name, which reads worse and is the reason to
 * do it. A Banhaten button and the text inside it are both "Button" to the
 * index, so two guides 8px apart both came back `Button top` — the tool
 * reporting the same name for two different edges is the tool refusing to answer
 * the question it was opened for. `button-label top` is uglier and true, and it
 * is also the string you would grep the design system for.
 */
function lockedName(element: Element | null, index: Map<string, ComponentHit> | null): string | null {
  if (!element) return null

  const slot = element.getAttribute('data-slot')
  if (slot && index?.has(slot)) return slot

  return componentChain(element).at(-1) ?? null
}

/** Pink for a component of any origin, blue for the markup between them. */
function tint(isComponent: boolean) {
  return isComponent
    ? {
        outline: 'outline-pink-500',
        faded: 'outline-pink-400/60',
        fill: 'bg-pink-500',
      }
    : {
        outline: 'outline-blue-500',
        faded: 'outline-blue-400/60',
        fill: 'bg-blue-500',
      }
}

function Highlight({ target }: { target: Target }) {
  const { rect, hit, isComponent, element } = target
  const colour = tint(isComponent)
  const label_ = useRef<HTMLDivElement>(null)

  // Above the box when there is room, below it when the target is near the top.
  const below = rect.top < 34
  const chain = componentChain(element)
  const label = hit
    ? `${hit.component} · ${hit.file} · ${hit.token}`
    : (chain.at(-1) ?? 'layout')

  // Unlike the note field, this box has no fixed width — it truncates at
  // max-w-[520px] but a short label renders far narrower — so the right edge
  // can only be clamped after the browser has laid the text out.
  useLayoutEffect(() => {
    const node = label_.current
    if (!node) return
    const left = Math.min(Math.max(4, rect.left), window.innerWidth - node.offsetWidth - 4)
    node.style.left = `${left}px`
  })

  return (
    <>
      <div
        className={`absolute rounded-[3px] outline-2 outline-offset-1 ${colour.outline}`}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        ref={label_}
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

/**
 * A saved note keeps the colour its element had when it was picked.
 *
 * Marking every note in one colour was the first version and it quietly undid
 * the distinction: you could see that something was a component while choosing
 * it, and then not see it afterwards, which is exactly when you are reading
 * back what you selected.
 */
function Marker({
  index,
  element,
  isComponent,
}: {
  index: number
  element: Element
  isComponent: boolean
}) {
  const rect = element.getBoundingClientRect()
  const colour = tint(isComponent)

  return (
    <>
      <div
        className={`absolute rounded-[3px] outline-2 outline-offset-1 ${colour.faded}`}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        className={`absolute flex size-4 items-center justify-center rounded-full font-mono text-[10px] leading-none text-white shadow ${colour.fill}`}
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

  // Fixed w-72 (288px): clamp against the right edge too, or a target near it
  // pushes the box off-screen — there is nowhere left to type the note.
  const width = 288
  const left = Math.min(Math.max(4, rect.left), window.innerWidth - width - 4)

  return (
    <div
      className="pointer-events-auto absolute w-72 rounded-lg border border-neutral-700 bg-neutral-900 p-2 shadow-xl"
      style={{ left, top: rect.bottom + 8 }}
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
 * Collapsed to a single button, expanded to a pill.
 *
 * Bottom right and out of the way on purpose: this is the tool's chrome sitting
 * on top of the thing being judged, so it should occupy as little of the screen
 * as it can while still being findable without being remembered.
 *
 * Pause rather than an on/off toggle, because turning it off to click something
 * would also put away the notes already taken. Paused, the notes stay on screen
 * and the prototype takes its own clicks again — which is most of what you do
 * between one note and the next.
 *
 * One button closes, and closing is collapsing. Two controls for "stop" and
 * "put away" would be two ways to describe the same intention.
 */
/**
 * Collapsed to a single button, expanded to a pill in three parts.
 *
 * The parts are the whole point of its shape. First the two modes, which are
 * what the tool *is* doing. Then whatever that mode owns — the guide axes belong
 * to the ruler and appear with it. Then the things that are true of the session
 * whatever mode it is in: pause, copy, discard, close.
 *
 * It used to run them together, and the cost was exactly one button: pause sat
 * between the ruler and its axes wearing the same filled pill the active mode
 * wears, so it read as a third mode. A filled button in a row of filled buttons
 * is a claim of the same kind as its neighbours, whatever the icon says.
 *
 * Pause is gone entirely now, and nothing replaced it. Pressing the lit mode
 * puts it down — so "which tool" and "is a tool running" are one control instead
 * of two that could contradict each other, and neither lit means the notes and
 * guides are still on screen while the prototype takes its own clicks again.
 *
 * Bottom right and out of the way on purpose: this is the tool's chrome sitting
 * on top of the thing being judged, so it should occupy as little of the screen
 * as it can while still being findable without being remembered.
 */
function Bar({
  open,
  mode,
  onMode,
  placeAxis,
  onPlaceAxis,
  placing,
  guideCount,
  onClearGuides,
  count,
  copied,
  onExpand,
  onCollapse,
  onCopy,
  onClear,
}: {
  open: boolean
  /** Null when neither tool is running — what the pause button used to mean. */
  mode: Mode | null
  onMode: (mode: Mode) => void
  placeAxis: PlaceAxis
  onPlaceAxis: (axis: PlaceAxis) => void
  placing: boolean
  guideCount: number
  onClearGuides: () => void
  count: number
  copied: boolean
  onExpand: () => void
  onCollapse: () => void
  onCopy: () => void
  onClear: () => void
}) {
  if (!open) {
    return (
      <div className="pointer-events-auto absolute right-4 bottom-4">
        <button
          type="button"
          onClick={onExpand}
          title={count > 0 ? `Inspect · ${count} kept` : 'Inspect'}
          aria-label={
            count > 0 ? `Inspect, ${count} ${count === 1 ? 'note' : 'notes'} kept` : 'Inspect'
          }
          className="relative flex size-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 shadow-xl transition-colors hover:text-neutral-100"
        >
          <CrosshairIcon className="size-4" aria-hidden />

          {/* Notes are hidden while collapsed, so without this there is nothing
              to say they still exist. */}
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 font-mono text-[10px] leading-4 text-white tabular-nums">
              {count}
            </span>
          )}
        </button>
      </div>
    )
  }

  const kept = count > 0 || guideCount > 0

  return (
    <>
      {/* An unexplained mode is one people click out of rather than learn. It
          says what the click does until the first guide proves it landed. */}
      {placing && (
        <div className="pointer-events-none absolute right-4 bottom-16 rounded-md bg-violet-600 px-2 py-1 text-[11px] text-white shadow-lg">
          Click to leave a guide · V vertical · H horizontal · B both
        </div>
      )}

      <div className="pointer-events-auto absolute right-4 bottom-4 flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-1.5 shadow-xl">
        {/* Two modes, one of them always on. Each wears the colour of what it
            draws — pink is the identify highlight, violet is a guide — so the
            bar and the overlay agree without anyone reading a label. */}
        <IconButton
          label={mode === 'identify' ? 'Inspecting · click to stop' : 'Inspect · what is this'}
          active={mode === 'identify'}
          tone="pink"
          onClick={() => onMode('identify')}
        >
          <CrosshairIcon className="size-4" aria-hidden />
        </IconButton>
        <IconButton
          label={mode === 'measure' ? 'Ruling · click to stop' : 'Rule · place guides and measure'}
          active={mode === 'measure'}
          tone="violet"
          onClick={() => onMode('measure')}
        >
          <Ruler className="size-4" aria-hidden />
        </IconButton>

        {/* The ruler's own controls, and they arrive with it. In identify mode
            they would be three buttons for a mode nobody is in. */}
        {mode === 'measure' && (
          <>
            <Divider />

            <IconButton
              label="Vertical guide · V"
              active={placeAxis === 'x'}
              tone="violet"
              onClick={() => onPlaceAxis('x')}
            >
              <SeparatorVertical className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Horizontal guide · H"
              active={placeAxis === 'y'}
              tone="violet"
              onClick={() => onPlaceAxis('y')}
            >
              <SeparatorHorizontal className="size-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Both · B"
              active={placeAxis === 'both'}
              tone="violet"
              onClick={() => onPlaceAxis('both')}
            >
              <Plus className="size-4" aria-hidden />
            </IconButton>

            {guideCount > 0 && (
              <>
                <span className="px-1 font-mono text-[11px] text-neutral-500 tabular-nums">
                  {guideCount}
                </span>
                <IconButton label="Clear guides" onClick={onClearGuides}>
                  <Eraser className="size-4" aria-hidden />
                </IconButton>
              </>
            )}
          </>
        )}

        {/* Everything from here is true of the session, not of a mode. The
            divider comes with them: with nothing kept yet the bar would
            otherwise end on a rule with nothing after it. */}
        {kept && (
          <>
            <Divider />

            {count > 0 && (
              <span className="px-1 font-mono text-[11px] text-neutral-500 tabular-nums">
                {count}
              </span>
            )}

            <IconButton label={copied ? 'Copied' : 'Copy for your agent'} onClick={onCopy}>
              {copied ? (
                <Check className="size-4 text-green-400" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
            </IconButton>

            {count > 0 && (
              <IconButton label="Discard all notes" onClick={onClear}>
                <Trash2 className="size-4" aria-hidden />
              </IconButton>
            )}
          </>
        )}

        <Divider />

        <IconButton label="Close · Esc" onClick={onCollapse}>
          <X className="size-4" aria-hidden />
        </IconButton>
      </div>
    </>
  )
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-4 w-px bg-neutral-800" />
}

function IconButton({
  children,
  label,
  active = false,
  tone = 'pink',
  onClick,
}: {
  children: React.ReactNode
  label: string
  active?: boolean
  /** Matches whatever the button turns on, so the chrome and the overlay agree. */
  tone?: 'pink' | 'violet' | 'amber'
  onClick: () => void
}) {
  const on = {
    pink: 'bg-pink-600 hover:bg-pink-500',
    violet: 'bg-violet-600 hover:bg-violet-500',
    // Amber is not a mode colour anywhere else, which is the point: the only
    // thing that wears it is a tool that has stopped listening.
    amber: 'bg-amber-600 hover:bg-amber-500',
  }[tone]

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex size-7 items-center justify-center rounded-full transition-colors ${
        active ? `text-white ${on}` : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
      }`}
    >
      {children}
    </button>
  )
}
