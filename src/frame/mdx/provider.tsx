import type { ComponentType } from 'react'
import { Compare } from './Compare'

/**
 * The component scope every MDX document gets for free.
 *
 * `providerImportSource` in vite.config points here, so an audit document can
 * write <Compare … /> without an import line. That matters more than it looks:
 * an import inside a document would be a static ESM import of a design system
 * path, which is exactly the thing views are forbidden from doing — it would
 * bind the document to one sandbox at build time and quietly kill the
 * comparison it exists to make.
 */
export function useMDXComponents(components: Record<string, ComponentType>) {
  return { Compare, ...components }
}
