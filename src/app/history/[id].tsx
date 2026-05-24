import { OrderFilterBar } from '@/components/order/OrderFilterBar'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { OrderTotal } from '@/components/order/OrderTotal'
import { StatusBadge } from '@/components/order/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useDeviceOrderDetail } from '@/hooks/api/useDeviceOrderDetail'
import { makeStyles } from '@/theme/makeStyles'
import type { DeviceOrderDetailItem, OrderItem, OrderItemStatusType } from '@/types/api'
import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'

interface GroupedItem {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
}

function groupItems(items: OrderItem[]): GroupedItem[] {
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

function toOrderItem(detail: DeviceOrderDetailItem, idx: number): OrderItem {
  return {
    itemId: detail.itemId,
    productId: detail.itemId,
    productName: detail.productName,
    price: detail.unitPrice,
    imageUrl: null,
    status: detail.status,
  }
}

const useStyles = makeStyles((t) => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    gap: t.spacing[3],
  },
  backButton: {
    padding: t.spacing[2],
    borderRadius: t.radii.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: t.foreground,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
  },
  metaCard: {
    backgroundColor: t.card,
    borderRadius: t.radii.xl,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing[4],
    marginBottom: t.spacing[4],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing[2],
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: t.foreground,
  },
  metaDetail: {
    fontSize: 14,
    color: t.mutedForeground,
    marginBottom: t.spacing[1],
  },
  metaDate: {
    fontSize: 12,
    color: t.mutedForeground,
  },
  notesSection: {
    backgroundColor: t.muted,
    borderRadius: t.radii.md,
    padding: t.spacing[3],
    marginBottom: t.spacing[4],
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: t.mutedForeground,
    marginBottom: t.spacing[1],
  },
  notesText: {
    fontSize: 14,
    color: t.foreground,
  },
}))

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data, isLoading, error, refetch } = useDeviceOrderDetail(id)
  const detail = data?.data

  const styles = useStyles()
  const [activeStatuses, setActiveStatuses] = useState<OrderItemStatusType[] | null>(null)

  const allItems = useMemo(() => {
    return (detail?.items ?? []).map(toOrderItem)
  }, [detail])

  const allGroups = useMemo(() => {
    return groupItems(allItems)
  }, [allItems])

  const filteredGroups = useMemo(() => {
    if (activeStatuses === null) return allGroups
    return allGroups.filter((group) =>
      group.items.some((item) => activeStatuses.includes(item.status as OrderItemStatusType)),
    )
  }, [allGroups, activeStatuses])

  const handleToggleStatus = useCallback((status: OrderItemStatusType) => {
    setActiveStatuses((prev) => {
      if (prev === null) return [status]
      if (prev.includes(status)) {
        const next = prev.filter((s) => s !== status)
        return next.length === 0 ? null : next
      }
      return [...prev, status]
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveStatuses(null)
  }, [])

  const date = detail ? new Date(detail.createdAt) : null
  const formattedDate = date
    ? date.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState fullScreen message="Cargando detalle de la orden..." />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message="No pudimos cargar el detalle de la orden" onRetry={() => refetch()} />
      </SafeAreaView>
    )
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState message="No se encontró la orden" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={styles.title.color} />
          </Pressable>
          <Text style={styles.title}>Orden</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <Text style={styles.businessName}>{detail.businessName}</Text>
              <StatusBadge status={detail.status} />
            </View>
            <Text style={styles.metaDetail}>{detail.tableName}</Text>
            <Text style={styles.metaDate}>{formattedDate}</Text>
          </View>

          {detail.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notas</Text>
              <Text style={styles.notesText}>{detail.notes}</Text>
            </View>
          )}

          <OrderFilterBar
            activeStatuses={activeStatuses}
            onToggle={handleToggleStatus}
            onClearAll={handleClearFilters}
          />

          {filteredGroups.length === 0 ? (
            <EmptyState
              message={
                allGroups.length === 0
                  ? 'Esta orden no tiene items'
                  : 'No se encontraron items con los filtros actuales'
              }
            />
          ) : (
            filteredGroups.map((group) => (
              <OrderItemGroup
                key={group.productId}
                productId={group.productId}
                productName={group.productName}
                imageUrl={group.imageUrl}
                price={group.price}
                count={group.count}
                items={group.items}
                activeStatuses={activeStatuses}
              />
            ))
          )}
        </ScrollView>

        <OrderTotal total={detail.totalAmount} />
      </View>
    </SafeAreaView>
  )
}
