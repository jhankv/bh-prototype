import { appearanceFromSearch, describeAppearance } from '@/lib/appearance'
import type { ComponentHit } from './componentIndex'
import type { Measurement } from './measure'

/**
 * Composes the annotations into one block for an agent that does not have this
 * repository open.
 *
 * That reader is the whole design. It cannot see the screen, cannot run the
 * canvas, and cannot be asked a follow-up question — so everything it needs has
 * to be in the text, and anything it does not need is noise competing with what
 * it does.
 */

export type Annotation = {
  id: number
  /** Kept so the numbered marker can be redrawn wherever the element now is. */
  element: Element
  /** Kept so the marker keeps the colour the element had when it was picked. */
  isComponent: boolean
  /** Present when the sandbox index recognised the element. */
  hit: ComponentHit | null
  chain: string[]
  measurement: Measurement
  note: string
}

/**
 * The frame's own context, which no general-purpose tool can know and which
 * decides half of what a finding means.
 *
 * A defect that only appears in `rtl`, or only against `banhaten-proposed`, is
 * a different defect from one that appears everywhere. Reading it off the URL
 * means nobody has to remember to write it down.
 */
function heading(): string {
  const search = new URLSearchParams(window.location.search)
  const project = search.get('project') ?? 'unknown'
  const src = search.get('src') ?? ''
  const sandbox = search.get('sandbox') ?? 'none'
  const appearance = describeAppearance(appearanceFromSearch(search))

  return `## ${project} · ${src} · ${sandbox} · ${appearance}`
}

function describeMeasurement({ box, container, maxWidth, tokens }: Measurement): string[] {
  const lines: string[] = []

  const size = `box: ${box.width}×${box.height}`
  const within = container === null ? '' : ` in a ${container} container`
  const bound = maxWidth === null ? ' · no max-width' : ` · max-width ${maxWidth}`
  lines.push(size + within + bound)

  if (tokens.length > 0) {
    lines.push(`tokens: ${tokens.map((t) => `${t.name} ${t.value}`).join(' · ')}`)
  }

  return lines
}

function entry(annotation: Annotation): string {
  const { id, hit, chain, measurement, note } = annotation

  // The label the colour deliberately does not carry. Pink says "a component";
  // only this says whether touching it means editing a vendored design system.
  const lines = hit
    ? [`### ${id} · BANHATEN — ${hit.component}`, `${hit.file} · ${hit.token}`]
    : [`### ${id} · OURS — ${chain.at(-1) ?? 'view markup'}`]

  if (chain.length > 1) lines.push(`in: ${chain.join(' › ')}`)

  lines.push(...describeMeasurement(measurement))

  // Identification with no note is a legitimate annotation: sometimes all you
  // want is to name the thing you are about to talk about.
  if (note.trim()) lines.push(`> ${note.trim()}`)

  return lines.join('\n')
}

export function compose(annotations: Annotation[]): string {
  return [heading(), ...annotations.map(entry)].join('\n\n') + '\n'
}
