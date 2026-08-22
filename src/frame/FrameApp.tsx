import { Suspense, lazy, useEffect, type ComponentType, type LazyExoticComponent } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { applyAppearance, appearanceFromSearch } from '@/lib/appearance'
import { DesignSystemProvider } from '@/ds'
import { forwardEscapeToCanvas } from '@/lib/frameMessages'
import { ErrorBoundary } from './ErrorBoundary'
import { FrameError } from './FrameError'

/** Views load on demand — a canvas should not pay for frames nobody opened. */
const viewModules = import.meta.glob('/prototypes/*/views/*.tsx')

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

export function FrameApp({ sandboxError }: { sandboxError: string | null }) {
  useEffect(forwardEscapeToCanvas, [])

  if (sandboxError) {
    return <FrameError title="Sandbox unavailable" detail={sandboxError} />
  }

  const search = new URLSearchParams(window.location.search)
  const project = search.get('project') ?? ''
  const type = search.get('type') ?? 'view'
  const src = search.get('src') ?? ''
  const sandbox = search.get('sandbox') ?? 'none'
  const appearance = appearanceFromSearch(search)

  applyAppearance(document.documentElement, appearance)

  const path = `/prototypes/${project}/${src}`

  if (type === 'document') {
    const source = documentModules[path]
    if (source === undefined) {
      return <FrameError title="Document not found" detail={path} />
    }
    return (
      <article className="prose-frame mx-auto max-w-2xl px-8 py-10">
        <Markdown remarkPlugins={[remarkGfm]}>{source}</Markdown>
      </article>
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
    </ErrorBoundary>
  )
}
