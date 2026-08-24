import { useState } from 'react'

/**
 * A findings document is only worth writing if it can leave this repository.
 *
 * The reader on the other side is an agent sitting on the real design system
 * source, not a person browsing a canvas. So the button does not copy the
 * markdown alone — it composes a handoff: what this report is, how it was
 * produced, and what it deliberately does not contain.
 *
 * That last part carries weight. This is an audit: it reports defects and
 * proposes no fixes, so an agent that arrives expecting diffs will either invent
 * them or conclude the report is incomplete. The preamble says so up front.
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

External audit from a prototype playground that renders Banhaten components live
across appearance modes and text directions. Every finding below was **observed
in a running browser and measured in the DOM**, then checked against what the
component publishes through \`banhaten docs <component>\`.

**This report contains no patches, and that is deliberate.** It reports what
happens, where to reproduce it, and what in the source causes it. It stops there.
Deciding what to do is the owning team's call, and they have context an outside
audit does not.

How to read it:

- \`Status: Confirmed\` — it reproduces on the named frame and the cause is
  identified in the source. Paths are relative to the installed component root,
  e.g. \`components/ui/kbd.tsx\`.
- \`Status: Question\` — more than one answer is reasonable. Do not pick one
  silently; surface it.
- Every entry carries a **Repro** line naming the frame it was seen on.
- **Verified good** and **Investigated and rejected** are context only. Do not
  change code for them.

If you are an agent acting on this: do not write fixes unless a human asks you
to. The absence of a suggested fix is information, not an omission.

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
