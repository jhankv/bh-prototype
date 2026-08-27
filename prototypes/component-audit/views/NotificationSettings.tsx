import { ArrowLeft, Bell, Building2, ChevronDown, ChevronsUpDown, Compass, EyeOff, Search, User } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * Mercury's notification settings, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/cd614ddf-6c42-41be-b0ed-1e1a1653e70e
 *
 * Faithful is the method, not a courtesy to Mercury. A prototype assembled from
 * three products and some invention of my own has no control variable: when
 * something looks wrong on it, nobody can tell whether the component is wrong
 * or the composition is, and the first thing a design system maintainer will
 * say is that the layout is not real. A screen that exists, reproduced as it
 * exists, lets a finding be stated as "this screen ships, here is where it
 * breaks".
 *
 * So the rule this file follows: every component here is one Mercury's screen
 * actually calls for, and nothing is added to raise coverage. The components
 * this screen does not need — Checkbox, SegmentedControl, ButtonGroup, Select —
 * belong to a different real screen, not to a widened version of this one.
 *
 * What this screen exercises: `Toggle` in three groups, `Badge` as a count in a
 * navigation row, `Menu` on two triggers, `Input kind="shortcut"`, `Avatar`,
 * and `Button`.
 *
 * The two sidebars and the section rules are plain markup, because Banhaten
 * ships no navigation component and inventing one would put ours under test
 * instead of theirs.
 *
 * The row shapes are Mercury's own and they are the reason this screen is worth
 * reproducing: "My cards" carries three rows with no description at all,
 * directly above "Spend policy" whose rows all have one. That asymmetry inside
 * one page is where a control aligned to the centre of its row and a control
 * aligned to the first line of its label stop agreeing.
 */

const COPY = {
  workspace: { en: 'Northwind', ar: 'نورث ويند' },
  workspaceSwitch: { en: 'Switch workspace', ar: 'تبديل مساحة العمل' },
  search: { en: 'Search or jump to', ar: 'ابحث أو انتقل إلى' },
  searchLabel: { en: 'Search', ar: 'بحث' },
  moveMoney: { en: 'Move Money', ar: 'تحويل الأموال' },
  sendPayment: { en: 'Send payment', ar: 'إرسال دفعة' },
  requestFunds: { en: 'Request funds', ar: 'طلب أموال' },
  transferBetween: { en: 'Transfer between accounts', ar: 'تحويل بين الحسابات' },
  hideBalances: { en: 'Hide balances', ar: 'إخفاء الأرصدة' },
  notificationsBell: { en: 'Notifications', ar: 'الإشعارات' },

  settings: { en: 'Settings', ar: 'الإعدادات' },
  back: { en: 'Back', ar: 'رجوع' },
  company: { en: 'Company', ar: 'الشركة' },
  personal: { en: 'Personal', ar: 'شخصي' },
  explore: { en: 'Explore', ar: 'استكشاف' },

  navCompany: {
    en: [
      'Company Profile',
      'Team',
      'Controls',
      'Plan & Billing',
      'Approvals',
      'Policies',
      'Categories',
      'Integrations',
      'API Tokens',
      'Vault',
      'Company Security',
    ],
    ar: [
      'ملف الشركة',
      'الفريق',
      'الضوابط',
      'الخطة والفوترة',
      'الموافقات',
      'السياسات',
      'الفئات',
      'التكاملات',
      'رموز الواجهة البرمجية',
      'الخزنة',
      'أمن الشركة',
    ],
  },
  navPersonal: {
    en: ['My Profile', 'Notifications', 'Security'],
    ar: ['ملفي الشخصي', 'الإشعارات', 'الأمان'],
  },
  navExplore: { en: ['Perks', 'Referrals'], ar: ['المزايا', 'الإحالات'] },

  title: { en: 'Notifications', ar: 'الإشعارات' },
  sentTo: { en: 'All notifications will be sent to', ar: 'سترسل كل الإشعارات إلى' },
  address: { en: 'jhan@northwind.com', ar: 'jhan@northwind.com' },

  tabBalance: { en: 'Balance alerts', ar: 'تنبيهات الرصيد' },
  tabActivity: { en: 'Account activity', ar: 'نشاط الحساب' },
  tabCards: { en: 'My cards', ar: 'بطاقاتي' },
  tabReimbursements: { en: 'Reimbursements', ar: 'المستردات' },

  groupCards: { en: 'My cards', ar: 'بطاقاتي' },
  cardDeclined: { en: 'Card transaction is declined', ar: 'رُفضت معاملة البطاقة' },
  cardAbroad: {
    en: 'Card is used outside of the United States',
    ar: 'استُخدمت البطاقة خارج الولايات المتحدة',
  },
  cardOnline: { en: 'Card is used for an online purchase', ar: 'استُخدمت البطاقة في شراء عبر الإنترنت' },

  groupSpend: { en: 'Spend policy', ar: 'سياسة الإنفاق' },
  spendInfo: {
    en: 'Transaction requires additional information',
    ar: 'تتطلب المعاملة معلومات إضافية',
  },
  spendInfoNote: {
    en: 'Sent if a spend policy requires you to add information for a transaction (e.g. receipt or note)',
    ar: 'يُرسل إذا كانت سياسة الإنفاق تتطلب إضافة معلومات للمعاملة، مثل إيصال أو ملاحظة',
  },
  spendWeekly: { en: 'Weekly reminder', ar: 'تذكير أسبوعي' },
  spendWeeklyNote: {
    en: 'Sent at the end of the week to remind you about transactions that still require additional information',
    ar: 'يُرسل في نهاية الأسبوع لتذكيرك بالمعاملات التي ما زالت تتطلب معلومات إضافية',
  },

  groupSubscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
  subscriptionNew: { en: 'New subscription is detected', ar: 'تم اكتشاف اشتراك جديد' },
} as const

