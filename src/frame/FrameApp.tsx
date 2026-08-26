import {
  Suspense,
  lazy,
  useEffect,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { applyAppearance, appearanceFromSearch, appearanceToParams } from '@/lib/appearance'
import { isDocument, type Appearance } from '@/lib/schema'
import { DesignSystemProvider } from '@/ds'
import { availableSandboxes } from '@/ds/registry'
import {
  announceFrameReady,
  forwardShortcutsToCanvas,
  onAppearanceMessage,
} from '@/lib/frameMessages'
import { CopyHandoff } from './CopyHandoff'
import { StandaloneToolbar } from './StandaloneToolbar'
import { Inspector } from './inspector/Inspector'
import { ErrorBoundary } from './ErrorBoundary'
import { FrameError } from './FrameError'

/** Views load on demand — a canvas should not pay for frames nobody opened. */
const viewModules = import.meta.glob('/prototypes/*/views/**/*.tsx')

/**
 * lazy() must be called outside render. Creating it during a render — even
 * memoised — makes the component identity a render-time value, and React resets
 * its state whenever that identity changes. Cached by path instead, so a view
 * keeps its state across re-renders of the frame around it.
 */
const lazyViews = new Map<string, LazyExoticComponent<ComponentType>>()

function viewFor(path: string): LazyExoticComponent<ComponentType> | null {
  const loader = viewModules[path]
  if (!loader) return null

  const cached = lazyViews.get(path)
  if (cached) return cached

  const View = lazy(loader as () => Promise<{ default: ComponentType }>)
  lazyViews.set(path, View)
  return View
}

/** Documents are small; loading their source eagerly keeps rendering synchronous. */
const documentModules = import.meta.glob<string>('/prototypes/*/documents/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * An audit document is MDX, so it compiles to a component and cannot be handed
 * to react-markdown. It is loaded twice on purpose: compiled, to render, and
 * raw, so the copy button can hand a human-readable source to another agent. A
 * compiled module is useless to the thing on the other end of that clipboard.
 */
const auditModules = import.meta.glob('/prototypes/*/documents/*.mdx')

const auditSources = import.meta.glob<string>('/prototypes/*/documents/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const lazyAudits = new Map<string, LazyExoticComponent<ComponentType>>()

function auditFor(path: string): LazyExoticComponent<ComponentType> | null {
  const loader = auditModules[path]
  if (!loader) return null

  const cached = lazyAudits.get(path)
  if (cached) return cached

  const Audit = lazy(loader as () => Promise<{ default: ComponentType }>)
  lazyAudits.set(path, Audit)
  return Audit
}

export function FrameApp({ sandboxError }: { sandboxError: string | null }) {
  useEffect(forwardShortcutsToCanvas, [])

  const search = new URLSearchParams(window.location.search)
  const project = search.get('project') ?? ''
  const src = search.get('src') ?? ''
  const sandbox = search.get('sandbox') ?? 'none'

  /**
   * The URL sets the appearance this document opens in; the canvas can change
   * it afterwards without reloading, so it has to be state rather than a value
   * read straight out of the search params on every render.
   */
  const [appearance, setAppearance] = useState(() => appearanceFromSearch(search))

  useEffect(() => {
    const stopListening = onAppearanceMessage(setAppearance)
    announceFrameReady()
    return stopListening
  }, [])

  applyAppearance(document.documentElement, appearance)

  /**
   * Standalone means this document is the top one — opened from the project
   * page or from the canvas toolbar's open-in-a-tab link. There is no canvas
   * above it, so nothing will ever send it an appearance, and it has to carry
   * its own controls.
   */
  const standalone = window.parent === window

  // A document frame renders prose, not a design system: nothing to theme, and
  // no Arabic version of an English findings note.
  const themeable = !isDocument(src) && sandbox !== 'none'
  const sandboxes = themeable ? availableSandboxes() : []

  function urlWith(next: Appearance, nextSandbox: string): string {
    const params = new URLSearchParams({
      project,
      src,
      sandbox: nextSandbox,
      ...appearanceToParams(next),
    })
    return `${window.location.pathname}?${params.toString()}`
  }

  /**
   * Mode, theme and radius are token swaps: the re-render already shows the new
   * state, so the URL is corrected in place rather than navigated.
   *
   * Keeping it in step is the point. The URL is what you copy out of the
   * address bar, and a link that reopens a different screen than the one you
   * were looking at when you copied it is worse than no link at all.
   */
  function changeAppearance(next: Appearance) {
    setAppearance(next)
    window.history.replaceState(null, '', urlWith(next, sandbox))
  }

  /**
   * Direction and sandbox reload instead, and neither is a shortcut.
   *
   * Direction has to: `useCopy` in `src/copy.ts` reads `dir` off
   * `window.location.search`, not off React state, so a frame flipped without a
   * reload renders an RTL layout still carrying English copy — the toolbar
   * saying one thing and the pixels another, which is the worst failure this
   * tool has. Sandbox has to for the reason the canvas reloads too: a different
   * design system is a different stylesheet, and only a fresh document loads
   * one.
   *
   * `replace` rather than `assign`, so Back returns you to wherever you opened
   * the prototype from instead of walking you backwards through your own
   * toggling.
   */
  function reloadWith(next: Appearance, nextSandbox: string) {
    window.location.replace(urlWith(next, nextSandbox))
  }

  /* The standalone toolbar floats over the bottom of the document, so a
     scrolling prose frame needs room under its last line or the bar sits on it. */
  const prosePadding = standalone ? 'pt-10 pb-24' : 'py-10'

  const toolbar = standalone && (
    <StandaloneToolbar
      title={src}
      projectHref={`/p/${project}`}
      appearance={appearance}
      onAppearance={changeAppearance}
      sandbox={sandbox}
      sandboxes={sandboxes}
      onSandbox={(next) => reloadWith(appearance, next)}
      themeable={themeable}
      onDirection={(dir) => reloadWith({ ...appearance, dir }, sandbox)}
    />
  )

  if (sandboxError) {
    return (
      <>
        {toolbar}
        <FrameError title="Sandbox unavailable" detail={sandboxError} />
      </>
    )
  }

  const path = `/prototypes/${project}/${src}`

  if (isDocument(src)) {
    if (path.endsWith('.mdx')) {
      const Audit = auditFor(path)
      const raw = auditSources[path]

      if (!Audit || raw === undefined) {
        return <FrameError title="Audit not found" detail={path} />
      }

      return (
        <>
          {toolbar}
          <CopyHandoff markdown={raw} source={`${project}/${src}`} />
          <ErrorBoundary>
            <article className={`prose-frame mx-auto max-w-3xl px-8 ${prosePadding}`}>
              <Suspense fallback={null}>
                {/* Same as View below: auditFor caches by path at module level,
                    so the identity is stable across renders and the rule cannot
                    see through the lookup. */}
                {/* eslint-disable-next-line react-hooks/static-components */}
                <Audit />
              </Suspense>
            </article>
          </ErrorBoundary>
        </>
      )
    }

    const source = documentModules[path]
    if (source === undefined) {
      return <FrameError title="Document not found" detail={path} />
    }
    return (
      <>
        {toolbar}
        <CopyHandoff markdown={source} source={`${project}/${src}`} />
        <article className={`prose-frame mx-auto max-w-2xl px-8 ${prosePadding}`}>
          <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
        </article>
      </>
    )
  }

  return (
    <>
      {toolbar}
      <ViewFrame path={path} sandbox={sandbox} />
    </>
  )
}

function ViewFrame({ path, sandbox }: { path: string; sandbox: string }) {
  const View = viewFor(path)

  if (!View) {
    return (
      <FrameError
        title="View not found"
        detail={`${path} — known views: ${Object.keys(viewModules).join(', ') || 'none'}`}
      />
    )
  }

  // View comes from a module-level cache keyed by path (see viewFor), so its
  // identity is stable across renders. The rule cannot see through the lookup.
  // eslint-disable-next-line react-hooks/static-components
  const view = <View />

  // "none" is a view with no design system — the shell's own smoke tests.
  const content =
    sandbox === 'none' ? (
      view
    ) : (
      <DesignSystemProvider sandbox={sandbox}>{view}</DesignSystemProvider>
    )

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>{content}</Suspense>
      {/* Nothing to identify in a frame with no design system. */}
      {sandbox !== 'none' && <Inspector sandbox={sandbox} />}
    </ErrorBoundary>
  )
}
