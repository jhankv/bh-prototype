import { createContext, use, type ReactNode } from 'react'
import { componentsFor, type ComponentMap } from './registry'

const DesignSystemContext = createContext<ComponentMap | null>(null)

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

/**
 * Views consume design system components through this hook rather than by
 * importing them, which is what lets one view file render against two sandboxes
 * side by side on the same canvas.
 */
export function useDS(): ComponentMap {
  const components = use(DesignSystemContext)

  if (!components) {
    throw new Error('useDS() must be called inside a frame — no design system is mounted.')
  }

  return components
}
