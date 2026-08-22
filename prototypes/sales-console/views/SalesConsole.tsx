import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useDS } from '@/ds'
import { t, useCopy } from '@/copy'
import { CHANNEL_LABEL, METRICS, ORDERS, STATUS_LABEL, STATUS_TONE, type Order } from './orders'

/**
 * An orders console, modelled on Squarespace's Orders screen with HubSpot's
 * global ⌘K search.
 *
 * This is a composition, not a gallery. A gallery answers "does Badge render
 * every colour"; a composition answers "does Badge still read as a status when
 * it sits beside an avatar, inside a sorted column, in a right-to-left
 * document". The second question is the one that produces findings.
 *
 * Every row of the fixture is chosen to push something past a comfortable case
 * — see views/orders.ts.
 *
 * All interface copy is written twice and picked by the frame's direction. An
 * Arabic layout showing English strings tests one thing — Latin text inside an
 * RTL container — and hides everything else: no uppercase in the script, tighter
 * line height than Arabic needs, letter-spacing that breaks cursive joins.
 */

const COPY = {
  brand: { en: 'Northwind', ar: 'نورث ويند' },
  globalSearch: { en: 'Search across Northwind', ar: 'ابحث في نورث ويند' },
  globalSearchLabel: { en: 'Global search', ar: 'بحث عام' },
  finance: { en: 'Finance', ar: 'المالية' },
  sales: { en: 'Sales', ar: 'المبيعات' },
  orders: { en: 'Orders', ar: 'الطلبات' },
  description: {
    en: 'Every completed transaction across Retail, Online and Wholesale. Refunds appear once the payment processor settles them.',
    ar: 'كل معاملة مكتملة عبر التجزئة والإنترنت والبيع بالجملة. تظهر المبالغ المستردة بمجرد أن يسويها مزود الدفع.',
  },
  updated: { en: 'Updated 4 minutes ago', ar: 'آخر تحديث قبل ٤ دقائق' },
  summary: { en: 'Summary', ar: 'الملخص' },
  export: { en: 'Export', ar: 'تصدير' },
  createOrder: { en: 'Create order', ar: 'إنشاء طلب' },
  import: { en: 'Import', ar: 'استيراد' },
  search: {
    en: 'Search by customer, email or order number',
    ar: 'ابحث حسب العميل أو البريد الإلكتروني أو رقم الطلب',
  },
  colOrder: { en: 'Order', ar: 'الطلب' },
  colCustomer: { en: 'Customer', ar: 'العميل' },
  colStatus: { en: 'Status', ar: 'الحالة' },
  colFulfillment: { en: 'Fulfillment', ar: 'التنفيذ' },
  colChannel: { en: 'Channel', ar: 'القناة' },
  colTotal: { en: 'Total', ar: 'الإجمالي' },
  orderStatus: { en: 'Order status', ar: 'حالة الطلب' },
  markFulfilled: { en: 'Mark as fulfilled', ar: 'وضع علامة تم التنفيذ' },
  exportSelection: { en: 'Export selection', ar: 'تصدير المحدد' },
  rows: { en: 'Rows', ar: 'الصفوف' },
  view: { en: 'View', ar: 'عرض' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  tabs: {
    en: ['All statuses', 'Pending', 'Fulfilled', 'Refunded', 'Failed'],
    ar: ['كل الحالات', 'قيد الانتظار', 'تم التنفيذ', 'مسترد', 'فشل'],
  },
  perPage: {
    en: ['8 per page', '25 per page', '50 per page'],
    ar: ['٨ لكل صفحة', '٢٥ لكل صفحة', '٥٠ لكل صفحة'],
  },
}

const PER_PAGE_VALUES = ['8', '25', '50']

export default function SalesConsole() {
  const { PageHeader, DataTable, Input, Badge, Avatar, AvatarFallback, Select, SelectMenuItem } =
    useDS()

  const c = useCopy(COPY)
  const [selected, setSelected] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const columns = useMemo(
    () => [
      { id: 'selection', kind: 'selection' as const, width: 48 },
      {
        id: 'reference',
        header: c.colOrder,
        sortable: true,
        width: 110,
        sortValue: (row: Order) => row.reference,
        item: (row: Order) => ({ type: 'text', value: row.reference, weight: 'medium' }),
      },
      {
        id: 'customer',
        header: c.colCustomer,
        sortable: true,
        width: 'fill' as const,
        minWidth: 220,
        sortValue: (row: Order) => row.customer,
        searchValue: (row: Order) => `${row.customer} ${row.email}`,
        item: (row: Order) => ({ type: 'avatarText', name: row.customer, caption: row.email }),
      },
      {
        id: 'status',
        header: c.colStatus,
        sortable: true,
        width: 170,
        sortValue: (row: Order) => row.status,
        item: (row: Order) => ({
          type: 'badges',
          items: [{ label: t(STATUS_LABEL[row.status]), tone: STATUS_TONE[row.status], dot: true }],
        }),
      },
      {
        id: 'fulfillment',
        header: c.colFulfillment,
        width: 150,
        sortable: true,
        sortValue: (row: Order) => row.fulfillment,
        item: (row: Order) => ({
          type: 'progress',
          value: row.fulfillment,
          label: `${row.fulfillment}%`,
          tone: row.fulfillment === 100 ? 'success' : 'brand',
        }),
      },
      {
        id: 'channels',
        header: c.colChannel,
        width: 180,
        item: (row: Order) => ({
          type: 'tags',
          items: row.channels.map((channel) => t(CHANNEL_LABEL[channel] ?? { en: channel, ar: channel })),
          maxVisible: 2,
        }),
      },
      {
        id: 'total',
        header: c.colTotal,
        align: 'end' as const,
        sortable: true,
        width: 130,
        sortValue: (row: Order) => Number(row.total.replace(/[^0-9.]/g, '')),
        item: (row: Order) => ({ type: 'text', value: row.total, weight: 'medium' }),
      },
      {
        id: 'actions',
        kind: 'actions' as const,
        width: 64,
        item: (row: Order) => ({
          type: 'actionGroup',
          actions: [
            { icon: 'view', label: `${c.view} ${row.reference}` },
            { icon: 'edit', label: `${c.edit} ${row.reference}` },
            { icon: 'delete', label: `${c.delete} ${row.reference}`, disabled: row.state === 'disabled' },
          ],
        }),
      },
    ],
    [c],
  )

  const filters = useMemo(
    () =>
      (['paid', 'pending', 'refunded', 'failed'] as const).map((status) => ({
        id: status,
        label: t(STATUS_LABEL[status]),
        active: activeFilter === status,
        predicate: (row: Order) => row.status === status,
        onAction: () => setActiveFilter((current) => (current === status ? null : status)),
      })),
    [activeFilter],
  )

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <TopBar Input={Input} Avatar={Avatar} AvatarFallback={AvatarFallback} c={c} />

      <div className="px-8 pt-6 pb-10">
        <PageHeader
          title={c.orders}
          description={c.description}
          metaInfo={c.updated}
          breadcrumbs={[
            { label: c.finance, href: '#' },
            { label: c.sales, href: '#' },
            { label: c.orders, current: true },
          ]}
          tabs={{
            items: c.tabs,
            activeIndex: activeTab,
            onActiveIndexChange: setActiveTab,
            ariaLabel: c.orderStatus,
          }}
          actions={[{ label: c.export }, { label: c.createOrder }]}
        />

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={c.summary}>
          {METRICS.map((metric) => (
            <article
              key={metric.label.en}
              className="rounded-[var(--bh-radius-lg-8)] border border-[var(--bh-border-default)] p-4"
            >
              <p className="text-xs text-[var(--bh-content-subtle)]">{t(metric.label)}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{metric.value}</p>
              <div className="mt-2">
                <Badge badgeStyle="light" color={metric.tone === 'success' ? 'green' : metric.tone === 'danger' ? 'danger' : 'amber'} size="sm" type="dot">
                  {metric.delta}
                </Badge>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6">
          <DataTable
            rows={ORDERS}
            columns={columns}
            filters={filters}
            selectedRowIds={selected}
            onSelectedRowIdsChange={setSelected}
            defaultSort={{ columnId: 'reference', direction: 'desc' }}
            search={{ placeholder: c.search }}
            actions={[{ label: c.import }, { label: c.createOrder, variant: 'primary' }]}
            bulkActions={[{ label: c.markFulfilled }, { label: c.exportSelection }]}
            pagination={{ pageSize: 8, totalRows: ORDERS.length, showCaption: true }}
            getRowSearchText={(row: Order) => `${row.reference} ${row.customer} ${row.email}`}
          />
        </div>

        <div className="mt-4 max-w-[220px]">
          <Select label={c.rows} hasLabel defaultSelectValue="8" placeholder={c.perPage[0]}>
            {PER_PAGE_VALUES.map((value, index) => (
              <SelectMenuItem key={value} label={c.perPage[index]} value={value} />
            ))}
          </Select>
        </div>
      </div>
    </main>
  )
}

/** HubSpot's global search bar — the one place a Kbd shortcut appears in a real app. */
function TopBar({
  Input,
  Avatar,
  AvatarFallback,
  c,
}: {
  Input: React.ComponentType<Record<string, unknown>>
  Avatar: React.ComponentType<Record<string, unknown>>
  AvatarFallback: React.ComponentType<Record<string, unknown>>
  c: { brand: string; globalSearch: string; globalSearchLabel: string }
}) {
  return (
    <header className="flex items-center gap-4 border-b border-[var(--bh-border-default)] px-8 py-3">
      <span className="text-sm font-semibold">{c.brand}</span>
      <div className="mx-auto w-full max-w-md">
        <Input
          placeholder={c.globalSearch}
          leadingIcon={<Search aria-hidden="true" />}
          hasLeadingIcon
          kind="shortcut"
          shortcutKeys={['Mod', 'K']}
          aria-label={c.globalSearchLabel}
        />
      </div>
      <Avatar size="sm">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    </header>
  )
}
