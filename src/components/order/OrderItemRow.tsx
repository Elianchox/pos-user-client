import React from 'react'
import { Text, View } from 'react-native'
import { StatusBadge } from './StatusBadge'
import { makeStyles } from '@/theme/makeStyles'

interface OrderItemRowProps {
  status: string
  count: number
  totalPrice: string
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
  count: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
  price: {
    fontSize: 14,
    color: t.foreground,
  },
}))

export const OrderItemRow = React.memo(function OrderItemRow({ status, count, totalPrice, index }: OrderItemRowProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.index}>#{index + 1}</Text>
        <StatusBadge status={status} />
        {count > 1 && <Text style={styles.count}>x{count}</Text>}
      </View>
      <Text style={styles.price}>${totalPrice}</Text>
    </View>
  )
})
