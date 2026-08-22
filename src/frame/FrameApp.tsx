import { Suspense, lazy, useEffect, useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { applyAppearance, appearanceFromSearch } from '@/lib/appearance'
import { DesignSystemProvider } from '@/ds/DesignSystem'
import { forwardEscapeToCanvas } from '@/lib/frameMessages'
import { ErrorBoundary } from './ErrorBoundary'
import { FrameError } from './FrameError'

/** Views load on demand — a canvas should not pay for frames nobody opened. */
const viewModules = import.meta.glob('/prototypes/*/views/*.tsx')

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
  const loader = viewModules[path]

  // React.lazy must not be recreated on every render, or the view remounts.
  const View = useMemo(
    () => (loader ? lazy(loader as () => Promise<{ default: React.ComponentType }>) : null),
    [loader],
  )

  if (!View) {
    return (
      <FrameError
        title="View not found"
        detail={`${path} — known views: ${Object.keys(viewModules).join(', ') || 'none'}`}
      />
    )
  }

  // "none" is a view with no design system — the shell's own smoke tests.
  const content =
    sandbox === 'none' ? (
      <View />
    ) : (
      <DesignSystemProvider sandbox={sandbox}>
        <View />
      </DesignSystemProvider>
    )

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>{content}</Suspense>
    </ErrorBoundary>
  )
}
