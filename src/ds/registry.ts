import type { ComponentType } from 'react'

/**
 * A static ESM import resolves at build time, so a view file cannot change
 * where its components come from based on a runtime search param. Rendering one
 * view against two design system versions therefore needs a registry, not
 * imports. See docs/specs — §5.6.
 */
const modules = import.meta.glob<Record<string, unknown>>(
  '/sandboxes/*/components/ui/**/*.tsx',
  { eager: true },
)

export type ComponentMap = Record<string, ComponentType<Record<string, unknown>>>

/**
 * A plain function component is a function, but forwardRef and memo return
 * objects carrying $$typeof. Checking only for functions silently drops most of
 * a modern design system.
 */
function isComponent(value: unknown): boolean {
  if (typeof value === 'function') return true
  return typeof value === 'object' && value !== null && '$$typeof' in value
}

function build(): Record<string, ComponentMap> {
  const bySandbox: Record<string, ComponentMap> = {}

  for (const [path, mod] of Object.entries(modules)) {
    const owner = path.match(/^\/sandboxes\/([^/]+)\//)
    if (!owner) continue

    const map = (bySandbox[owner[1]] ??= {})

    for (const [name, value] of Object.entries(mod)) {
      // Components are the capitalised exports; helpers and cva variants are not.
      if (/^[A-Z]/.test(name) && isComponent(value)) {
        map[name] = value as ComponentType<Record<string, unknown>>
      }
    }
  }

  return bySandbox
}

const registry = build()

export function availableSandboxes(): string[] {
  return Object.keys(registry).sort()
}

export function hasSandbox(name: string): boolean {
  return name in registry
}

/**
 * Wraps a sandbox's component map so a missing component fails with a message
 * naming what was asked for and what exists, instead of rendering `undefined`.
 */
export function componentsFor(sandbox: string): ComponentMap {
  const map = registry[sandbox]

  if (!map) {
    throw new Error(
      `Unknown sandbox "${sandbox}". Available: ${availableSandboxes().join(', ') || 'none'}`,
    )
  }

  return new Proxy(map, {
    get(target, key: string) {
      if (key in target) return target[key]
      throw new Error(
        `"${key}" is not exported by sandbox "${sandbox}". ` +
          `Run: npx banhaten add <component> --cwd sandboxes/${sandbox}`,
      )
    },
  })
}
