import { useState } from 'react'
import { Bell, ChevronDown, Eye, ExternalLink, HelpCircle, ListFilter, MoreHorizontal, Star, Trash2 } from 'lucide-react'
import { useDS } from '@/ds'
import { useCopy } from '@/copy'
import type { BadgeProps } from '../../../sandboxes/banhaten/components/ui/badge'

/**
 * Remote's team expenses list, reproduced as faithfully as Banhaten allows.
 *
 * https://mobbin.com/screens/4cbe7498-0064-49a8-a80c-692431aaaae3
 *
 * The only screen here with a paginated table footer, which is its whole reason
 * for existing. `table-1` and `pagination-1` both live in that footer and both
 * lost their frame when the Sales Console went, so neither could be reproduced.
 *
 * `table-1` is about the caption printing a count nobody measured. `pagination-1`
 * is about the Arabic message set existing in `pagination.tsx` while `DataTable`
 * never reaches for it. Both need `DataTable` with `pagination` configured and
 * `showCaption` on, which is exactly what Remote's footer shows. `rows` is state
 * rather than a constant so `pagination.totalRows` stays reactive — deleting a
 * row here makes `table-1`'s mismatch sharper: the toolbar's own count moves and
 * the footer's invented one does not.
 *
 * Read the `-rtl` twin for `pagination-1`. Every string on that screen is Arabic
 * except the two in the footer.
 *
 * `requestedBy` renders its own avatar through `renderCell` rather than through
 * `item: { type: "avatarText" }`. That item type carries no `dir` of its own —
 * it is the mechanism behind `table-2`, and today the only frame demonstrating
 * that is the synthetic one in `Specimens`. Reproducing it here too is a real
 * decision about the report's coverage, not a composition detail, so it stays
 * out of this pass.
 *
 * Search and the filter chips are our own `Toolbar` above `DataTable`, not
 * `DataTable`'s own `search` prop — see `table-5`. Its `ToolbarSearch` renders
 * with `width="full"` and `flex: 1 1 min(100%, 256px)`, and with nothing else
 * sharing its `ToolbarSection`, flex-grow fills the whole row regardless of the
 * `min(100%, var(--bh-input-width))` written on the same rule — a flex-basis
 * that flex-grow ignores once it is the only child. `DataTableSearch` exposes
 * no `className` or width to override it. Filtering `rows` ourselves before
 * handing them to `DataTable` is the only way to get a search box sized like a
 * real product's, and it costs this screen its only real-product coverage of
 * `DataTable`'s own `search` — the trade discussed and accepted rather than
 * found and shipped around silently.
 */

