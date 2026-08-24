import { useState } from 'react'
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
 * `showCaption` on, which is exactly what Remote's footer shows.
 *
 * Read the `-rtl` twin for `pagination-1`. Every string on that screen is Arabic
 * except the two in the footer.
 */

const COPY = {
  title: { en: "Team's expenses", ar: 'نفقات الفريق' },
  description: {
    en: 'Expenses submitted by your team, and their reimbursement status.',
    ar: 'النفقات التي قدمها فريقك وحالة استردادها.',
  },

  tabsLabel: { en: 'Request status', ar: 'حالة الطلب' },
  tabs: {
    en: ['Pending', 'Approved', 'Declined', 'All requests'],
    ar: ['قيد الانتظار', 'موافق عليها', 'مرفوضة', 'كل الطلبات'],
  },

  addExpenses: { en: 'Add expenses', ar: 'إضافة نفقات' },
  search: { en: 'Search', ar: 'بحث' },
  filterDate: { en: 'Created date: 2026-05-17', ar: 'تاريخ الإنشاء: ٢٠٢٦-٠٥-١٧' },
  filterBy: { en: 'Created by: Ji Ho Lim', ar: 'أنشأها: جي هو ليم' },
  removeFilter: { en: 'Remove filter', ar: 'إزالة عامل التصفية' },

  colRequestedBy: { en: 'Requested by', ar: 'مقدم الطلب' },
  colCreated: { en: 'Created date', ar: 'تاريخ الإنشاء' },
  colTitle: { en: 'Title', ar: 'العنوان' },
  colAmount: { en: 'Amount', ar: 'المبلغ' },
  colCategory: { en: 'Category', ar: 'الفئة' },
  colStatus: { en: 'Status', ar: 'الحالة' },

  reimbursed: { en: 'Reimbursed', ar: 'تم الاسترداد' },
  approved: { en: 'Approved', ar: 'موافق عليه' },
  pending: { en: 'Pending', ar: 'قيد الانتظار' },

  catEquipment: { en: 'Work equipment (employee-owned)', ar: 'معدات عمل (ملك الموظف)' },
  catTolls: { en: 'Tolls or parking', ar: 'رسوم طرق أو مواقف' },
  catTravel: { en: 'Travel', ar: 'سفر' },
} as const

type Expense = {
  id: string
  requestedBy: string
  created: string
  title: string
  amount: string
  category: string
  status: 'reimbursed' | 'approved' | 'pending'
}

export default function ExpensesList() {
  const { Badge, Button, DataTable, Tag } = useDS()
  const c = useCopy(COPY)

  const [tab, setTab] = useState(1)
  const [chips, setChips] = useState({ date: true, by: true })

  const statusLabel = { reimbursed: c.reimbursed, approved: c.approved, pending: c.pending }
  const statusTone: Record<Expense['status'], BadgeProps['color']> = {
    reimbursed: 'green',
    approved: 'green',
    pending: 'amber',
  }

  // Remote's own rows. Seeded, because frames on one canvas exist to be compared.
  const rows: Expense[] = [
    {
      id: '1',
      requestedBy: 'Alex Smith',
      created: 'Nov 17, 2026',
      title: 'Expense A',
      amount: '210.00 USD',
      category: c.catEquipment,
      status: 'reimbursed',
    },
    {
      id: '2',
      requestedBy: 'Alex Smith',
      created: 'Nov 17, 2026',
      title: 'Expense B',
      amount: '100.00 USD',
      category: c.catTolls,
      status: 'approved',
    },
    {
      id: '3',
      requestedBy: 'Ji Ho Lim',
      created: 'Nov 16, 2026',
      title: 'Expense C',
      amount: '48.20 USD',
      category: c.catTravel,
      status: 'pending',
    },
  ]

  const columns = [
    // Each of these needs its own renderCell. A column with neither renderCell
    // nor item prints an empty cell even when `id` matches a row key. See
    // `table-3`; this screen found it a second time.
    {
      id: 'requestedBy',
      header: c.colRequestedBy,
      width: 160,
      sortable: true,
      renderCell: (row: Expense) => <span dir="auto">{row.requestedBy}</span>,
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
  ]

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="px-6 py-6">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{c.title}</h1>
            <p className="mt-1 text-sm text-[var(--bh-content-subtle)]">{c.description}</p>
          </div>
          <Button size="sm">{c.addExpenses}</Button>
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

        <div className="mb-3 flex flex-wrap items-center gap-2">
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
        </div>

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
          rows={rows}
          size="sm"
          search={{ placeholder: c.search, label: c.search }}
          pagination={{ pageSize: 3, totalRows: rows.length, showCaption: true }}
        />
      </div>
    </div>
  )
}
