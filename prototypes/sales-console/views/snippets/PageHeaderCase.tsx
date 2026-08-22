import { useDS } from '@/ds'
import { useCopy } from '@/copy'

/**
 * The minimal case that reproduces F-102 and F-103 at once: a Latin title and
 * description, and five tabs whose longest label does not fit an equal share.
 *
 * Deliberately small. A snippet inside an audit is evidence, not a demo — every
 * element that is not part of the claim is something a reader has to rule out.
 */
const COPY = {
  title: { en: 'Orders', ar: 'الطلبات' },
  description: {
    en: 'Refunds appear once the payment processor settles them.',
    ar: 'تظهر المبالغ المستردة بمجرد أن يسويها مزود الدفع.',
  },
  ariaLabel: { en: 'Order status', ar: 'حالة الطلب' },
  tabs: {
    en: ['All statuses', 'Pending', 'Fulfilled', 'Refunded', 'Failed'],
    ar: ['كل الحالات', 'قيد الانتظار', 'تم التنفيذ', 'مسترد', 'فشل'],
  },
}

export default function PageHeaderCase() {
  const { PageHeader } = useDS()
  const c = useCopy(COPY)

  return (
    <div className="bg-[var(--background)] p-4 text-[var(--foreground)]">
      <PageHeader
        title={c.title}
        description={c.description}
        icon={false}
        breadcrumbs={false}
        actions={false}
        tabs={{ items: c.tabs, defaultActiveIndex: 0, ariaLabel: c.ariaLabel }}
      />
    </div>
  )
}