const COPY = {
  title: { en: "Team's expenses", ar: 'نفقات الفريق' },

  addExpenses: { en: 'Add expenses', ar: 'إضافة نفقات' },
  newExpense: { en: 'New expense', ar: 'نفقة جديدة' },
  importExpenses: { en: 'Import expenses', ar: 'استيراد النفقات' },
  openInNewTab: { en: 'Open in new tab', ar: 'فتح في علامة تبويب جديدة' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  help: { en: 'Help', ar: 'مساعدة' },

  tabsLabel: { en: 'Request status', ar: 'حالة الطلب' },
  tabs: {
    en: ['Pending', 'Approved', 'Declined', 'All requests'],
    ar: ['قيد الانتظار', 'موافق عليها', 'مرفوضة', 'كل الطلبات'],
  },

  search: { en: 'Search', ar: 'بحث' },
  filterTrigger: { en: 'Filter', ar: 'تصفية' },
  filterMenuDate: { en: 'Created date', ar: 'تاريخ الإنشاء' },
  filterMenuBy: { en: 'Created by', ar: 'أنشأها' },
  clearFilters: { en: 'Clear filters', ar: 'مسح عوامل التصفية' },
  filterDate: { en: 'Created date: 2026-05-17', ar: 'تاريخ الإنشاء: ٢٠٢٦-٠٥-١٧' },
  filterBy: { en: 'Created by: Ji Ho Lim', ar: 'أنشأها: جي هو ليم' },
  removeFilter: { en: 'Remove filter', ar: 'إزالة عامل التصفية' },
  moreActions: { en: 'More actions', ar: 'إجراءات أخرى' },
  exportCsv: { en: 'Export as CSV', ar: 'تصدير كملف CSV' },

  colRequestedBy: { en: 'Requested by', ar: 'مقدم الطلب' },
  colCreated: { en: 'Created date', ar: 'تاريخ الإنشاء' },
  colTitle: { en: 'Title', ar: 'العنوان' },
  colAmount: { en: 'Amount', ar: 'المبلغ' },
  colConverted: { en: 'Converted amount', ar: 'المبلغ المحول' },
  colCategory: { en: 'Category', ar: 'الفئة' },
  colStatus: { en: 'Status', ar: 'الحالة' },

  reimbursed: { en: 'Reimbursed', ar: 'تم الاسترداد' },
  approved: { en: 'Approved', ar: 'موافق عليه' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },

  catEquipment: { en: 'Work equipment (employee-owned)', ar: 'معدات عمل (ملك الموظف)' },
  catTolls: { en: 'Tolls or parking', ar: 'رسوم طرق أو مواقف' },
  catTravel: { en: 'Travel', ar: 'سفر' },

  rowActions: { en: 'Row actions', ar: 'إجراءات الصف' },
  viewExpense: { en: 'View expense', ar: 'عرض النفقة' },
  deleteExpense: { en: 'Delete expense', ar: 'حذف النفقة' },
} as const

type Expense = {
  id: string
  requestedBy: string
  created: string
  title: string
  amount: string
  convertedAmount: string
  category: string
  status: 'reimbursed' | 'approved' | 'pending'
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function ExpensesList() {
  const {
    Avatar,
    AvatarFallback,
    Badge,
    Button,
    DataTable,
    MenuContent,
    MenuItem,
    MenuItemIcon,
    MenuItemSwitch,
    MenuItemText,
    MenuPortal,
    MenuRoot,
    MenuSeparator,
    MenuTrigger,
    Tag,
    Toolbar,
    ToolbarMoreButton,
    ToolbarSearch,
    ToolbarSection,
    ToolbarSpacer,
  } = useDS()
  const c = useCopy(COPY)

  const [tab, setTab] = useState(1)
  const [chips, setChips] = useState({ date: true, by: true })
  const [query, setQuery] = useState('')

  // Remote's own rows. Seeded, because frames on one canvas exist to be compared.
  const [rows, setRows] = useState<Expense[]>([
    {
      id: '1',
      requestedBy: 'Alex Smith',
      created: 'Nov 17, 2026',
      title: 'Expense A',
      amount: '210.00 USD',
      convertedAmount: '210.01 USD',
      category: c.catEquipment,
      status: 'reimbursed',
    },
    {
      id: '2',
      requestedBy: 'Alex Smith',
      created: 'Nov 17, 2026',
      title: 'Expense B',
      amount: '100.00 USD',
      convertedAmount: '100.00 USD',
      category: c.catTolls,
      status: 'approved',
    },
    {
      id: '3',
      requestedBy: 'Ji Ho Lim',
      created: 'Nov 16, 2026',
      title: 'Expense C',
      amount: '48.20 USD',
      convertedAmount: '48.20 USD',
      category: c.catTravel,
      status: 'pending',
    },
    {
      id: '4',
      requestedBy: 'Priya Sharma',
      created: 'Nov 15, 2026',
      title: 'Expense D',
      amount: '76.50 USD',
      convertedAmount: '76.50 USD',
      category: c.catTravel,
      status: 'approved',
    },
    {
      id: '5',
      requestedBy: 'Alex Smith',
      created: 'Nov 15, 2026',
      title: 'Expense E',
      amount: '32.00 USD',
      convertedAmount: '32.00 USD',
      category: c.catTolls,
      status: 'reimbursed',
    },
    {
      id: '6',
      requestedBy: 'Ji Ho Lim',
      created: 'Nov 14, 2026',
      title: 'Expense F',
      amount: '189.99 USD',
      convertedAmount: '190.05 USD',
      category: c.catEquipment,
      status: 'pending',
    },
    {
      id: '7',
      requestedBy: 'Priya Sharma',
      created: 'Nov 14, 2026',
      title: 'Expense G',
      amount: '24.75 USD',
      convertedAmount: '24.75 USD',
      category: c.catTolls,
      status: 'approved',
    },
    {
      id: '8',
      requestedBy: 'Alex Smith',
      created: 'Nov 13, 2026',
      title: 'Expense H',
      amount: '340.00 USD',
      convertedAmount: '340.12 USD',
      category: c.catEquipment,
      status: 'reimbursed',
    },
    {
      id: '9',
      requestedBy: 'Ji Ho Lim',
      created: 'Nov 12, 2026',
      title: 'Expense I',
      amount: '58.30 USD',
      convertedAmount: '58.30 USD',
      category: c.catTravel,
      status: 'approved',
    },
    {
      id: '10',
      requestedBy: 'Priya Sharma',
      created: 'Nov 12, 2026',
      title: 'Expense J',
      amount: '15.00 USD',
      convertedAmount: '15.00 USD',
      category: c.catTolls,
      status: 'pending',
    },
    {
      id: '11',
      requestedBy: 'Alex Smith',
      created: 'Nov 11, 2026',
      title: 'Expense K',
      amount: '92.40 USD',
      convertedAmount: '92.40 USD',
      category: c.catTravel,
      status: 'approved',
    },
    {
      id: '12',
      requestedBy: 'Ji Ho Lim',
      created: 'Nov 10, 2026',
      title: 'Expense L',
      amount: '61.10 USD',
      convertedAmount: '61.10 USD',
      category: c.catEquipment,
      status: 'reimbursed',
    },
  ])

  const statusLabel = { reimbursed: c.reimbursed, approved: c.approved, pending: c.pending }
  const statusTone: Record<Expense['status'], BadgeProps['color']> = {
    reimbursed: 'green',
    approved: 'green',
    pending: 'amber',
  }

  const addExpense = () => {
    setRows((current) => [
      {
        id: `new-${current.length}`,
        requestedBy: 'Alex Smith',
        created: 'Nov 18, 2026',
        title: `Expense ${String.fromCharCode(65 + current.length)}`,
        amount: '0.00 USD',
        convertedAmount: '0.00 USD',
        category: c.catTravel,
        status: 'pending',
      },
      ...current,
    ])
  }

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  // Ours, since the search box moved out of `DataTable` — see the file docstring
  // for why. Same idea as `getDataTableSearchText`, joining the fields a person
  // would actually search by rather than every field on the row.
  const normalizedQuery = query.trim().toLowerCase()
  const filteredRows = normalizedQuery
    ? rows.filter((row) =>
        [row.requestedBy, row.title, row.category, statusLabel[row.status], row.amount]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : rows

  const columns = [
    // Each of these needs its own renderCell. A column with neither renderCell
    // nor item prints an empty cell even when `id` matches a row key. See
    // `table-3`; this screen found it a second time.
    {
      id: 'requestedBy',
      header: c.colRequestedBy,
      width: 160,
      sortable: true,
      renderCell: (row: Expense) => (
        <span className="flex items-center gap-2">
          <Avatar size="xs">
            <AvatarFallback size="xs">{initials(row.requestedBy)}</AvatarFallback>
          </Avatar>
          <span dir="auto">{row.requestedBy}</span>
        </span>
      ),
    },
    {
      id: 'created',
      header: c.colCreated,
      width: 140,
      sortable: true,
      renderCell: (row: Expense) => row.created,
    },
    { id: 'title', header: c.colTitle, width: 140, renderCell: (row: Expense) => row.title },
    {
      id: 'amount',
      header: c.colAmount,
      width: 140,
      align: 'end' as const,
      sortable: true,
      renderCell: (row: Expense) => <span className="tabular-nums">{row.amount}</span>,
    },
    {
      id: 'convertedAmount',
      header: c.colConverted,
      width: 150,
      align: 'end' as const,
      renderCell: (row: Expense) => <span className="tabular-nums">{row.convertedAmount}</span>,
    },
    {
      id: 'category',
      header: c.colCategory,
      width: 'fill' as const,
      renderCell: (row: Expense) => (
        <span dir="auto" className="block truncate">
          {row.category}
        </span>
      ),
    },
    {
      id: 'status',
      header: c.colStatus,
      width: 150,
      renderCell: (row: Expense) => (
        <Badge color={statusTone[row.status]} type="dot">
          {statusLabel[row.status]}
        </Badge>
      ),
    },
    // A real menu, same as the row menu on `neon`: it opens, it closes on
    // Escape, and deleting a row here actually removes it.
    {
      id: 'actions',
      header: '',
      width: 56,
      align: 'end' as const,
      renderCell: (row: Expense) => (
        <MenuRoot>
          <MenuTrigger asChild>
            <Button variant="ghost" density="compact" size="icon" aria-label={c.rowActions}>
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </MenuTrigger>
          <MenuPortal>
            <MenuContent width="menu" align="end">
              <MenuItem onSelect={() => undefined}>
                <MenuItemIcon>
                  <Eye aria-hidden="true" />
                </MenuItemIcon>
                {c.viewExpense}
              </MenuItem>
              <MenuSeparator />
              <MenuItem onSelect={() => removeRow(row.id)}>
                <MenuItemIcon>
                  <Trash2 aria-hidden="true" />
                </MenuItemIcon>
                {c.deleteExpense}
              </MenuItem>
            </MenuContent>
          </MenuPortal>
        </MenuRoot>
      ),
    },
  ]

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="px-6 py-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{c.title}</h1>
            <Star aria-hidden="true" className="size-4 text-[var(--bh-content-subtle)]" />
          </div>

          <div className="flex items-center gap-2">
            <MenuRoot>
              <MenuTrigger asChild>
                <Button size="sm">
                  {c.addExpenses}
                  <ChevronDown aria-hidden="true" data-icon="inline-end" />
                </Button>
              </MenuTrigger>
              <MenuPortal>
                <MenuContent align="end">
                  <MenuItem onSelect={addExpense}>{c.newExpense}</MenuItem>
                  <MenuItem onSelect={() => undefined}>{c.importExpenses}</MenuItem>
                </MenuContent>
              </MenuPortal>
            </MenuRoot>

            <IconButton label={c.openInNewTab}>
              <ExternalLink aria-hidden="true" />
            </IconButton>
            <IconButton label={c.notifications} dot>
              <Bell aria-hidden="true" />
            </IconButton>
            <IconButton label={c.help}>
              <HelpCircle aria-hidden="true" />
            </IconButton>

            <Avatar size="md">
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Plain markup: Banhaten's Tabs is under review in page-header-1 on the
            `neon` frame. Re-testing a known defect here would cost a screen and
            teach nothing. */}
        <nav className="mb-4 flex gap-5 border-b border-[var(--bh-border-default)] text-sm">
          {c.tabs.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(index)}
              className={`-mb-px border-b-2 py-2 ${
                index === tab
                  ? 'border-[var(--bh-interactive-brand-default)] font-medium'
                  : 'border-transparent text-[var(--bh-content-subtle)]'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <Toolbar wrap className="mb-3">
          <ToolbarSection wrap>
            <ToolbarSearch
              placeholder={c.search}
              aria-label={c.search}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />

            {/* Multi-select, so every row stops `onSelect` from closing the
                menu. Same idiom as the bills filter: `MenuItemSwitch` looks
                decorative but `MenuItem` detects it and switches the row to
                `role="menuitemcheckbox"`. */}
            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="secondary" density="compact">
                  <ListFilter aria-hidden="true" data-icon="inline-start" />
                  {c.filterTrigger}
                </Button>
              </MenuTrigger>
              <MenuPortal>
                <MenuContent align="start">
                  <MenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      setChips((s) => ({ ...s, date: !s.date }))
                    }}
                  >
                    <MenuItemText>{c.filterMenuDate}</MenuItemText>
                    <MenuItemSwitch active={chips.date} />
                  </MenuItem>
                  <MenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      setChips((s) => ({ ...s, by: !s.by }))
                    }}
                  >
                    <MenuItemText>{c.filterMenuBy}</MenuItemText>
                    <MenuItemSwitch active={chips.by} />
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    disabled={!chips.date && !chips.by}
                    onSelect={() => setChips({ date: false, by: false })}
                  >
                    {c.clearFilters}
                  </MenuItem>
                </MenuContent>
              </MenuPortal>
            </MenuRoot>

            {chips.date && (
              <Tag closeLabel={c.removeFilter} onClose={() => setChips((s) => ({ ...s, date: false }))}>
                {c.filterDate}
              </Tag>
            )}
            {chips.by && (
              <Tag closeLabel={c.removeFilter} onClose={() => setChips((s) => ({ ...s, by: false }))}>
                {c.filterBy}
              </Tag>
            )}
          </ToolbarSection>

          <ToolbarSpacer />

          <MenuRoot>
            <MenuTrigger asChild>
              <ToolbarMoreButton label={c.moreActions} />
            </MenuTrigger>
            <MenuPortal>
              <MenuContent width="menu" align="end">
                <MenuItem onSelect={() => undefined}>{c.exportCsv}</MenuItem>
              </MenuContent>
            </MenuPortal>
          </MenuRoot>
        </Toolbar>

        {/* The footer is the point. `showCaption` turns on the slot that
            `table-1` found printing an invented count, and the same footer is
            where `pagination-1` says the Arabic strings never arrive. */}
        {/* No scroll wrapper. `.ds-table-wrap` already carries `min-width: 0`,
            `overflow: auto` and `contain: paint` around the grid alone. Wrapping
            DataTable instead put the search field inside the clip too, and its
            focus ring — 4px of box-shadow painted OUTSIDE the field's box — was
            cut off on every side. See `input-4` for the ring, and method.md. */}
        <DataTable
          columns={columns}
          rows={filteredRows}
          size="sm"
          search={false}
          pagination={{ pageSize: 10, totalRows: filteredRows.length, showCaption: true }}
        />
      </div>
    </div>
  )
}

/**
 * The notification bell and the header's other icon buttons. Banhaten ships
 * icon-only buttons — `size` carries an `icon-*` scale and `density` resolves
 * onto it — so plain markup here would be putting our button under test
 * instead of theirs. The unread dot stays ours: it is not in Button's
 * contract. Copied from `NotificationSettings`'s identical helper rather than
 * reinvented, so the two screens carry the same chrome the same way.
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
