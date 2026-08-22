import { useDS } from '@/ds'

/**
 * The minimal case that reproduces F-102 and F-103 at once: a Latin title and
 * description, and five tabs whose longest label does not fit an equal share.
 *
 * Deliberately small. A snippet inside an audit is evidence, not a demo — every
 * element that is not part of the claim is something a reader has to rule out.
 */
export default function PageHeaderCase() {
  const { PageHeader } = useDS()

  return (
    <div className="bg-[var(--background)] p-4 text-[var(--foreground)]">
      <PageHeader
        title="Orders"
        description="Refunds appear once the payment processor settles them."
        icon={false}
        breadcrumbs={false}
        actions={false}
        tabs={{
          items: ['All statuses', 'Pending', 'Fulfilled', 'Refunded', 'Failed'],
          defaultActiveIndex: 0,
          ariaLabel: 'Order status',
        }}
      />
    </div>
  )
}
