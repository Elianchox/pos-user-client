import React, { useCallback, useMemo, useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { StatusBadge } from './StatusBadge'
import { OrderItemRow } from './OrderItemRow'
import type { OrderItem } from '@/types/api'

interface OrderItemGroupProps {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
}

function getMajorityStatus(items: OrderItem[]): string {
  const counts: Record<string, number> = {}
  items.forEach((i) => {
    counts[i.status] = (counts[i.status] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? items[0]?.status ?? ''
}

export const OrderItemGroup = React.memo(function OrderItemGroup({
  productName,
  imageUrl,
  price,
  count,
  items,
}: OrderItemGroupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const majorityStatus = useMemo(() => getMajorityStatus(items), [items])
  const totalPrice = useMemo(() => {
    const unit = parseFloat(price) || 0
    return (unit * count).toFixed(2)
  }, [price, count])

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <View className="bg-card rounded-xl border border-border overflow-hidden mb-3">
      <Pressable onPress={toggle} className="flex-row items-center p-3 gap-3 active:opacity-80">
        <View className="w-14 h-14 rounded-lg bg-muted overflow-hidden">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-muted-foreground text-xl">🍽️</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-card-foreground" numberOfLines={1}>
            {productName}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            x{count} · ${totalPrice}
          </Text>
        </View>

        <View className="items-end gap-1">
          <StatusBadge status={majorityStatus} />
          <Text className="text-xs text-muted-foreground">{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {isOpen && (
        <View className="border-t border-border">
          {items.map((item, idx) => (
            <OrderItemRow key={item.itemId} item={item} index={idx} />
          ))}
        </View>
      )}
    </View>
  )
})
