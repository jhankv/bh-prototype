import type { ComponentType } from 'react'

/**
 * A static ESM import resolves at build time, so a view file cannot change
 * where its components come from based on a runtime search param. Rendering one
 * view against two design system versions therefore needs a registry, not
 * imports. See docs/specs — §5.6.
 *
 * The glob is lazy. An eager one instantiates every component of every sandbox
 * inside every frame, and a canvas is many frames at once — measured at 13s to
 * open a ten-frame canvas. A frame renders exactly one sandbox, so it should
 * pay for exactly one.
 */
const modules = import.meta.glob<Record<string, unknown>>(
  '/sandboxes/*/components/ui/**/*.tsx',
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

function pathsFor(sandbox: string): string[] {
  return Object.keys(modules).filter((path) => path.startsWith(`/sandboxes/${sandbox}/`))
}

export function availableSandboxes(): string[] {
  const names = new Set<string>()

  for (const path of Object.keys(modules)) {
    const owner = path.match(/^\/sandboxes\/([^/]+)\//)
    if (owner) names.add(owner[1])
  }

  return [...names].sort()
}

const cache = new Map<string, ComponentMap>()

/** Called once per frame, before rendering, with the sandbox that frame declares. */
export async function loadSandbox(sandbox: string): Promise<void> {
  if (cache.has(sandbox)) return

  const paths = pathsFor(sandbox)

  if (paths.length === 0) {
    throw new Error(
      `Unknown sandbox "${sandbox}". Available: ${availableSandboxes().join(', ') || 'none'}`,
    )
  }

  const map: ComponentMap = {}

  await Promise.all(
    paths.map(async (path) => {
      const mod = await modules[path]()

      for (const [name, value] of Object.entries(mod)) {
        // Components are the capitalised exports; helpers and cva variants are not.
        if (/^[A-Z]/.test(name) && isComponent(value)) {
          map[name] = value as ComponentType<Record<string, unknown>>
        }
      }
    }),
  )

  cache.set(sandbox, map)
}

/**
 * Wraps a sandbox's component map so a missing component fails with a message
 * naming what was asked for and what exists, instead of rendering `undefined`.
 */
export function componentsFor(sandbox: string): ComponentMap {
  const map = cache.get(sandbox)

  if (!map) {
    throw new Error(
      `Sandbox "${sandbox}" was not loaded. Available: ${availableSandboxes().join(', ') || 'none'}`,
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
