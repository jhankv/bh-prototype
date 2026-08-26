import {
  CanvasSchema,
  ManifestSchema,
  formatIssues,
  isDocument,
  type Appearance,
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
    for (const row of section.rows) {
      for (const frame of row.frames) {
        if (ids.has(frame.id)) {
          return { ok: false, error: `Duplicate frame id "${frame.id}" in canvas.json` }
        }
        ids.add(frame.id)
      }
    }
  }

  return { ok: true, value: parsed.data }
}

/** Builds the standalone, shareable URL for one frame. */
export function frameUrl(
  slug: string,
  frame: { src: string; sandbox: string; appearance: Record<string, string> },
): string {
  const params = new URLSearchParams({
    project: slug,
    src: frame.src,
    sandbox: frame.sandbox,
    ...frame.appearance,
  })
  return `/frame.html?${params.toString()}`
}

export type IndexEntry = {
  /** The frame this row opens — its id, appearance and sandbox, from canvas.json. */
  id: string
  src: string
  sandbox: string
  appearance: Appearance
  caption?: string
  /** How many frames on the board render this file. Two means it has an RTL twin. */
  frames: number
}

export type IndexGroup = {
  title: string
  kind: 'document' | 'view'
  entries: IndexEntry[]
}

/**
 * The project page's list: every prototype in a project, one row each.
 *
 * Built from `canvas.json` rather than from a glob over the folder, and that is
 * not a shortcut — it is the only source that knows what is openable. `views/`
 * also holds data modules and snippets used inside an MDX document, none of
 * which render on their own, and a frame is not a file anyway: it is a file
 * plus a sandbox plus an appearance. Only the canvas declares those.
 *
 * Frames that share a `src` collapse into one row. On the board a screen and
 * its Arabic twin are deliberately two frames — you compare them side by side —
 * but a list of links is not a comparison, and the same name twice with nothing
 * to tell the two apart is a list that has to be read carefully to be used. The
 * row opens the first of them; the frame's own toolbar reaches the other.
 */
export function projectIndex(slug: string): Loaded<IndexGroup[]> {
  const canvas = loadCanvas(slug)
  if (!canvas.ok) return canvas

  const groups: IndexGroup[] = []

  for (const section of canvas.value.sections) {
    const bySrc = new Map<string, IndexEntry>()

    for (const row of section.rows) {
      for (const frame of row.frames) {
        const seen = bySrc.get(frame.src)

        if (seen) {
          seen.frames += 1
          continue
        }

        bySrc.set(frame.src, {
          id: frame.id,
          src: frame.src,
          sandbox: frame.sandbox,
          appearance: frame.appearance,
          caption: frame.caption,
          frames: 1,
        })
      }
    }

    const entries = [...bySrc.values()]
    if (entries.length === 0) continue

    groups.push({
      title: section.title,
      // A section is one kind or the other in practice; the first frame decides,
      // so a mixed section lands under the kind it opens with rather than
      // splitting a group the canvas shows as one.
      kind: isDocument(entries[0].src) ? 'document' : 'view',
      entries,
    })
  }

  return { ok: true, value: groups }
}
