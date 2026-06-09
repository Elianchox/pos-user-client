import type { OrderItem } from '@/types/api'

export interface GroupedItem {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
}

export function groupItems(items: OrderItem[]): GroupedItem[] {
  const map = new Map<string, OrderItem[]>()
  for (const item of items) {
    const existing = map.get(item.productId) || []
    existing.push(item)
    map.set(item.productId, existing)
  }

  return Array.from(map.entries()).map(([productId, items]) => ({
    productId,
    productName: items[0].productName,
    imageUrl: items[0].imageUrl,
    price: items[0].price,
    count: items.length,
    items,
  }))
}
