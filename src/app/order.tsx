import { OrderHeader } from '@/components/order/OrderHeader'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useSession } from '@/context/SessionContext'
import { useOrderDetail } from '@/hooks/api/useOrderDetail'
import { useOrderStream } from '@/hooks/api/useOrderStream'
import type { OrderItem } from '@/types/api'
import { useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

export default function OrderScreen() {
  const router = useRouter()
  const { tableId, removeToken } = useSession()
  const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()

  const stream = useOrderStream()

  const groups = useMemo(() => {
    const items = orderData?.data?.order?.items ?? []
    return groupItems(items)
  }, [orderData])

  const totalAmount = useMemo(() => {
    const items = orderData?.data?.order?.items ?? []
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    return total.toFixed(2)
  }, [orderData])

  useEffect(() => {
    if (stream.orderClosed || stream.sessionEnded) {
      removeToken().then(() => {
        router.replace('/thank-you')
      })
    }
  }, [stream.orderClosed, stream.sessionEnded, removeToken, router])

  useEffect(() => {
    if (stream.reconnectFailed) {
      removeToken().then(() => {
        router.replace('/')
      })
    }
  }, [stream.reconnectFailed, removeToken, router])

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
    <SafeAreaView className="flex-1 bg-background">
      <View className='h-full'>
        <OrderHeader
          tableName={orderData?.data?.table?.name ?? `Mesa ${tableId ?? ''}`}
          totalAmount={totalAmount}
          isConnected={stream.isConnected}
          reconnecting={stream.reconnecting}
        />

        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
          {groups.length === 0 ? (
            <EmptyState message="Aún no hay productos en tu orden" />
          ) : (
            groups.map((group) => (
              <OrderItemGroup
                key={group.productId}
                productId={group.productId}
                productName={group.productName}
                imageUrl={group.imageUrl}
                price={group.price}
                count={group.count}
                items={group.items}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
