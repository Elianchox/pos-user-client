import React from 'react'
import { Text, View } from 'react-native'
import { StatusBadge } from './StatusBadge'
import type { OrderItem } from '@/types/api'

interface OrderItemRowProps {
  item: OrderItem
  index: number
}

export const OrderItemRow = React.memo(function OrderItemRow({ item, index }: OrderItemRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2 px-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">#{index + 1}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text className="text-sm text-foreground">${item.price}</Text>
    </View>
  )
})
