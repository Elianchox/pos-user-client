import { OrderHistoryCard } from '@/components/order/OrderHistoryCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useDeviceId } from '@/hooks/api/useDeviceId'
import { useDeviceOrders } from '@/hooks/api/useDeviceOrders'
import { makeStyles } from '@/theme/makeStyles'
import { router } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import type { DeviceOrderItem } from '@/types/api'

const ORDER_STATUS_FILTERS = [
  { label: 'Todos', statuses: null as string[] | null },
  { label: 'Abiertas', statuses: ['OPEN', 'IN_PROGRESS', 'PENDING_PAYMENT'] },
  { label: 'Pagadas', statuses: ['PAID', 'CLOSED'] },
  { label: 'Canceladas', statuses: ['CANCELLED'] },
]

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
  searchContainer: {
    paddingHorizontal: t.spacing[4],
    paddingBottom: t.spacing[3],
  },
  searchInput: {
    backgroundColor: t.muted,
    borderRadius: t.radii.lg,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
    fontSize: 14,
    color: t.foreground,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: t.spacing[4],
    gap: t.spacing[2],
    paddingBottom: t.spacing[3],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: t.border,
  },
  chipActive: {
    backgroundColor: t.primary,
    borderColor: t.primary,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: t.mutedForeground,
  },
  chipLabelActive: {
    color: t.primaryForeground,
  },
  list: {
    flex: 1,
    paddingHorizontal: t.spacing[4],
  },
  listContent: {
    paddingBottom: t.spacing[8],
  },
}))

export default function HistoryScreen() {
  const styles = useStyles()
  const deviceId = useDeviceId()
  const { data, isLoading, error, refetch, isRefetching } = useDeviceOrders(deviceId)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState(0)

  const filteredOrders = useMemo(() => {
    let result = data?.data ?? []

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((o) => o.businessName.toLowerCase().includes(q))
    }

    const filter = ORDER_STATUS_FILTERS[selectedFilter]
    if (filter.statuses !== null) {
      result = result.filter((o) => filter.statuses!.includes(o.status))
    }

    return result
  }, [data, searchQuery, selectedFilter])

  if (!deviceId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message="No se pudo identificar tu dispositivo" />
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoadingState fullScreen message="Cargando historial..." />
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ErrorState message="No pudimos cargar el historial" onRetry={() => refetch()} />
      </SafeAreaView>
    )
  }

  const renderItem = ({ item }: { item: DeviceOrderItem }) => (
    <OrderHistoryCard order={item} onPress={() => router.push(`/history/${item.orderId}`)} />
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={styles.title.color} />
          </Pressable>
          <Text style={styles.title}>Historial de órdenes</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por restaurante..."
            placeholderTextColor={styles.searchInput.color}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {ORDER_STATUS_FILTERS.map((filter, index) => (
            <Pressable
              key={filter.label}
              onPress={() => setSelectedFilter(index)}
              style={[styles.chip, selectedFilter === index && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipLabel,
                  selectedFilter === index && styles.chipLabelActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={filteredOrders}
          keyExtractor={(item) => item.orderId}
          renderItem={renderItem}
          onRefresh={() => refetch()}
          refreshing={isRefetching}
          ListEmptyComponent={
            <EmptyState
              message={
                searchQuery || selectedFilter !== 0
                  ? 'No se encontraron órdenes con los filtros actuales'
                  : 'Aún no tienes órdenes anteriores'
              }
            />
          }
        />
      </View>
    </SafeAreaView>
  )
}
