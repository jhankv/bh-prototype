/**
 * What an annotation carries besides the words.
 *
 * A note and a screenshot let an agent guess; a note and a measurement let it
 * see. The difference is not subtle — most defects found in this playground so
 * far have been about available width, and "1148 wide inside 1180, no
 * max-width" is the finding, while "the search looks too big" is a request to
 * go and measure it.
 */

export type Measurement = {
  /** The element's rendered size, rounded — sub-pixel noise is not evidence. */
  box: { width: number; height: number }
  /** Its container's width, which is what most width defects are relative to. */
  container: number | null
  /** Whether anything is bounding it, since "no max-width" is often the bug. */
  maxWidth: string | null
  tokens: Array<{ name: string; value: string }>
}

const BH_VAR = /var\(\s*(--bh-[a-z0-9-]+)/g

/** More than this and the reader stops reading, so the report stops writing. */
const TOKEN_LIMIT = 8

/**
 * The `--bh-*` custom properties this element actually uses.
 *
 * Not the ones it can see: every element inherits all 1500-odd of them from the
 * root, so "in scope" says nothing. What matters is which ones style *this*
 * element — the set a design system maintainer would have to change to change
 * what you are looking at.
 *
 * Read from the class list rather than by matching CSS rules, which was the
 * first attempt and was both slower and wrong. Banhaten styles its components
 * with Tailwind arbitrary values, so the reference is in the markup itself:
 * `text-[length:var(--bh-text-body-md-regular-font-size)]`. Walking the
 * stylesheets to rediscover that found one rule out of 1155 — a reduced-motion
 * reset matching `*` — because the real ones live in escaped selectors, and one
 * sheet could not be read at all. The class list has no such problem and needs
 * no permission.
 *
 * Only this element's own classes are read, not its ancestors' or children's.
 * A token on a wrapper styles the wrapper; point at the wrapper to ask about it.
 */
function tokensFor(element: Element): Array<{ name: string; value: string }> {
  const names = new Set<string>()

  for (const match of element.className.toString().matchAll(BH_VAR)) names.add(match[1])

  const styles = getComputedStyle(element)

  return [...names]
    .sort()
    .slice(0, TOKEN_LIMIT)
    .map((name) => ({ name, value: styles.getPropertyValue(name).trim() }))
    .filter((token) => token.value !== '')
}

export function measure(element: Element): Measurement {
  const rect = element.getBoundingClientRect()
  const parent = element.parentElement
  const styles = getComputedStyle(element)
  const maxWidth = styles.maxWidth

  return {
    box: { width: Math.round(rect.width), height: Math.round(rect.height) },
    container: parent ? Math.round(parent.getBoundingClientRect().width) : null,
    maxWidth: maxWidth === 'none' ? null : maxWidth,
    tokens: tokensFor(element),
  }
}
