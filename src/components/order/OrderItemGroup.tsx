import React, { useCallback, useMemo, useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { Clock, Flame, ChefHat, Bell, CheckCheck, XCircle } from 'lucide-react-native'
import { OrderItemRow } from './OrderItemRow'
import { makeStyles } from '@/theme/makeStyles'
import type { OrderItem, OrderItemStatusType } from '@/types/api'
import { getStatusColor } from '@/utils/status'

interface OrderItemGroupProps {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
  activeStatuses: OrderItemStatusType[] | null
}

const useStyles = makeStyles((t) => ({
  container: {
    backgroundColor: t.card,
    borderRadius: t.radii.xl,
    borderWidth: 1,
    borderColor: t.border,
    overflow: 'hidden',
    marginBottom: t.spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: t.spacing[3],
    gap: t.spacing[3],
  },
  imageContainer: {
    width: 56,
    height: 56,
    borderRadius: t.radii.lg,
    backgroundColor: t.muted,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: t.mutedForeground,
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: t.cardForeground,
  },
  subtitle: {
    fontSize: 14,
    color: t.mutedForeground,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  chevron: {
    fontSize: 12,
    color: t.mutedForeground,
  },
  expanded: {
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
}))

function getStatusCounts(items: OrderItem[]): Record<string, number> {
  const counts: Record<string, number> = {}
  items.forEach((i) => {
    counts[i.status] = (counts[i.status] || 0) + 1
  })
  return counts
}

interface StatusGroup {
  status: string
  count: number
  totalPrice: string
}

function groupItemsByStatus(items: OrderItem[]): StatusGroup[] {
  const map = new Map<string, { count: number; totalPrice: number }>()
  for (const item of items) {
    const existing = map.get(item.status) || { count: 0, totalPrice: 0 }
    existing.count += 1
    existing.totalPrice += parseFloat(item.price) || 0
    map.set(item.status, existing)
  }
  return Array.from(map.entries()).map(([status, { count, totalPrice }]) => ({
    status,
    count,
    totalPrice: totalPrice.toFixed(2),
  }))
}

const STATUS_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  PENDING: Clock,
  SENT_TO_KITCHEN: Flame,
  PREPARING: ChefHat,
  READY: Bell,
  SERVED: CheckCheck,
  CANCELLED: XCircle,
}

function StatusCounts({ items }: { items: OrderItem[] }) {
  const styles = useStyles()
  const counts = useMemo(() => getStatusCounts(items), [items])

  const priorityOrder = ['SENT_TO_KITCHEN', 'PREPARING', 'READY', 'PENDING', 'CANCELLED', 'SERVED']

  const activeStatuses = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => {
      const aIdx = priorityOrder.indexOf(a[0])
      const bIdx = priorityOrder.indexOf(b[0])
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx)
    })

  if (activeStatuses.length === 0) return null

  const maxVisible = 2
  const visible = activeStatuses.slice(0, maxVisible)
  const remaining = activeStatuses.length - maxVisible

  return (
    <View style={styles.statusRow}>
      {visible.map(([status, count]) => {
        const Icon = STATUS_ICONS[status] ?? Clock
        const colors = getStatusColor(status)
        return (
          <View key={status} style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Icon size={14} color="#ffffff" />
            <Text style={styles.statusCount}>{count}</Text>
          </View>
        )
      })}
      {remaining > 0 && (
        <View style={[styles.statusBadge, { backgroundColor: '#71717a' }]}>
          <Text style={styles.statusCount}>+{remaining}</Text>
        </View>
      )}
    </View>
  )
}

export const OrderItemGroup = React.memo(function OrderItemGroup({
  productName,
  imageUrl,
  price,
  count,
  items,
  activeStatuses,
}: OrderItemGroupProps) {
  const styles = useStyles()
  const [isOpen, setIsOpen] = useState(false)
  const totalPrice = useMemo(() => {
    const unit = parseFloat(price) || 0
    return (unit * count).toFixed(2)
  }, [price, count])

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsOpen((prev) => !prev)
  }, [])

  return (
    <View style={styles.container}>
      <Pressable
        onPress={toggle}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.productName} numberOfLines={1}>
            {productName}
          </Text>
          <Text style={styles.subtitle}>
            x{count} · ${totalPrice}
          </Text>
        </View>

        <View style={styles.badgeContainer}>
          <StatusCounts items={items} />
          <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {isOpen && (
        <View style={styles.expanded}>
          {groupItemsByStatus(items)
            .filter(({ status }) => activeStatuses === null || activeStatuses.includes(status as OrderItemStatusType))
            .map(({ status, count, totalPrice }, idx) => (
              <OrderItemRow key={`${status}-${idx}`} status={status} count={count} totalPrice={totalPrice} index={idx} />
            ))}
        </View>
      )}
    </View>
  )
})
