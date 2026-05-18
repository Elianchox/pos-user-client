import React, { useCallback, useMemo, useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { StatusBadge } from './StatusBadge'
import { OrderItemRow } from './OrderItemRow'
import { makeStyles } from '@/theme/makeStyles'
import type { OrderItem } from '@/types/api'

interface OrderItemGroupProps {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
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
    alignItems: 'flex-end',
    gap: t.spacing[1],
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
  const styles = useStyles()
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
          <StatusBadge status={majorityStatus} />
          <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {isOpen && (
        <View style={styles.expanded}>
          {items.map((item, idx) => (
            <OrderItemRow key={item.itemId} item={item} index={idx} />
          ))}
        </View>
      )}
    </View>
  )
})
