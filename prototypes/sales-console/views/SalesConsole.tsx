import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useDS } from '@/ds'
import { METRICS, ORDERS, STATUS_TONE, type Order } from './orders'

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
 */

const TABS = ['All statuses', 'Pending', 'Fulfilled', 'Refunded', 'Failed']

const PER_PAGE = [
  { label: '8 per page', value: '8' },
  { label: '25 per page', value: '25' },
  { label: '50 per page', value: '50' },
]

export default function SalesConsole() {
  const { PageHeader, DataTable, Input, Badge, Avatar, AvatarFallback, Select, SelectMenuItem } =
    useDS()

  const [selected, setSelected] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const columns = useMemo(
    () => [
      { id: 'selection', kind: 'selection' as const, width: 48 },
      {
        id: 'reference',
        header: 'Order',
        sortable: true,
        width: 110,
        sortValue: (row: Order) => row.reference,
        item: (row: Order) => ({ type: 'text', value: row.reference, weight: 'medium' }),
      },
      {
        id: 'customer',
        header: 'Customer',
        sortable: true,
        width: 'fill' as const,
        minWidth: 220,
        sortValue: (row: Order) => row.customer,
        searchValue: (row: Order) => `${row.customer} ${row.email}`,
        item: (row: Order) => ({ type: 'avatarText', name: row.customer, caption: row.email }),
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        width: 170,
        sortValue: (row: Order) => row.status,
        item: (row: Order) => ({
          type: 'badges',
          items: [{ label: row.status, tone: STATUS_TONE[row.status], dot: true }],
        }),
      },
      {
        id: 'fulfillment',
        header: 'Fulfillment',
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
        header: 'Channel',
        width: 180,
        item: (row: Order) => ({ type: 'tags', items: row.channels, maxVisible: 2 }),
      },
      {
        id: 'total',
        header: 'Total',
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
            { icon: 'view', label: `View ${row.reference}` },
            { icon: 'edit', label: `Edit ${row.reference}` },
            { icon: 'delete', label: `Delete ${row.reference}`, disabled: row.state === 'disabled' },
          ],
        }),
      },
    ],
    [],
  )

  const filters = useMemo(
    () =>
      (['paid', 'pending', 'refunded', 'failed'] as const).map((status) => ({
        id: status,
        label: status[0].toUpperCase() + status.slice(1),
        active: activeFilter === status,
        predicate: (row: Order) => row.status === status,
        onAction: () => setActiveFilter((current) => (current === status ? null : status)),
      })),
    [activeFilter],
  )

  return (
    <main className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <TopBar Input={Input} Avatar={Avatar} AvatarFallback={AvatarFallback} />

      <div className="px-8 pt-6 pb-10">
        <PageHeader
          title="Orders"
          description="Every completed transaction across Retail, Online and Wholesale. Refunds appear once the payment processor settles them."
          metaInfo="Updated 4 minutes ago"
          breadcrumbs={[
            { label: 'Finance', href: '#' },
            { label: 'Sales', href: '#' },
            { label: 'Orders', current: true },
          ]}
          tabs={{
            items: TABS,
            activeIndex: activeTab,
            onActiveIndexChange: setActiveTab,
            ariaLabel: 'Order status',
          }}
          actions={[
            { label: 'Export' },
            { label: 'Create order' },
          ]}
        />

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Summary">
          {METRICS.map((metric) => (
            <article
              key={metric.label}
              className="rounded-[var(--bh-radius-lg-8)] border border-[var(--bh-border-default)] p-4"
            >
              <p className="text-xs text-[var(--bh-content-subtle)]">{metric.label}</p>
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
            search={{ placeholder: 'Search by customer, email or order number' }}
            actions={[{ label: 'Import' }, { label: 'Create order', variant: 'primary' }]}
            bulkActions={[{ label: 'Mark as fulfilled' }, { label: 'Export selection' }]}
            pagination={{ pageSize: 8, totalRows: ORDERS.length, showCaption: true }}
            getRowSearchText={(row: Order) => `${row.reference} ${row.customer} ${row.email}`}
          />
        </div>

        <div className="mt-4 max-w-[220px]">
          <Select label="Rows" hasLabel defaultSelectValue="8" placeholder="8 per page">
            {PER_PAGE.map((option) => (
              <SelectMenuItem key={option.value} label={option.label} value={option.value} />
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
}: Record<string, React.ComponentType<Record<string, unknown>>>) {
  return (
    <header className="flex items-center gap-4 border-b border-[var(--bh-border-default)] px-8 py-3">
      <span className="text-sm font-semibold">Northwind</span>
      <div className="mx-auto w-full max-w-md">
        <Input
          placeholder="Search across Northwind"
          leadingIcon={<Search aria-hidden="true" />}
          hasLeadingIcon
          kind="shortcut"
          shortcutKeys={['Mod', 'K']}
          aria-label="Global search"
        />
      </div>
      <Avatar size="sm">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
    </header>
  )
}
