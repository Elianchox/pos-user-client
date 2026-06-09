import { ItemSearchInput } from '@/components/order/ItemSearchInput'
import { OrderFilterBar } from '@/components/order/OrderFilterBar'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { OrderSummaryCard } from '@/components/order/OrderSummaryCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { useSession } from '@/context/SessionContext'
import { useOrderDetail } from '@/hooks/api/useOrderDetail'
import { ApiError } from '@/services/api/client'
import { makeStyles } from '@/theme/makeStyles'
import { type OrderItemStatusType } from '@/types/api'
import { groupItems } from '@/utils/order'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SCROLL_BOTTOM_PADDING = 80

const useStyles = makeStyles((t) => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
  },
  headerWrapper: {
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
  },
  tableName: {
    fontSize: 20,
    fontWeight: '700',
    color: t.foreground,
    marginBottom: t.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing[3],
  },
  notesContainer: {
    backgroundColor: t.muted,
    borderRadius: t.radii.md,
    padding: t.spacing[3],
    marginBottom: t.spacing[3],
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

export default function OrderScreen() {
  const { tableId, removeToken } = useSession()
  const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()

  useEffect(() => {
    if (orderError instanceof ApiError && orderError.status === 401) {
      removeToken()
      router.replace('/')
    }
    }, [orderError, removeToken])

  const styles = useStyles()

  const [activeStatuses, setActiveStatuses] = useState<OrderItemStatusType[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const allGroups = useMemo(() => {
    const order = orderData?.data?.order
    const items = (order && ['PAID', 'CANCELLED'].includes(order.status)) ? [] : (order?.items ?? [])
    return groupItems(items)
  }, [orderData])

  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesStatus =
        activeStatuses === null ||
        group.items.some((item) => activeStatuses.includes(item.status as OrderItemStatusType))

      const matchesSearch =
        searchQuery === '' ||
        group.productName.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [allGroups, activeStatuses, searchQuery])

  const handleToggleStatus = useCallback((status: OrderItemStatusType) => {
    setActiveStatuses((prev) => {
      if (prev === null) {
        return [status]
      }
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  if (orderLoading) {
    return <LoadingState fullScreen message="Cargando tu orden..." />
  }

  if (orderError) {
    return (
      <ErrorState
        message={`No pudimos cargar tu orden ${orderError.message}`}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.tableName}>
              {orderData?.data?.table?.name ?? (tableId ? `Mesa ${tableId}` : 'Mesa')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={{ color: '#3b82f6', fontSize: 14, fontWeight: '500' }}>Historial</Text>
              </TouchableOpacity>
              <LogoutButton />
            </View>
          </View>

          {orderData?.data?.order?.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notas</Text>
              <Text style={styles.notesText}>{orderData.data.order.notes}</Text>
            </View>
          )}

          <OrderFilterBar
            activeStatuses={activeStatuses}
            onToggle={handleToggleStatus}
            onClearAll={handleClearFilters}
          />

          <ItemSearchInput onChange={handleSearch} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: SCROLL_BOTTOM_PADDING }}
        >
          {filteredGroups.length === 0 ? (
            <EmptyState
              message={
                allGroups.length === 0
                  ? 'Aún no hay productos en tu orden'
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

        <OrderSummaryCard order={orderData?.data?.order ?? null} />
      </View>
    </SafeAreaView>
  )
}
