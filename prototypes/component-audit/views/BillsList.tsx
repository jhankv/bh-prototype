import { useMemo, useState } from 'react'
import { ChevronDown, Columns3, ListFilter, MoreVertical, Search } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'
import { BILLS, type Bill, type BillStatus } from './bills'
import type { BadgeProps } from '../../../sandboxes/banhaten/components/ui/badge'

/**
 * Xero's bills list, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/e2205dbe-6e99-4b94-b47c-0be070a76fe1
 *
 * This screen exists to give four findings their frame back. `page-header-1`,
 * `page-header-2` and `breadcrumbs-1` were recorded on a composition that no
 * longer sits on a canvas, and a finding nobody can reproduce is an opinion.
 *
 * Xero is a better stress case than the screen it replaces. Its six tabs read
 * `All`, `Draft 13`, `Awaiting approval 1`, `Awaiting payment 6`, `Paid`,
 * `Repeating`, which is three characters at one end and nineteen at the other.
 * `page-header-1` says every tab gets `list ÷ count` regardless of its label, so
 * the widest label is where the clipping shows, and here the spread is extreme
 * rather than convenient.
 *
 * The filter chips are `Tag` with `onClose`, which is what that component is for
 * and the first screen here to use it.
 *
 * The top navigation bar is plain markup. Banhaten ships no application nav, and
 * building one would put ours under test instead of yours.
 */

const COPY = {
  org: { en: 'Northwind', ar: 'نورث ويند' },
  navHome: { en: 'Home', ar: 'الرئيسية' },
  navSales: { en: 'Sales', ar: 'المبيعات' },
  navPurchases: { en: 'Purchases', ar: 'المشتريات' },
  navReporting: { en: 'Reporting', ar: 'التقارير' },
  navAccounting: { en: 'Accounting', ar: 'المحاسبة' },
  navContacts: { en: 'Contacts', ar: 'جهات الاتصال' },

  breadcrumbPurchases: { en: 'Purchases overview', ar: 'نظرة عامة على المشتريات' },
  title: { en: 'Bills', ar: 'الفواتير' },
  description: {
    en: 'Every bill your suppliers have sent, including drafts you have not submitted yet.',
    ar: 'كل فاتورة أرسلها موردوك، بما في ذلك المسودات التي لم ترسلها بعد.',
  },

  tabsLabel: { en: 'Bill status', ar: 'حالة الفاتورة' },
  tabs: {
    en: ['All', 'Draft 13', 'Awaiting approval 1', 'Awaiting payment 6', 'Paid', 'Repeating'],
    ar: ['الكل', 'مسودة ١٣', 'بانتظار الموافقة ١', 'بانتظار الدفع ٦', 'مدفوعة', 'متكررة'],
  },

  newBill: { en: 'New bill', ar: 'فاتورة جديدة' },
  setUpPayments: { en: 'Set up bill payments', ar: 'إعداد دفع الفواتير' },
  moreActions: { en: 'More actions', ar: 'إجراءات أخرى' },

  search: {
    en: 'Enter a contact, amount, or reference',
    ar: 'أدخل جهة اتصال أو مبلغًا أو مرجعًا',
  },
  searchLabel: { en: 'Search bills', ar: 'البحث في الفواتير' },
  filter: { en: 'Filter', ar: 'تصفية' },
  columns: { en: 'Columns', ar: 'الأعمدة' },

  chipDate: { en: 'Any date · May 01 – May 31, 2026', ar: 'أي تاريخ · ١ – ٣١ مايو ٢٠٢٦' },
  chipTypes: { en: 'Document types · Bills, Credit Notes', ar: 'أنواع المستندات · فواتير وإشعارات دائنة' },
  removeFilter: { en: 'Remove filter', ar: 'إزالة عامل التصفية' },
  filterByStatus: { en: 'Filter by status', ar: 'تصفية حسب الحالة' },
  clearStatuses: { en: 'Clear status filters', ar: 'مسح عوامل تصفية الحالة' },
  noMatchTitle: { en: 'No bills match these filters', ar: 'لا توجد فواتير تطابق عوامل التصفية' },
  noMatchBody: {
    en: 'Nothing in this list has the status you picked. Clear the filter to see every bill again.',
    ar: 'لا يوجد شيء في هذه القائمة بالحالة التي اخترتها. امسح عامل التصفية لعرض كل الفواتير.',
  },

  colFrom: { en: 'From', ar: 'من' },
  colStatus: { en: 'Status', ar: 'الحالة' },
  colReference: { en: 'Reference', ar: 'المرجع' },
  colDate: { en: 'Date', ar: 'التاريخ' },
  colDue: { en: 'Due date', ar: 'تاريخ الاستحقاق' },
  colAmount: { en: 'Amount', ar: 'المبلغ' },

  statusAwaitingPayment: { en: 'Awaiting payment', ar: 'بانتظار الدفع' },
  statusDraft: { en: 'Draft', ar: 'مسودة' },
  statusAwaitingApproval: { en: 'Awaiting approval', ar: 'بانتظار الموافقة' },
  statusPaid: { en: 'Paid', ar: 'مدفوعة' },

  total: { en: '8 items · 3,651.00 USD', ar: '٨ عناصر · ٣٬٦٥١٫٠٠ دولار' },
} as const

