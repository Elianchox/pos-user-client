import { Pressable, Text, View } from 'react-native'
import { StatusBadge } from './StatusBadge'
import { makeStyles } from '@/theme/makeStyles'
import type { DeviceOrderItem } from '@/types/api'

interface OrderHistoryCardProps {
  order: DeviceOrderItem
  onPress: () => void
}

const useStyles = makeStyles((t) => ({
  container: {
    backgroundColor: t.card,
    borderRadius: t.radii.xl,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing[4],
    marginBottom: t.spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing[2],
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: t.cardForeground,
    flex: 1,
    marginRight: t.spacing[2],
  },
  details: {
    fontSize: 14,
    color: t.mutedForeground,
    marginBottom: t.spacing[1],
  },
  date: {
    fontSize: 12,
    color: t.mutedForeground,
  },
}))

export function OrderHistoryCard({ order, onPress }: OrderHistoryCardProps) {
  const styles = useStyles()
  const date = new Date(order.createdAt)
  const formattedDate = date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
    >
      <View style={styles.topRow}>
        <Text style={styles.businessName} numberOfLines={1}>
          {order.businessName}
        </Text>
        <StatusBadge status={order.status} />
      </View>
      <Text style={styles.details}>
        {order.tableName} · {order.itemCount} items · ${order.totalAmount}
      </Text>
      <Text style={styles.date}>{formattedDate}</Text>
    </Pressable>
  )
}
