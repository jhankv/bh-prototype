/**
 * Fixture data for the orders console.
 *
 * Realistic, not decorative. Every row here exists to push a component past a
 * comfortable case: names long enough to truncate, mixed-script customers,
 * amounts that the bidi algorithm reorders under `dir="rtl"`, a disabled row,
 * and one status that carries no badge tone of its own.
 */

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed' | 'partially refunded'

export type Order = {
  id: string
  reference: string
  customer: string
  email: string
  status: OrderStatus
  fulfillment: number
  channels: string[]
  total: string
  state?: 'default' | 'selected' | 'disabled'
}

export const ORDERS: Order[] = [
  {
    id: 'o-49118',
    reference: '#49118',
    customer: 'Institut für Angewandte Betriebswirtschaftslehre GmbH',
    email: 'beschaffung.zentraleinkauf@angewandte-betriebswirtschaft.example.de',
    status: 'pending',
    fulfillment: 20,
    channels: ['Wholesale', 'Net 60', 'Priority'],
    total: '$18,940.00',
  },
  {
    id: 'o-49117',
    reference: '#49117',
    customer: 'مؤسسة الخليج للتجارة',
    email: 'orders@gulf-trading.example.ae',
    status: 'paid',
    fulfillment: 100,
    channels: ['Online'],
    total: '$12,480.50',
  },
  {
    id: 'o-49116',
    reference: '#49116',
    customer: 'Nakamura Logistics 中村物流株式会社',
    email: 'ap@nakamura-logistics.example.jp',
    status: 'partially refunded',
    fulfillment: 65,
    channels: ['Marketplace', 'Returns'],
    total: '$7,205.00',
  },
  {
    id: 'o-49115',
    reference: '#49115',
    customer: 'Ana Sofía Marroquín Villalobos',
    email: 'ana.marroquin@example.gt',
    status: 'paid',
    fulfillment: 100,
    channels: ['Retail'],
    total: '$940.25',
  },
  {
    id: 'o-49114',
    reference: '#49114',
    customer: 'Ferreteria y Suministros del Pacifico S.A. de C.V.',
    email: 'cobranza@suministrospacifico.example.mx',
    status: 'failed',
    fulfillment: 0,
    channels: ['Wholesale'],
    total: '$3,110.00',
  },
  {
    id: 'o-49113',
    reference: '#49113',
    customer: 'Björn Þórarinsson',
    email: 'bjorn@example.is',
    status: 'refunded',
    fulfillment: 0,
    channels: ['Online', 'Returns'],
    total: '$212.00',
  },
  {
    id: 'o-49112',
    reference: '#49112',
    customer: 'Okonkwo & Adeyemi Trading Company Limited',
    email: 'finance@okonkwo-adeyemi.example.ng',
    status: 'paid',
    fulfillment: 100,
    channels: ['Wholesale', 'Net 30'],
    total: '$26,700.00',
  },
  {
    id: 'o-49111',
    reference: '#49111',
    customer: 'Léa Dubois-Marchand',
    email: 'lea.dubois@example.fr',
    status: 'pending',
    fulfillment: 45,
    channels: ['Online'],
    total: '$1,388.90',
  },
  {
    id: 'o-49110',
    reference: '#49110',
    customer: 'Archived Customer',
    email: 'no-reply@example.com',
    status: 'refunded',
    fulfillment: 0,
    channels: ['Online'],
    total: '$0.00',
    state: 'disabled',
  },
  {
    id: 'o-49109',
    reference: '#49109',
    customer: 'Chen Wei',
    email: 'chen.wei@example.cn',
    status: 'paid',
    fulfillment: 100,
    channels: ['Marketplace'],
    total: '$5,640.00',
  },
  {
    id: 'o-49108',
    reference: '#49108',
    customer: 'Priya Ramachandran Venkataraman',
    email: 'priya.r.venkataraman@example.in',
    status: 'partially refunded',
    fulfillment: 80,
    channels: ['Retail', 'Returns'],
    total: '$2,015.75',
  },
  {
    id: 'o-49107',
    reference: '#49107',
    customer: 'Tomás O',
    email: 't.o@example.ie',
    status: 'pending',
    fulfillment: 10,
    channels: ['Online'],
    total: '$88.00',
  },
]

/**
 * Banhaten badge tones. `partially refunded` has no tone of its own, which is
 * exactly the kind of gap a composition surfaces and a gallery does not.
 */
export const STATUS_TONE: Record<OrderStatus, string> = {
  paid: 'success',
  pending: 'warning',
  refunded: 'neutral',
  failed: 'danger',
  'partially refunded': 'neutral',
}

export const METRICS = [
  { label: 'Gross sales', value: '$79,620.40', delta: '+12.4%', tone: 'success' },
  { label: 'Orders', value: '1,284', delta: '+3.1%', tone: 'success' },
  { label: 'Refund rate', value: '4.8%', delta: '+1.2%', tone: 'danger' },
  { label: 'Avg. order value', value: '$62.01', delta: '-0.4%', tone: 'warning' },
]