/** Filter order, and the order the menu lists them in. */
const STATUS_ORDER: BillStatus[] = [
  'draft',
  'awaiting-approval',
  'awaiting-payment',
  'paid',
]

const STATUS_TONE: Record<BillStatus, BadgeProps['color']> = {
  'awaiting-payment': 'green',
  draft: 'neutral',
  'awaiting-approval': 'blue',
  paid: 'green',
}

export default function BillsList() {
  const {
    Badge,
    Button,
    EmptyState,
    Input,
    MenuContent,
    MenuItem,
    MenuItemSwitch,
    MenuItemText,
    MenuLabel,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
    PageHeader,
    Table,
    Tag,
  } = useDS()
  const c = useCopy(COPY)

  const [tab, setTab] = useState(0)
  const [chips, setChips] = useState({ date: true, types: true })
  const [statuses, setStatuses] = useState<BillStatus[]>([])

  // An empty selection means "no status filter", not "no rows".
  const rows = useMemo(
    () => (statuses.length === 0 ? BILLS : BILLS.filter((bill) => statuses.includes(bill.status))),
    [statuses],
  )

  function toggleStatus(status: BillStatus) {
    setStatuses((current) =>
      current.includes(status)
        ? current.filter((each) => each !== status)
        : [...current, status],
    )
  }

  const statusLabel: Record<BillStatus, string> = {
    'awaiting-payment': c.statusAwaitingPayment,
    draft: c.statusDraft,
    'awaiting-approval': c.statusAwaitingApproval,
    paid: c.statusPaid,
  }

  const columns = [
    {
      id: 'from',
      header: c.colFrom,
      sortable: true,
      width: 'fill' as const,
      renderCell: (row: Bill) => (
        <span dir="auto" className="block truncate font-medium">
          {row.from}
        </span>
      ),
    },
    {
      id: 'status',
      header: c.colStatus,
      width: 170,
      renderCell: (row: Bill) => (
        <Badge color={STATUS_TONE[row.status]}>{statusLabel[row.status]}</Badge>
      ),
    },
    // Every column needs its own renderCell. `Table` prints nothing for a
    // column that has neither `renderCell` nor `item`, even when `id` matches a
    // key on the row. Written without them first, and three columns came back
    // empty. See `table-3`.
    {
      id: 'reference',
      header: c.colReference,
      width: 120,
      sortable: true,
      renderCell: (row: Bill) => <span className="font-mono text-xs">{row.reference}</span>,
    },
    { id: 'date', header: c.colDate, width: 130, sortable: true, renderCell: (row: Bill) => row.date },
    { id: 'due', header: c.colDue, width: 130, sortable: true, renderCell: (row: Bill) => row.due },
    {
      id: 'amount',
      header: c.colAmount,
      width: 120,
      align: 'end' as const,
      sortable: true,
      renderCell: (row: Bill) => <span className="tabular-nums">{row.amount}</span>,
    },
  ]

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      {/* Plain markup: Banhaten ships no application navigation bar. */}
      <nav className="flex items-center gap-5 bg-[var(--bh-interactive-brand-default)] px-5 py-2.5 text-sm text-[var(--bh-content-on-color,white)]">
        <span className="font-semibold">{c.org}</span>
        {[c.navHome, c.navSales, c.navPurchases, c.navReporting, c.navAccounting, c.navContacts].map(
          (item) => (
            <span key={item} className={item === c.navPurchases ? 'font-medium' : 'opacity-80'}>
              {item}
            </span>
          ),
        )}
      </nav>

      <div className="px-6 py-5">
        {/* The component four findings are about. Breadcrumbs, title,
            description and tabs all come from it, and its tabs are the ones
            page-header-1 says get an equal share of the list regardless of
            what they say. */}
        <PageHeader
          breadcrumbs={[{ label: c.breadcrumbPurchases, href: '#' }]}
          title={c.title}
          description={c.description}
          tabs={{
            ariaLabel: c.tabsLabel,
            items: [...c.tabs],
            activeIndex: tab,
            onActiveIndexChange: (next: number) => setTab(next),
          }}
          actions={[
            { label: c.setUpPayments, href: '#' },
            { label: c.newBill },
          ]}
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <div className="min-w-[280px] flex-1">
            <Input
              density="compact"
              placeholder={c.search}
              aria-label={c.searchLabel}
              leadingIcon={<Search aria-hidden="true" />}
            />
          </div>
          {/* `density`, not `size`. Button's `sm` is 36px and Input's `compact`
              is 32 — the size words are per-component and do not line up across
              them. See `architecture-4`. */}
          {/* Multi-select, so every row stops `onSelect` from closing the menu.
              `MenuItemSwitch` looks decorative — it is a `<span aria-hidden>` —
              but `MenuItem` detects it and switches to Radix's `CheckboxItem`,
              so the ROW carries `role="menuitemcheckbox"` and `aria-checked`.
              Verified in the DOM, not assumed. */}
          <MenuRoot>
            <MenuTrigger asChild>
              <Button variant="secondary" density="compact">
                <ListFilter aria-hidden="true" className="size-3.5" />
                {c.filter}
                {statuses.length > 0 && <Badge color="blue">{statuses.length}</Badge>}
                <ChevronDown aria-hidden="true" className="size-3.5" />
              </Button>
            </MenuTrigger>
            <MenuContent width="menu" align="start">
              <MenuLabel>{c.filterByStatus}</MenuLabel>
              {STATUS_ORDER.map((status) => (
                <MenuItem
                  key={status}
                  // Left unannotated deliberately. `MenuItemProps` intersects a
                  // div's DOM `onSelect` with Radix's, so annotating it the way
                  // Radix documents — `(event: Event)` — does not compile. See
                  // `menu-1`.
                  onSelect={(event) => {
                    event.preventDefault()
                    toggleStatus(status)
                  }}
                >
                  <MenuItemText>{statusLabel[status]}</MenuItemText>
                  <MenuItemSwitch active={statuses.includes(status)} />
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem disabled={statuses.length === 0} onSelect={() => setStatuses([])}>
                <MenuItemText>{c.clearStatuses}</MenuItemText>
              </MenuItem>
            </MenuContent>
          </MenuRoot>
          <Button variant="secondary" density="compact">
            <Columns3 aria-hidden="true" className="size-3.5" />
            {c.columns}
          </Button>
          <Button
            variant="secondary"
            density="compact"
            size="icon"
            aria-label={c.moreActions}
          >
            <MoreVertical aria-hidden="true" />
          </Button>
        </div>

        {/* Xero's dismissible filter chips. This is what `Tag` is for, and the
            first screen in this audit to use it. */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.date && (
            <Tag
              showCloseButton
              closeLabel={c.removeFilter}
              onClose={() => setChips((s) => ({ ...s, date: false }))}
            >
              {c.chipDate}
            </Tag>
          )}
          {chips.types && (
            <Tag
              showCloseButton
              closeLabel={c.removeFilter}
              onClose={() => setChips((s) => ({ ...s, types: false }))}
            >
              {c.chipTypes}
            </Tag>
          )}
          {statuses.map((status) => (
            <Tag
              key={status}
              showCloseButton
              closeLabel={c.removeFilter}
              onClose={() => toggleStatus(status)}
            >
              {statusLabel[status]}
            </Tag>
          ))}
        </div>

        {/* Filtering to nothing is a state the screen has to have an answer
            for, and `EmptyState` is the component for it — a different case
            from `AppsOverview`, where nothing was ever created. */}
        <div className="mt-4">
          {rows.length === 0 ? (
            <EmptyState
              title={c.noMatchTitle}
              description={c.noMatchBody}
              actions={[{ label: c.clearStatuses, onAction: () => setStatuses([]) }]}
            />
          ) : (
            <Table columns={columns} rows={rows} size="sm" />
          )}
        </div>

        <p className="mt-3 text-end text-sm text-[var(--bh-content-subtle)]">{c.total}</p>
      </div>
    </div>
  )
}
