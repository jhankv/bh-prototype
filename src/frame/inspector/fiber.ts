/**
 * Reads React's fiber tree to answer two things the DOM cannot.
 *
 * **Is this a component?** The sandbox index knows Banhaten's components because
 * Banhaten labels them. Ours are indistinguishable from layout in the DOM — a
 * `<div>` with utility classes either way — so the only place the boundary
 * exists is the fiber.
 *
 * **What composed it?** The chain a person would have written, `SalesConsole ›
 * TopBar › Avatar`, including our own components. Walking the DOM cannot produce
 * that; nothing in the markup records who rendered it.
 *
 * This is coupled to a React internal, which is normally a bad trade. Here it is
 * bounded: dev-only code inside a dev-only frame, and every function below
 * returns an empty or negative answer rather than throwing if the shape ever
 * changes. The Inspector then degrades to "layout" instead of breaking a
 * prototype.
 */

type Fiber = {
  return: Fiber | null
  tag: number
  elementType?: unknown
  type?: unknown
}

/** React's own tag for a DOM element. Anything else is a component of some kind. */
const HOST_COMPONENT = 5

function fiberOf(element: Element): Fiber | null {
  const key = Object.keys(element).find((name) => name.startsWith('__reactFiber$'))
  if (!key) return null

  return (element as unknown as Record<string, Fiber>)[key] ?? null
}

type Named = {
  displayName?: string
  name?: string
  render?: { displayName?: string; name?: string }
  type?: { displayName?: string; name?: string }
}

function readName(value: unknown): string | null {
  if (!value || typeof value === 'string') return null

  // forwardRef and memo wrap the function rather than being one.
  const type = value as Named
  const name = type.displayName ?? type.name ?? type.render?.name ?? type.type?.name
  return name && /^[A-Z]/.test(name) ? name : null
}

/**
 * Both slots are read, and `type` is not a fallback for a missing `elementType`.
 *
 * A lazy component keeps the `React.lazy` wrapper in `elementType` forever and
 * puts the resolved function in `type` once it loads. Preferring `elementType`
 * therefore loses exactly the components loaded on demand — which here means
 * every view. `SalesConsole` was missing from every chain because of it.
 */
function nameOf(fiber: Fiber): string | null {
  return readName(fiber.elementType) ?? readName(fiber.type)
}

/**
 * Names that describe how a component is built rather than what was composed.
 *
 * Measured on one avatar: `Primitive.span · AvatarContext · AvatarProvider ·
 * Avatar · Avatar`. Five entries for one component. Agentation's export ships
 * this noise as-is, which is why its chains read like stack traces.
 */
function isPlumbing(name: string): boolean {
  return (
    name.startsWith('Primitive.') ||
    name.endsWith('Context') ||
    name.endsWith('Provider') ||
    name.endsWith('Consumer') ||
    name === 'Fragment' ||
    name === 'Suspense' ||
    name === 'StrictMode'
  )
}

/**
 * This tool's own wrapping, present in every chain and therefore telling you
 * nothing about any of them. Trimmed at the top so a chain starts at the view.
 */
const SCAFFOLDING = new Set([
  'FrameApp',
  'ViewFrame',
  'ErrorBoundary',
  'DesignSystemProvider',
  'Inspector',
  'CopyHandoff',
])

/**
 * True when the element is a component's own root rather than markup inside one.
 *
 * Every element is rendered *by* some component, so "has a component ancestor"
 * would be true of everything. The boundary is narrower: walking up from this
 * element, a named component has to appear before another DOM element does.
 */
export function isComponentRoot(element: Element): boolean {
  const start = fiberOf(element)
  if (!start) return false

  for (let fiber = start.return; fiber; fiber = fiber.return) {
    if (fiber.tag === HOST_COMPONENT) return false

    const name = nameOf(fiber)
    if (name && !isPlumbing(name)) return true
  }

  return false
}

/**
 * The composition that produced this element, outermost first.
 *
 * Consecutive repeats collapse: a component that forwards its ref through a
 * wrapper of the same name appears twice in the fiber tree and once in anything
 * a person would write down.
 */
export function componentChain(element: Element): string[] {
  const chain: string[] = []

  for (let fiber = fiberOf(element); fiber; fiber = fiber.return) {
    const name = nameOf(fiber)
    if (!name || isPlumbing(name) || SCAFFOLDING.has(name)) continue
    if (chain[0] === name) continue

    chain.unshift(name)
  }

  return chain
}
