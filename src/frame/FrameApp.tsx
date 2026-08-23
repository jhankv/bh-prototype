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
import { applyAppearance, appearanceFromSearch } from '@/lib/appearance'
import { isDocument } from '@/lib/schema'
import { DesignSystemProvider } from '@/ds'
import {
  announceFrameReady,
  forwardShortcutsToCanvas,
  onAppearanceMessage,
} from '@/lib/frameMessages'
import { CopyHandoff } from './CopyHandoff'
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

  /**
   * The URL sets the appearance this document opens in; the canvas can change
   * it afterwards without reloading, so it has to be state rather than a value
   * read straight out of the search params on every render.
   */
  const [appearance, setAppearance] = useState(() =>
    appearanceFromSearch(new URLSearchParams(window.location.search)),
  )

  useEffect(() => {
    const stopListening = onAppearanceMessage(setAppearance)
    announceFrameReady()
    return stopListening
  }, [])

  applyAppearance(document.documentElement, appearance)

  if (sandboxError) {
    return <FrameError title="Sandbox unavailable" detail={sandboxError} />
  }

  const search = new URLSearchParams(window.location.search)
  const project = search.get('project') ?? ''
  const src = search.get('src') ?? ''
  const sandbox = search.get('sandbox') ?? 'none'

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
          <CopyHandoff markdown={raw} source={`${project}/${src}`} />
          <ErrorBoundary>
            <article className="prose-frame mx-auto max-w-3xl px-8 py-10">
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
        <CopyHandoff markdown={source} source={`${project}/${src}`} />
        <article className="prose-frame mx-auto max-w-2xl px-8 py-10">
          <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
        </article>
      </>
    )
  }

  return <ViewFrame path={path} sandbox={sandbox} />
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
