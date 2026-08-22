import { Faker, ar, en } from '@faker-js/faker'

/**
 * Mock data, shaped like production data.
 *
 * Seeded on purpose. The whole point of this canvas is comparing the same view
 * across appearances and sandboxes — if every frame generated different rows,
 * nothing on screen would be comparable and every difference would be noise.
 *
 * Bilingual on purpose too. Banhaten is Arabic-first, and Arabic has different
 * line height, different character widths, and no capitals. A table that
 * survives "Jonathan Whitaker" can still break on "محمد عبد الرحمن".
 */
const latin = new Faker({ locale: [en] })
const arabic = new Faker({ locale: [ar, en] })

latin.seed(20260821)
arabic.seed(20260821)

export type OrderStatus = 'paid' | 'pending' | 'shipped' | 'refunded' | 'failed'

export type Order = {
  id: string
  reference: string
  customer: { name: string; email: string }
  status: OrderStatus
  items: number
  amount: number
  currency: string
  placedAt: Date
  channel: string
}

const STATUSES: OrderStatus[] = ['paid', 'pending', 'shipped', 'refunded', 'failed']
const CHANNELS = ['Web', 'Mobile', 'Marketplace', 'In store']

function makeOrder(index: number): Order {
  // Alternating scripts, so both are visible without scrolling.
  const source = index % 2 === 0 ? latin : arabic

  return {
    id: `order-${index}`,
    reference: `ORD-${String(48219 + index * 7)}`,
    customer: {
      name: source.person.fullName(),
      email: latin.internet.email().toLowerCase(),
    },
    status: STATUSES[index % STATUSES.length],
    items: latin.number.int({ min: 1, max: 24 }),
    amount: latin.number.float({ min: 12, max: 4800, fractionDigits: 2 }),
    currency: 'USD',
    placedAt: new Date(2026, 7, 21 - (index % 30), 9 + (index % 12), (index * 7) % 60),
    channel: CHANNELS[index % CHANNELS.length],
  }
}

/**
 * Deliberate edge cases. Generated data is average by construction, and a table
 * only breaks at its extremes.
 */
const EDGE_CASES: Order[] = [
  {
    id: 'order-long-name',
    reference: 'ORD-49001',
    customer: {
      name: 'Maximiliano Alessandro Fernández de la Vega y Santibáñez',
      email: 'maximiliano.alessandro.fernandez.delavega@enterprise-procurement.example.com',
      },
    status: 'pending',
    items: 18,
    amount: 12480.5,
    currency: 'USD',
    placedAt: new Date(2026, 7, 21, 14, 3),
    channel: 'Marketplace',
  },
  {
    id: 'order-long-arabic',
    reference: 'ORD-49002',
    customer: {
      name: 'عبد الرحمن بن محمد بن عبد الله آل سعود الشمري',
      email: 'a.alshammari@example.com',
    },
    status: 'shipped',
    items: 3,
    amount: 640,
    currency: 'USD',
    placedAt: new Date(2026, 7, 20, 11, 45),
    channel: 'Web',
  },
  {
    id: 'order-minimal',
    reference: 'ORD-49003',
    customer: { name: 'Li Wei', email: 'l.wei@example.com' },
    status: 'failed',
    items: 1,
    amount: 9.99,
    currency: 'USD',
    placedAt: new Date(2026, 7, 19, 8, 12),
    channel: 'Mobile',
  },
]

export const ORDERS: Order[] = [
  ...EDGE_CASES,
  ...Array.from({ length: 21 }, (_, index) => makeOrder(index)),
]

export function formatAmount(order: Order, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: order.currency,
  }).format(order.amount)
}

export function formatDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const STATUS_TONE: Record<OrderStatus, 'success' | 'warning' | 'blue' | 'neutral' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  shipped: 'blue',
  refunded: 'neutral',
  failed: 'danger',
}
