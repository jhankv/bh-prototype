import { createContext, use } from 'react'
import type { ComponentMap } from './registry'
import type { DesignSystem } from './types'

export const DesignSystemContext = createContext<ComponentMap | null>(null)

/**
 * Views consume design system components through this hook rather than by
 * importing them, which is what lets one view file render against two sandboxes
 * side by side on the same canvas.
 *
 * The context holds the untyped runtime map — it is built from a glob and
 * cannot be anything else. The hook casts it to `DesignSystem`, which is the
 * pristine sandbox's real module shape, so views get the actual prop types back.
 * See `./types.ts` for what that cast buys and why it is sound.
 */
export function useDS(): DesignSystem {
  const components = use(DesignSystemContext)

  if (!components) {
    throw new Error('useDS() must be called inside a frame — no design system is mounted.')
  }

  return components as unknown as DesignSystem
}
