import React from 'react'
import { Text, View } from 'react-native'
import { StatusBadge } from './StatusBadge'
import { makeStyles } from '@/theme/makeStyles'
import type { OrderItem } from '@/types/api'

interface OrderItemRowProps {
  item: OrderItem
  index: number
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: t.spacing[2],
    paddingHorizontal: t.spacing[3],
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  index: {
    fontSize: 14,
    color: t.mutedForeground,
  },
  price: {
    fontSize: 14,
    color: t.foreground,
  },
}))

export const OrderItemRow = React.memo(function OrderItemRow({ item, index }: OrderItemRowProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.index}>#{index + 1}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.price}>${item.price}</Text>
    </View>
  )
})
