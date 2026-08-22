import { useDS } from '@/ds/DesignSystem'

/**
 * Direction audit.
 *
 * F-001 (Kbd) and F-003 (Table) looked like two unrelated defects. They are the
 * same one: text whose direction opposes the document, or bidi-neutral symbols,
 * rendered without isolation.
 *
 * Banhaten's core components apply dir="auto" in 39 places, so the library
 * clearly knows this pattern. This view exercises the places that do not, next
 * to the ones that do, so the difference is visible rather than argued.
 *
 * Every row is deliberately narrow. Truncation only misbehaves once it happens.
 */
const LATIN = 'Maximiliano Alessandro Fernández de la Vega y Santibáñez'
const ARABIC = 'عبد الرحمن بن محمد بن عبد الله آل سعود الشمري'

export default function DirectionAudit() {
  const { PageHeader, Breadcrumbs, Tag, Badge, Button, Kbd } = useDS()

  const dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'

  return (
    <main className="min-h-dvh bg-[var(--background)] pb-10 text-[var(--foreground)]">
      <PageHeader
        title={LATIN}
        description={ARABIC}
        dir={dir}
        breadcrumbs={[{ label: LATIN, href: '#' }, { label: ARABIC }]}
      />

      <div className="space-y-7 p-6">
        <Case
          id="A"
          component="expanded/PageHeader"
          expectation="Both strings keep their beginning. Currently no dir attribute is set."
        >
          <span className="text-xs opacity-60">See the header above.</span>
        </Case>

        <Case
          id="B"
          component="expanded/Breadcrumbs"
          expectation="Each crumb keeps its beginning regardless of document direction."
        >
          <div className="w-[420px] overflow-hidden">
            <Breadcrumbs
              dir={dir}
              items={[{ label: LATIN, href: '#' }, { label: ARABIC, current: true }]}
            />
          </div>
        </Case>

        <Case id="C" component="tag" expectation="Control — tag.tsx already sets dir=auto.">
          <div className="flex w-[420px] gap-2 overflow-hidden">
            <Tag>{LATIN}</Tag>
            <Tag>{ARABIC}</Tag>
          </div>
        </Case>

        <Case id="D" component="badge" expectation="Control — badge.tsx already sets dir=auto.">
          <div className="flex w-[420px] gap-2 overflow-hidden">
            <Badge color="blue">{LATIN}</Badge>
            <Badge color="green">{ARABIC}</Badge>
          </div>
        </Case>

        <Case id="E" component="button" expectation="Control — button.tsx already sets dir=auto.">
          <div className="flex w-[420px] gap-2 overflow-hidden">
            <Button variant="secondary">{LATIN}</Button>
          </div>
        </Case>

        <Case
          id="F"
          component="kbd"
          expectation="A shortcut must read the same in both directions. Keyboards do not mirror."
        >
          <div className="flex items-center gap-3">
            <Kbd>⌘K</Kbd>
            <Kbd>⇧⌘P</Kbd>
            <Kbd>Ctrl+S</Kbd>
          </div>
        </Case>
      </div>
    </main>
  )
}

function Case({
  id,
  component,
  expectation,
  children,
}: {
  id: string
  component: string
  expectation: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-1 text-xs font-semibold tracking-wide uppercase opacity-50">
        {id} · {component}
      </h2>
      <p className="mb-3 max-w-prose text-xs opacity-60">{expectation}</p>
      {children}
    </section>
  )
}
