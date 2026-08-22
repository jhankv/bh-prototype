import {
  CanvasSchema,
  ManifestSchema,
  formatIssues,
  type Canvas,
  type Manifest,
} from './schema'

/**
 * The filesystem is the database. Adding a folder under prototypes/ adds a
 * card to the dashboard — there is no registry to keep in sync.
 */
const manifestModules = import.meta.glob<{ default: unknown }>(
  '/prototypes/*/manifest.json',
  { eager: true },
)

const canvasModules = import.meta.glob<{ default: unknown }>(
  '/prototypes/*/canvas.json',
  { eager: true },
)

export type Project = {
  slug: string
  manifest: Manifest
}

/** Either the parsed value, or a message a frame can render. */
export type Loaded<T> = { ok: true; value: T } | { ok: false; error: string }

function slugOf(path: string): string {
  return path.split('/')[2] ?? path
}

export function listProjects(): Project[] {
  const projects: Project[] = []

  for (const [path, mod] of Object.entries(manifestModules)) {
    const slug = slugOf(path)
    const parsed = ManifestSchema.safeParse(mod.default)

    if (!parsed.success) {
      console.warn(`[playground] ignoring ${path} — ${formatIssues(parsed.error)}`)
      continue
    }

    projects.push({ slug, manifest: parsed.data })
  }

  return projects.sort((a, b) => a.manifest.name.localeCompare(b.manifest.name))
}

export function findProject(slug: string): Project | undefined {
  return listProjects().find((project) => project.slug === slug)
}

export function loadCanvas(slug: string): Loaded<Canvas> {
  const mod = canvasModules[`/prototypes/${slug}/canvas.json`]

  if (!mod) {
    return { ok: false, error: `No canvas.json in prototypes/${slug}/` }
  }

  const parsed = CanvasSchema.safeParse(mod.default)

  if (!parsed.success) {
    return { ok: false, error: `Invalid canvas.json — ${formatIssues(parsed.error)}` }
  }

  const ids = new Set<string>()
  for (const section of parsed.data.sections) {
    for (const frame of section.frames) {
      if (ids.has(frame.id)) {
        return { ok: false, error: `Duplicate frame id "${frame.id}" in canvas.json` }
      }
      ids.add(frame.id)
    }
  }

  return { ok: true, value: parsed.data }
}

/** Builds the standalone, shareable URL for one frame. */
export function frameUrl(
  slug: string,
  frame: { type: string; src: string; sandbox: string; appearance: Record<string, string> },
): string {
  const params = new URLSearchParams({
    project: slug,
    type: frame.type,
    src: frame.src,
    sandbox: frame.sandbox,
    ...frame.appearance,
  })
  return `/frame.html?${params.toString()}`
}