export default function NotificationSettings() {
  const {
    Avatar,
    AvatarFallback,
    Button,
    Input,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    Toggle,
  } = useDS()
  const c = useCopy(COPY)

  // Mercury's own state, kept exactly: one row on, two off, the spend policy
  // pair both on, the subscription row off. Seeded rather than random, because
  // frames on one canvas exist to be compared.
  return (
    <div className="flex min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <aside className="flex w-[200px] shrink-0 flex-col gap-6 border-e border-[var(--bh-border-default)] px-3 py-4">
        <MenuRoot>
          <MenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-[var(--bh-radius-md-6)] px-2 py-1.5 text-start"
            >
              <Avatar size="xs" shape="rounded">
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.workspace}</span>
              <ChevronsUpDown aria-hidden="true" className="size-3.5 opacity-40" />
            </button>
          </MenuTrigger>
          <MenuContent align="start">
            <MenuItem>{c.workspaceSwitch}</MenuItem>
          </MenuContent>
        </MenuRoot>

        <div className="flex items-center gap-2 px-2">
          <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          <span className="text-base font-semibold">{c.settings}</span>
        </div>

        <NavGroup icon={<Building2 className="size-3.5" />} label={c.company} items={c.navCompany} />
        <NavGroup icon={<User className="size-3.5" />} label={c.personal} items={c.navPersonal} current={c.navPersonal[1]} />
        <NavGroup icon={<Compass className="size-3.5" />} label={c.explore} items={c.navExplore} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/*
         * Three columns rather than a flex row with `mx-auto`: an auto margin on
         * a flex item absorbs the space left over *after* the other items, so it
         * centred the field against the region beside the actions instead of
         * against the header. Equal `1fr` tracks put the field on the header's
         * own centre line.
         */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 py-3">
          <span aria-hidden="true" />

          {/* `Input` is 320px wide on its own and only ever shrinks, so the
              container cannot widen it — the width has to reach the component. */}
          <div className="w-[560px] max-w-full">
            <Input
              className="w-full"
              placeholder={c.search}
              aria-label={c.searchLabel}
              leadingIcon={<Search aria-hidden="true" />}
              hasLeadingIcon
              kind="shortcut"
              shortcutKeys={['Mod', 'K']}
            />
          </div>

          {/* One density for the whole row: `Input` at its default is 36px, and
              `Button` reaches 36 through `density`, not through `size`. */}
          <div className="flex items-center justify-end gap-3">
            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="secondary" density="default">
                  {c.moveMoney}
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              </MenuTrigger>
              <MenuContent align="end">
                <MenuItem>{c.sendPayment}</MenuItem>
                <MenuItem>{c.requestFunds}</MenuItem>
                <MenuItem>{c.transferBetween}</MenuItem>
              </MenuContent>
            </MenuRoot>

            <IconButton label={c.hideBalances}>
              <EyeOff aria-hidden="true" />
            </IconButton>
            <IconButton label={c.notificationsBell} dot>
              <Bell aria-hidden="true" />
            </IconButton>

            <Avatar size="md">
              <AvatarFallback>JK</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="min-w-0 px-6 pt-4 pb-10">
          <h1 className="text-2xl font-semibold">{c.title}</h1>
          <p className="mt-1.5 text-sm text-[var(--bh-content-subtle)]">
            {c.sentTo} <span dir="ltr">{c.address}</span>.
          </p>

          <div className="mt-6 grid max-w-[1000px] grid-cols-[180px_1fr] gap-10">
            <nav className="flex flex-col gap-0.5 border-e border-[var(--bh-border-default)] pe-4 text-sm">
              <SubNavItem label={c.tabBalance} />
              <SubNavItem label={c.tabActivity} count={14} />
              <SubNavItem label={c.tabCards} count={3} current />
              <SubNavItem label={c.tabReimbursements} count={4} />
            </nav>

            <div className="min-w-0">
              <section>
                <h2 className="text-lg font-medium">{c.groupCards}</h2>
                <div className="mt-4 grid gap-4">
                  <Row label={c.cardDeclined}>
                    <Toggle defaultChecked aria-label={String(c.cardDeclined)} />
                  </Row>
                  <Row label={c.cardAbroad}>
                    <Toggle aria-label={String(c.cardAbroad)} />
                  </Row>
                  <Row label={c.cardOnline}>
                    <Toggle aria-label={String(c.cardOnline)} />
                  </Row>
                </div>
              </section>

              <section className="mt-8 border-t border-[var(--bh-border-default)] pt-7">
                <h2 className="text-xs font-medium tracking-wide text-[var(--bh-content-subtle)] uppercase">
                  {c.groupSpend}
                </h2>
                <div className="mt-4 grid gap-5">
                  <Row label={c.spendInfo} description={c.spendInfoNote}>
                    <Toggle defaultChecked aria-label={String(c.spendInfo)} />
                  </Row>
                  <Row label={c.spendWeekly} description={c.spendWeeklyNote}>
                    <Toggle defaultChecked aria-label={String(c.spendWeekly)} />
                  </Row>
                </div>
              </section>

              <section className="mt-8 border-t border-[var(--bh-border-default)] pt-7">
                <h2 className="text-xs font-medium tracking-wide text-[var(--bh-content-subtle)] uppercase">
                  {c.groupSubscriptions}
                </h2>
                <div className="mt-4">
                  <Row label={c.subscriptionNew}>
                    <Toggle aria-label={String(c.subscriptionNew)} />
                  </Row>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function NavGroup({
  icon,
  label,
  items,
  current,
}: {
  icon: React.ReactNode
  label: string
  items: readonly string[]
  current?: string
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 px-2 text-xs text-[var(--bh-content-subtle)]">
        {icon}
        {label}
      </div>
      <div className="flex flex-col">
        {items.map((item) => (
          <span
            key={item}
            className={`truncate rounded-[var(--bh-radius-md-6)] px-2 py-1.5 text-sm ${
              item === current ? 'bg-[var(--bh-bg-neutral-subtle)] font-medium' : ''
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Mercury's sub-navigation, where the count is the only element that is not
 * plain text — so it is the only place a Banhaten component appears here.
 */
function SubNavItem({
  label,
  count,
  current,
}: {
  label: string
  count?: number
  current?: boolean
}) {
  const { Badge } = useDS()

  return (
    <span
      className={`flex items-center justify-between gap-2 rounded-[var(--bh-radius-md-6)] px-2.5 py-1.5 ${
        current ? 'bg-[var(--bh-bg-neutral-subtle)] font-medium' : 'text-[var(--bh-content-subtle)]'
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      {count !== undefined && <Badge color="neutral">{count}</Badge>}
    </span>
  )
}

/**
 * A settings row. The control leads, which is Mercury's own arrangement and
 * also `ToggleField`'s default — this file uses a bare `Toggle` rather than
 * `ToggleField` because Mercury's rows carry no reserved space for a
 * description when they have none, and `ToggleField` requires a `label`.
 *
 * Which of those two is right is a question for the audit, not something to
 * settle by picking the component that happens to fit.
 */
function Row({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      {children}
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--bh-content-subtle)]">{description}</p>
        )}
      </div>
    </div>
  )
}

/**
 * The notification bell and the balance toggle, which were hand-rolled markup
 * until this screen was reviewed. Banhaten ships icon-only buttons — `size`
 * carries an `icon-*` scale and `density` resolves onto it — so plain markup
 * here was putting our button under test instead of theirs, against this file's
 * own rule. The unread dot stays ours: it is not in Button's contract.
 */
function IconButton({
  label,
  dot,
  children,
}: {
  label: string
  dot?: boolean
  children: React.ReactNode
}) {
  const { Button } = useDS()

  return (
    <span className="relative inline-flex">
      <Button variant="soft" size="icon" density="default" aria-label={label}>
        {children}
      </Button>
      {dot && (
        <span className="pointer-events-none absolute end-1 top-1 size-1.5 rounded-[var(--bh-radius-full)] bg-[var(--bh-interactive-danger-default)]" />
      )}
    </span>
  )
}
