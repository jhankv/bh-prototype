import type { ReactNode } from 'react'
import { componentsFor } from './registry'
import { DesignSystemContext } from './context'

/**
 * Kept to components only. Exporting the hook alongside it breaks Fast Refresh
 * for every view in the frame — the context and useDS live in ./context.
 */
export function DesignSystemProvider({
  sandbox,
  children,
}: {
  sandbox: string
  children: ReactNode
}) {
  // Throws for an unknown sandbox; the frame's error boundary reports it.
  const components = componentsFor(sandbox)

  return <DesignSystemContext value={components}>{children}</DesignSystemContext>
}
