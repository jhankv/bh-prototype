import { createContext, use } from 'react'
import type { ComponentMap } from './registry'

export const DesignSystemContext = createContext<ComponentMap | null>(null)

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
