import { AppearanceSchema, type Appearance } from './schema'

/**
 * Appearance travels in the URL so every frame opens standalone by link.
 * This is what keeps a later deployment a config change rather than a rewrite.
 */
export function appearanceToParams(appearance: Appearance): Record<string, string> {
  return {
    mode: appearance.mode,
    theme: appearance.theme,
    radius: appearance.radius,
    dir: appearance.dir,
  }
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
