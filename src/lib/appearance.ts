import { AppearanceSchema, type Appearance } from './schema'

const DEFAULTS = AppearanceSchema.parse({})

/**
 * Appearance travels in the URL so every frame opens standalone by link.
 * This is what keeps a later deployment a config change rather than a rewrite.
 *
 * Only what differs from the default is written. `appearanceFromSearch` already
 * falls back per field, so the rest was noise — and noise with a cost: eight
 * parameters of mostly nothing is a link nobody reads, which means nobody
 * notices the one that matters. A URL carrying `mode=dark&theme=brown` and
 * nothing else states what is unusual about the frame it opens.
 */
export function appearanceToParams(appearance: Appearance): Record<string, string> {
  const keys = Object.keys(DEFAULTS) as (keyof Appearance)[]

  return Object.fromEntries(
    keys.filter((key) => appearance[key] !== DEFAULTS[key]).map((key) => [key, appearance[key]]),
  )
}

export function appearanceFromSearch(search: URLSearchParams): Appearance {
  const parsed = AppearanceSchema.safeParse({
    mode: search.get('mode') ?? undefined,
    theme: search.get('theme') ?? undefined,
    radius: search.get('radius') ?? undefined,
    dir: search.get('dir') ?? undefined,
  })
  // An unreadable appearance should never blank a frame — fall back to defaults.
  return parsed.success ? parsed.data : AppearanceSchema.parse({})
}

/** Applies appearance to the frame document's root element. */
export function applyAppearance(root: HTMLElement, appearance: Appearance): void {
  root.classList.toggle('dark', appearance.mode === 'dark')
  root.dataset.theme = appearance.theme
  root.dataset.radius = appearance.radius
  root.dir = appearance.dir
  root.lang = appearance.dir === 'rtl' ? 'ar' : 'en'
}

export function describeAppearance(appearance: Appearance): string {
  return [appearance.mode, appearance.theme, appearance.radius, appearance.dir].join(' · ')
}
