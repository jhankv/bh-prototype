import { Boxes, ChevronsUpDown, Search } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * Laravel Cloud's project overview with nothing in it, reproduced as faithfully
 * as Banhaten allows.
 *
 * https://mobbin.com/screens/5a0b71b3-f06f-4b14-af43-b862c1550a8f
 *
 * It is a whole screen for one component, and that is the point rather than a
 * shortcoming. `EmptyState` is the only Banhaten component whose entire job is
 * to occupy a region that has nothing in it, so it cannot be judged beside
 * anything — the question it answers is whether a page with no content still
 * reads as a page, and the only way to see that is to give it a page.
 *
 * Folding it into the Neon table as a zero-row state was the obvious
 * alternative and it is the wrong one twice over: it would put `EmptyState`
 * inside a screen that does not have it, and it would hide the component behind
 * a table's own framing exactly when the thing being tested is whether it can
 * hold a frame by itself.
 *
 * The tabs and the top bar are the reference's. They are here because an empty
 * state surrounded by chrome is the real case — an empty state alone on a white
 * page always looks fine.
 */

const COPY = {
  org: { en: 'Northwind', ar: 'نورث ويند' },
  switchOrg: { en: 'Switch organisation', ar: 'تبديل المؤسسة' },
  search: { en: 'Search', ar: 'بحث' },

  tabOverview: { en: 'Overview', ar: 'نظرة عامة' },
  tabApplications: { en: 'Applications', ar: 'التطبيقات' },
  tabResources: { en: 'Resources', ar: 'الموارد' },
  tabUsage: { en: 'Usage', ar: 'الاستخدام' },
  tabSettings: { en: 'Settings', ar: 'الإعدادات' },

  emptyTitle: { en: 'No applications yet', ar: 'لا توجد تطبيقات بعد' },
  emptyDescription: {
    en: 'Get started and create your first application.',
    ar: 'ابدأ وأنشئ تطبيقك الأول.',
  },
  newApplication: { en: 'New application', ar: 'تطبيق جديد' },

  footerStatus: { en: 'Status', ar: 'الحالة' },
  footerDocs: { en: 'Docs', ar: 'التوثيق' },
  footerHelp: { en: 'Help', ar: 'المساعدة' },
  footerLegal: { en: 'Legal', ar: 'قانوني' },
} as const

export default function AppsOverview() {
  const { Avatar, AvatarFallback, EmptyState, Input } = useDS()
  const c = useCopy(COPY)

  const tabs = [c.tabOverview, c.tabApplications, c.tabResources, c.tabUsage, c.tabSettings]

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="flex items-center gap-3 px-5 py-3">
        <span className="flex items-center gap-2">
          <Avatar size="xs" shape="rounded">
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{c.org}</span>
          <button type="button" aria-label={c.switchOrg}>
            <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-40" />
          </button>
        </span>

        <div className="ms-auto flex items-center gap-3">
          <div className="w-[200px]">
            <Input
              size="sm"
              placeholder={c.search}
              aria-label={c.search}
              leadingIcon={<Search aria-hidden="true" />}
              hasLeadingIcon
              kind="shortcut"
              shortcutKeys={['Mod', 'K']}
            />
          </div>
          <Avatar size="sm">
            <AvatarFallback>JK</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Plain markup: these are the reference's own page tabs, and Banhaten's
          `Tabs` is already covered by page-header-1 on a different surface. Using it
          here would re-test a known defect instead of testing `EmptyState`. */}
      <nav className="flex gap-5 border-b border-[var(--bh-border-default)] px-5 text-sm">
        {tabs.map((tab, index) => (
          <span
            key={tab}
            className={`-mb-px border-b-2 py-2.5 ${
              index === 0
                ? 'border-[var(--bh-interactive-brand-default)] font-medium'
                : 'border-transparent text-[var(--bh-content-subtle)]'
            }`}
          >
            {tab}
          </span>
        ))}
      </nav>

      <main className="grid flex-1 place-items-center px-5 py-16">
        <EmptyState
          icon={<Boxes aria-hidden="true" className="size-8" />}
          title={c.emptyTitle}
          description={c.emptyDescription}
          actions={[{ label: c.newApplication }]}
        />
      </main>

      <footer className="flex gap-4 border-t border-[var(--bh-border-default)] px-5 py-3 text-xs text-[var(--bh-content-subtle)]">
        <span className="me-auto">Northwind © 2026</span>
        <span>{c.footerStatus}</span>
        <span>{c.footerDocs}</span>
        <span>{c.footerHelp}</span>
        <span>{c.footerLegal}</span>
      </footer>
    </div>
  )
}
