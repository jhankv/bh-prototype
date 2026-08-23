/**
 * Neon's own six rows, kept verbatim from the reference screen.
 *
 * Seeded rather than generated. Frames on one canvas exist to be compared, and
 * random data makes every difference between two frames noise. These rows also
 * carry the content extremes the screen was chosen for: two descriptions long
 * enough to truncate, one product name long enough to compete with its column,
 * and prices that exercise the `numeric(10, 2)` alignment.
 */

export type Product = {
  id: string
  product_name: string
  description: string
  price: string
  stock: number
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    product_name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with silent switches',
    price: '19.99',
    stock: 82,
  },
  {
    id: '2',
    product_name: 'USB-C Charger',
    description: 'Fast charging USB-C adapter, 65W',
    price: '25.00',
    stock: 112,
  },
  {
    id: '3',
    product_name: 'Noise Cancelling Headphones',
    description: 'Over-ear ANC headphones',
    price: '149.99',
    stock: 28,
  },
  {
    id: '4',
    product_name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: '39.00',
    stock: 68,
  },
  {
    id: '5',
    product_name: 'Webcam HD',
    description: '1080p USB webcam',
    price: '58.90',
    stock: 14,
  },
  {
    id: '6',
    product_name: 'External SSD 1TB',
    description: 'High-speed portable SSD, USB 3.2 Gen 2',
    price: '140.50',
    stock: 12,
  },
]
