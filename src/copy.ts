/**
 * Direction-aware copy for prototypes.
 *
 * Testing a right-to-left layout with English strings is not a right-to-left
 * test. It is a test of *Latin text inside an RTL container* — a real case, and
 * the one that produced three findings, but only one of them. An Arabic
 * interface fails differently: the script has no uppercase, so `text-transform`
 * silently does nothing; it needs more line height than Latin at the same font
 * size; letter-spacing breaks the cursive joins outright; and the font stack has
 * to actually resolve.
 *
 * None of that is visible while the RTL frame reads "Refunds appear once…".
 *
 * So a prototype writes both, and the frame's direction picks:
 *
 *   const t = useCopy({ title: { en: 'Orders', ar: 'الطلبات' } })
 *   <PageHeader title={t.title} />
 */

export type Phrase<T = string> = { en: T; ar: T }
export type Dictionary = Record<string, Phrase<unknown>>

export type Translated<D extends Dictionary> = {
  [K in keyof D]: D[K] extends Phrase<infer T> ? T : never
}

/** The direction this frame was opened with. Fixed for its lifetime — the canvas
 *  toggle changes the URL, which reloads the document. */
export function direction(): 'ltr' | 'rtl' {
  return new URLSearchParams(window.location.search).get('dir') === 'rtl' ? 'rtl' : 'ltr'
}

export function useCopy<D extends Dictionary>(dictionary: D): Translated<D> {
  const key = direction() === 'rtl' ? 'ar' : 'en'
  const translated = {} as Translated<D>

  for (const name of Object.keys(dictionary) as Array<keyof D>) {
    translated[name] = dictionary[name][key] as Translated<D>[keyof D]
  }

  return translated
}

/** Picks one value without building a dictionary — for a single string in place. */
export function t<T>(phrase: Phrase<T>): T {
  return direction() === 'rtl' ? phrase.ar : phrase.en
}
