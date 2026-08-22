import { useState } from 'react'

/**
 * A findings document is only worth writing if it can leave this repository.
 *
 * The reader on the other side is an agent sitting on the real design system
 * source, not a person browsing a canvas. So the button does not copy the
 * markdown alone — it composes a handoff: what this report is, how it was
 * produced, and which entries are safe to act on without asking a human. The
 * document itself already carries the diffs.
 */

const installed = import.meta.glob<{ registryVersion?: string }>(
  '/sandboxes/*/.banhaten/installed.json',
  { eager: true, import: 'default' },
)

function designSystemVersion(): string {
  const pristine = installed['/sandboxes/banhaten/.banhaten/installed.json']
  const any = pristine ?? Object.values(installed)[0]
  return any?.registryVersion ?? 'unknown version'
}

function preamble(source: string): string {
  return `# Design system feedback — Banhaten ${designSystemVersion()}

External audit from a prototype playground that renders Banhaten components
live, side by side, across appearance modes and against a patched copy. Every
finding below was **observed in a running browser and measured in the DOM** —
not inferred by reading source.

How to act on it:

- \`Status: FIXED in sandboxes/banhaten-proposed\` — the entry contains the exact
  diff. Apply it to the same file in your repo; paths are relative to the
  installed component root, e.g. \`components/ui/kbd.tsx\`.
- \`Status: OPEN\` — needs a design decision. Do not invent one; surface it.
- **Open questions** and **Investigated and rejected** are context only. Do not
  change code for them.

Source: \`${source}\` · generated ${new Date().toISOString().slice(0, 10)}

---

`
}

type State = 'idle' | 'copied' | 'failed'

const LABEL: Record<State, string> = {
  idle: 'Copy for your agent',
  copied: 'Copied',
  failed: 'Copy failed — select and copy manually',
}

export function CopyHandoff({ markdown, source }: { markdown: string; source: string }) {
  const [state, setState] = useState<State>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(preamble(source) + markdown)
      setState('copied')
    } catch {
      setState('failed')
    }
    // Long enough to read, short enough that the button is ready when you look back.
    window.setTimeout(() => setState('idle'), 2400)
  }

  return (
    <button
      type="button"
      onClick={copy}
      data-state={state}
      className="fixed top-4 right-4 z-10 rounded-md border border-neutral-300 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur transition-colors hover:bg-white data-[state=copied]:border-emerald-400 data-[state=copied]:text-emerald-700 data-[state=failed]:border-amber-400 data-[state=failed]:text-amber-700 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200 dark:hover:bg-neutral-900"
    >
      {LABEL[state]}
    </button>
  )
}
