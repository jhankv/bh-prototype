/**
 * Maps a DOM element back to the component file that declares it.
 *
 * Onlook solves this by instrumenting the code at build time. We do not have
 * to: Banhaten already identifies itself. 189 distinct `data-slot` values across
 * 20 of its 24 component files, and the four that carry none — everything under
 * `expanded/` — name their own BEM-ish classes instead (`ds-page-header__title`).
 * Indexing both covers the whole package without touching the build.
 *
 * The index is built from the sandbox's own sources, so it is exact rather than
 * a naming convention that quietly rots. It is also lazy: a frame that is never
 * inspected never pays for it, and only the sandbox that frame renders is read.
 */

const sources = import.meta.glob<string>('/sandboxes/*/components/ui/**/*.tsx', {
  query: '?raw',
  import: 'default',
})

export type ComponentHit = {
  /** Display name, e.g. `PageHeader`. */
  component: string
  /** Path relative to the installed component root, e.g. `components/ui/input.tsx`. */
  file: string
  /** The attribute or class that identified it. */
  token: string
}

const SLOT = /data-slot="([^"]+)"/g
const DS_CLASS = /\bds-[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?\b/g

/** `button-group.tsx` → `ButtonGroup`; `expanded/PageHeader.tsx` → `PageHeader`. */
function displayName(path: string): string {
  const base = path.split('/').pop()!.replace(/\.tsx$/, '')
  if (/^[A-Z]/.test(base)) return base
  return base
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const cache = new Map<string, Map<string, ComponentHit>>()

export async function loadIndex(sandbox: string): Promise<Map<string, ComponentHit>> {
  const cached = cache.get(sandbox)
  if (cached) return cached

  const prefix = `/sandboxes/${sandbox}/components/ui/`
  const paths = Object.keys(sources).filter((path) => path.startsWith(prefix))
  const index = new Map<string, ComponentHit>()

  await Promise.all(
    paths.map(async (path) => {
      const source = await sources[path]()
      const file = path.slice(`/sandboxes/${sandbox}/`.length)
      const component = displayName(path)

      // A token can appear in more than one file — `ds-tabs` is referenced by
      // PageHeader as well as declared by Tabs. First writer wins, and files are
      // visited in glob order, so prefer whichever names the token in its own
      // filename before falling back to first-seen.
      const record = (token: string) => {
        const existing = index.get(token)
        const ownsIt = token.replace(/^ds-/, '').split(/__|--/)[0] === file.split('/').pop()!.replace(/\.tsx$/, '').toLowerCase()
        if (!existing || ownsIt) index.set(token, { component, file, token })
      }

      for (const match of source.matchAll(SLOT)) record(match[1])
      for (const match of source.matchAll(DS_CLASS)) record(match[0])
    }),
  )

  cache.set(sandbox, index)
  return index
}

/**
 * Walks up from the deepest element under the cursor to the first ancestor the
 * index recognises. Walking up rather than down matters: the cursor usually
 * lands on a bare `<span>` or a text node's parent, several levels below the
 * thing anyone would call "the component".
 */
export function resolve(
  element: Element | null,
  index: Map<string, ComponentHit>,
): { hit: ComponentHit; element: Element } | null {
  let current: Element | null = element

  while (current && current !== document.documentElement) {
    const slot = current.getAttribute('data-slot')
    if (slot) {
      const hit = index.get(slot)
      if (hit) return { hit, element: current }
    }

    for (const token of current.classList) {
      const hit = index.get(token)
      if (hit) return { hit, element: current }
    }

    current = current.parentElement
  }

  return null
}
