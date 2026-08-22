import { useMemo, useState } from 'react'
import { useDS } from '@/ds'
import {
  ORDERS,
  STATUS_TONE,
  formatAmount,
  formatDate,
  type Order,
  type OrderStatus,
} from '../data/orders'

/**
 * The Phase 3 stress test. This is not a screen chosen for beauty — it is the
 * densest composition the design system has to survive: a filter bar over a
 * multi-column table with selection, status colour, alignment, truncation, and
 * a trailing action menu. No sidebar.
 */
export default function OrdersDashboard() {
  const { PageHeader, DataTable, SegmentedControl, SegmentedControlItem } = useDS()

  const dir = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
  const locale = dir === 'rtl' ? 'ar-EG' : 'en-US'

  const [status, setStatus] = useState<OrderStatus | 'all'>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [density, setDensity] = useState<'sm' | 'lg'>('sm')

  const rows = useMemo(
    () => (status === 'all' ? ORDERS : ORDERS.filter((order) => order.status === status)),
    [status],
  )

  const columns = useMemo(
    () => [
      { id: 'selection', kind: 'selection' as const, width: 44 },
      {
        id: 'reference',
        header: 'Order',
        sortable: true,
        width: 130,
        sortValue: (row: Order) => row.reference,
        item: (row: Order) => ({ type: 'text' as const, value: row.reference, weight: 'medium' as const }),
      },
      {
        id: 'customer',
        header: 'Customer',
        sortable: true,
        width: 'fill' as const,
        minWidth: 220,
        sortValue: (row: Order) => row.customer.name,
        searchValue: (row: Order) => `${row.customer.name} ${row.customer.email}`,
        item: (row: Order) => ({
          type: 'avatarText' as const,
          name: row.customer.name,
          caption: row.customer.email,
        }),
      },
      {
        id: 'status',
        header: 'Status',
        width: 130,
        item: (row: Order) => ({
          type: 'badges' as const,
          items: [{ label: row.status, tone: STATUS_TONE[row.status], dot: true }],
        }),
      },
      {
        id: 'channel',
        header: 'Channel',
        width: 130,
        item: (row: Order) => ({ type: 'tags' as const, items: [row.channel] }),
      },
      {
        id: 'items',
        header: 'Items',
        align: 'end' as const,
        width: 80,
        sortable: true,
        sortValue: (row: Order) => row.items,
        item: (row: Order) => ({ type: 'text' as const, value: String(row.items), tone: 'subtle' as const }),
      },
      {
        id: 'amount',
        header: 'Amount',
        align: 'end' as const,
        width: 130,
        sortable: true,
        sortValue: (row: Order) => row.amount,
        item: (row: Order) => ({
          type: 'text' as const,
          value: formatAmount(row, locale),
          weight: 'medium' as const,
        }),
      },
      {
        id: 'placedAt',
        header: 'Placed',
        width: 130,
        sortable: true,
        sortValue: (row: Order) => row.placedAt,
        item: (row: Order) => ({
          type: 'text' as const,
          value: formatDate(row.placedAt, locale),
          tone: 'subtle' as const,
        }),
      },
      {
        id: 'actions',
        kind: 'actions' as const,
        width: 64,
        item: (row: Order) => ({
          type: 'actionGroup' as const,
          actions: [
            { icon: 'view' as const, label: `View ${row.reference}` },
            { icon: 'more' as const, label: `More actions for ${row.reference}` },
          ],
        }),
      },
    ],
    [locale],
  )

  const filters = (['all', ...Object.keys(STATUS_TONE)] as Array<OrderStatus | 'all'>).map(
    (value) => ({
      id: value,
      label: value === 'all' ? 'All orders' : value,
      active: status === value,
      onAction: () => setStatus(value),
    }),
  )

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <PageHeader
        title="Orders"
        description="Every order placed across all channels."
        metaInfo={`${ORDERS.length} total`}
        breadcrumbs={[{ label: 'Commerce', href: '#' }, { label: 'Orders' }]}
        dir={dir}
        actions={[
          { label: 'Export', variant: 'secondary' },
          { label: 'New order', variant: 'default' },
        ]}
      />

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <SegmentedControl
            value={density}
            onValueChange={(value: string) => setDensity(value as 'sm' | 'lg')}
          >
            <SegmentedControlItem value="sm">Compact</SegmentedControlItem>
            <SegmentedControlItem value="lg">Comfortable</SegmentedControlItem>
          </SegmentedControl>

          <span className="text-sm opacity-60">
            {selected.length > 0 ? `${selected.length} selected` : `${rows.length} shown`}
          </span>
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          dir={dir}
          size={density}
          filters={filters}
          search={{ placeholder: 'Search customer or email' }}
          selectedRowIds={selected}
          onSelectedRowIdsChange={setSelected}
          defaultSort={{ columnId: 'placedAt', direction: 'desc' }}
          pagination={{ pageSize: 8 }}
          bulkActions={[
            { label: 'Mark as shipped', variant: 'secondary' },
            { label: 'Refund', variant: 'secondary' },
          ]}
          emptyState={{
            title: 'No orders match these filters',
            description: 'Clear a filter or widen the date range.',
          }}
        />
      </div>
    </main>
  )
}
