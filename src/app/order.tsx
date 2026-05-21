import { ItemSearchInput } from '@/components/order/ItemSearchInput'
import { OrderFilterBar } from '@/components/order/OrderFilterBar'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { OrderTotal } from '@/components/order/OrderTotal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { LogoutButton } from '@/components/ui/LogoutButton'
import { useSession } from '@/context/SessionContext'
import { useOrderDetail } from '@/hooks/api/useOrderDetail'
import { makeStyles } from '@/theme/makeStyles'
import { type OrderItem, type OrderItemStatusType } from '@/types/api'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SCROLL_BOTTOM_PADDING = 80

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
}))

export default function OrderScreen() {
  const { tableId } = useSession()
  const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()
  const styles = useStyles()

  const [activeStatuses, setActiveStatuses] = useState<OrderItemStatusType[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const allGroups = useMemo(() => {
    const items = orderData?.data?.order?.items ?? []
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

  const totalAmount = orderData?.data?.order?.totalAmount ?? '0.00'

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
            <LogoutButton />
          </View>

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

        <OrderTotal total={totalAmount} />
      </View>
    </SafeAreaView>
  )
}
