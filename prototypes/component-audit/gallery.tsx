import type { ReactNode } from 'react'

/**
 * Shared layout for component galleries. Lives outside views/ so the frame
 * loader's glob does not offer it as a view of its own.
 *
 * A gallery is a defect-finding instrument, not a showcase: every variant is
 * present, labelled, and adjacent to its neighbours, because that is the only
 * way inconsistencies become visible.
 */
export function Gallery({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="min-h-dvh bg-[var(--background)] p-8 text-[var(--foreground)]">
      <header className="mb-8">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-sm opacity-60">{subtitle}</p>
      </header>
      <div className="space-y-8">{children}</div>
    </main>
  )
}

export function Group({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="mb-1 text-xs font-semibold tracking-wide uppercase opacity-50">{label}</h2>
      {note && <p className="mb-3 max-w-prose text-xs opacity-50">{note}</p>}
      <div className="mt-3 flex flex-wrap items-end gap-3">{children}</div>
    </section>
  )
}

/** One specimen with the prop value that produced it, so a screenshot is self-describing. */
export function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="font-mono text-[10px] opacity-40">{label}</span>
      {children}
    </div>
  )
}
