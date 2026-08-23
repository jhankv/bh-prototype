/**
 * Xero's own eight rows, kept as they appear in the reference.
 *
 * Seeded rather than generated. Frames on one canvas exist to be compared, and
 * random data turns every difference into noise.
 *
 * One name is longer than the column can hold. That is deliberate: `table-2` is
 * about truncation choosing the wrong end of a string, and a fixture where every
 * name fits cannot show whether the fix holds.
 */

export type BillStatus = 'awaiting-payment' | 'draft' | 'awaiting-approval' | 'paid'

export type Bill = {
  id: string
  from: string
  status: BillStatus
  reference: string
  date: string
  due: string
  amount: string
}

export const BILLS: Bill[] = [
  {
    id: '1',
    from: 'Caddric Aitcheson',
    status: 'awaiting-payment',
    reference: 'NH4392',
    date: 'May 24, 2026',
    due: 'May 24, 2026',
    amount: '412.00',
  },
  {
    id: '2',
    from: 'Wynn Syder',
    status: 'awaiting-payment',
    reference: 'QR3784',
    date: 'May 23, 2026',
    due: 'May 23, 2026',
    amount: '1,204.50',
  },
  {
    id: '3',
    from: 'Andrej Gully',
    status: 'awaiting-payment',
    reference: 'AF4149',
    date: 'May 23, 2026',
    due: 'May 22, 2026',
    amount: '89.99',
  },
  {
    id: '4',
    from: 'Regan Scurry',
    status: 'draft',
    reference: 'CX1163',
    date: 'May 22, 2026',
    due: 'May 22, 2026',
    amount: '350.00',
  },
  {
    id: '5',
    from: 'Maximiliano Alessandro Fernández de la Vega y Santibáñez',
    status: 'awaiting-payment',
    reference: 'AA1719',
    date: 'May 22, 2026',
    due: 'May 22, 2026',
    amount: '76.40',
  },
  {
    id: '6',
    from: 'Giovanni Blanque',
    status: 'awaiting-approval',
    reference: 'AZ2669',
    date: 'May 21, 2026',
    due: 'May 27, 2026',
    amount: '928.10',
  },
  {
    id: '7',
    from: 'Natty Mound',
    status: 'awaiting-payment',
    reference: 'SK8168',
    date: 'May 20, 2026',
    due: 'May 23, 2026',
    amount: '245.75',
  },
  {
    id: '8',
    from: 'ASMobbin',
    status: 'draft',
    reference: '[month]',
    date: 'May 19, 2026',
    due: 'May 31, 2026',
    amount: '344.26',
  },
]
