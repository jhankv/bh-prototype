/**
 * The prop types `useDS()` hands back.
 *
 * The registry resolves components at runtime, from a glob, because a frame
 * chooses its sandbox from a search param and a static import cannot. That is a
 * constraint on *values*. It was never a constraint on *types*, and for a long
 * time this file did not exist, so every component arrived as
 * `ComponentType<Record<string, unknown>>` and the compiler had nothing to say
 * about any prop passed to any of them.
 *
 * What that cost, before this file:
 *
 * - `<Select size="sm">` — `sm` is not in Select's union, no padding class
 *   applied, the control collapsed to 24px. Shipped, reviewed several times,
 *   found by eye. See `architecture-3`.
 * - `<Button variant="tertiary">` — four times, doing nothing.
 * - `<ToolbarButton variant="brand">` — no such variant.
 * - `<Badge dot>` — the prop is `type="dot"`.
 *
 * None of those failed. They rendered a default and looked deliberate.
 *
 * `import type` is erased at build time, so nothing here reaches the bundle and
 * nothing binds a frame to a sandbox. Values still come from the runtime glob in
 * `registry.ts`; only the shape is known ahead of time.
 *
 * Typed against the pristine sandbox on purpose. A second sandbox is an install
 * of the same package, so the props match — and if they ever stop matching, that
 * divergence is a finding rather than a typing problem to work around.
 *
 * When `banhaten add` installs a component, add its module here. There is no
 * generator: the list is short, changes rarely, and a missing entry fails loudly
 * the moment someone destructures a name that is not in it.
 */

type Modules = typeof import('../../sandboxes/banhaten/components/ui/avatar') &
  typeof import('../../sandboxes/banhaten/components/ui/badge') &
  typeof import('../../sandboxes/banhaten/components/ui/button') &
  typeof import('../../sandboxes/banhaten/components/ui/button-group') &
  typeof import('../../sandboxes/banhaten/components/ui/checkbox') &
  typeof import('../../sandboxes/banhaten/components/ui/input') &
  typeof import('../../sandboxes/banhaten/components/ui/kbd') &
  typeof import('../../sandboxes/banhaten/components/ui/menu') &
  typeof import('../../sandboxes/banhaten/components/ui/pagination') &
  typeof import('../../sandboxes/banhaten/components/ui/progress') &
  typeof import('../../sandboxes/banhaten/components/ui/segmented-control') &
  typeof import('../../sandboxes/banhaten/components/ui/select') &
  typeof import('../../sandboxes/banhaten/components/ui/select-content') &
  typeof import('../../sandboxes/banhaten/components/ui/spinner') &
  typeof import('../../sandboxes/banhaten/components/ui/table-elements') &
  typeof import('../../sandboxes/banhaten/components/ui/tabs') &
  typeof import('../../sandboxes/banhaten/components/ui/tag') &
  typeof import('../../sandboxes/banhaten/components/ui/toggle') &
  typeof import('../../sandboxes/banhaten/components/ui/toolbar') &
  typeof import('../../sandboxes/banhaten/components/ui/tooltip') &
  typeof import('../../sandboxes/banhaten/components/ui/expanded/Breadcrumbs') &
  typeof import('../../sandboxes/banhaten/components/ui/expanded/EmptyState') &
  typeof import('../../sandboxes/banhaten/components/ui/expanded/PageHeader') &
  typeof import('../../sandboxes/banhaten/components/ui/expanded/Table')

/**
 * Only capitalised exports are registered, so only they should be reachable.
 * `buttonVariants` and the other helpers are real exports of those modules and
 * would otherwise appear in the type while being absent at runtime — a
 * `undefined is not a function` at render, which is worse than not offering them.
 */
type ComponentNames = {
  [K in keyof Modules]: K extends Capitalize<string & K> ? K : never
}[keyof Modules]

export type DesignSystem = Pick<Modules, ComponentNames>
