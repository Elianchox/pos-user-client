# Order Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add status filter chips, item search input, and fixed total footer to the Order screen, replacing the current OrderHeader.

**Architecture:** Filter state lives in `order.tsx` and is passed as props to new filter components. Items are filtered client-side by matching `activeStatuses` (multi-select) and `searchQuery` (debounced text match on `productName`). The total bar is position-fixed at the bottom.

**Tech Stack:** React Native, TypeScript, expo-router, `makeStyles` theme system.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/order/OrderFilterBar.tsx` | Create | Status filter chips with "Todos" toggle |
| `src/components/order/ItemSearchInput.tsx` | Create | Search input with debounce and clear button |
| `src/components/order/OrderTotal.tsx` | Create | Fixed bottom bar showing total amount |
| `src/app/order.tsx` | Modify | Wire up filters, remove OrderHeader, add total footer |

---

### Task 1: OrderFilterBar Component

**Files:**
- Create: `src/components/order/OrderFilterBar.tsx`

- [ ] **Step 1: Create the OrderFilterBar component**

```typescript
// src/components/order/OrderFilterBar.tsx
import { Pressable, ScrollView, Text, View } from 'react-native'
import { getStatusLabel, ORDER_ITEM_STATUS_COLORS } from '@/utils/status'
import { ORDER_ITEM_STATUS } from '@/types/api'
import { makeStyles } from '@/theme/makeStyles'

type OrderStatusType = (typeof ORDER_ITEM_STATUS)[number]

interface OrderFilterBarProps {
  activeStatuses: OrderStatusType[] | null
  onToggle: (status: OrderStatusType) => void
  onClearAll: () => void
}

const useStyles = makeStyles((t) => ({
  container: {
    marginBottom: t.spacing[3],
  },
  scrollRow: {
    flexDirection: 'row',
    gap: t.spacing[2],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: t.muted,
  },
  clearLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: t.mutedForeground,
  },
}))

export function OrderFilterBar({ activeStatuses, onToggle, onClearAll }: OrderFilterBarProps) {
  const styles = useStyles()
  const hasActiveFilters = activeStatuses !== null && activeStatuses.length > 0

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.scrollRow}>
          <Pressable
            onPress={onClearAll}
            style={[
              styles.chip,
              !hasActiveFilters && {
                backgroundColor: ORDER_ITEM_STATUS_COLORS.PENDING.bg,
              },
              !hasActiveFilters && {
                borderColor: ORDER_ITEM_STATUS_COLORS.PENDING.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                !hasActiveFilters && { color: ORDER_ITEM_STATUS_COLORS.PENDING.text },
                hasActiveFilters && { color: ORDER_ITEM_STATUS_COLORS.SERVED.bg },
              ]}
            >
              Todos
            </Text>
          </Pressable>

          {ORDER_ITEM_STATUS.map((status) => {
            const isActive = hasActiveFilters && activeStatuses.includes(status)
            const colors = ORDER_ITEM_STATUS_COLORS[status]

            return (
              <Pressable
                key={status}
                onPress={() => onToggle(status)}
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: colors.bg, borderColor: colors.bg }
                    : { borderColor: colors.bg },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isActive ? { color: colors.text } : { color: colors.bg },
                  ]}
                >
                  {getStatusLabel(status)}
                </Text>
              </Pressable>
            )
          })}

          {hasActiveFilters && (
            <Pressable onPress={onClearAll} style={styles.clearButton}>
              <Text style={styles.clearLabel}>✕</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
```

- [ ] **Step 2: Run lint to verify**

Run: `npm run lint`
Expected: No errors

---

### Task 2: ItemSearchInput Component

**Files:**
- Create: `src/components/order/ItemSearchInput.tsx`

- [ ] **Step 1: Create the ItemSearchInput component**

```typescript
// src/components/order/ItemSearchInput.tsx
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface ItemSearchInputProps {
  onChange: (query: string) => void
}

const DEBOUNCE_MS = 300

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.card,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: t.radii.lg,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[2],
    marginBottom: t.spacing[3],
    gap: t.spacing[2],
  },
  searchIcon: {
    fontSize: 16,
    color: t.mutedForeground,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: t.foreground,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: t.mutedForeground,
  },
}))

export function ItemSearchInput({ onChange }: ItemSearchInputProps) {
  const styles = useStyles()
  const [text, setText] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounce = useCallback(
    debounceFn((value: string) => onChange(value), DEBOUNCE_MS),
    [onChange],
  )

  const handleChangeText = (value: string) => {
    setText(value)
    debounce(value)
  }

  const handleClear = () => {
    setText('')
    onChange('')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleChangeText}
        placeholder="Buscar item..."
        placeholderTextColor={styles.searchIcon.color}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {text.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Text style={styles.clearIcon}>✕</Text>
        </Pressable>
      )}
    </View>
  )
}

function debounceFn(fn: (value: string) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (value: string) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(value), delay)
  }
}
```

- [ ] **Step 2: Run lint to verify**

Run: `npm run lint`
Expected: No errors

---

### Task 3: OrderTotal Component

**Files:**
- Create: `src/components/order/OrderTotal.tsx`

- [ ] **Step 1: Create the OrderTotal component**

```typescript
// src/components/order/OrderTotal.tsx
import { Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface OrderTotalProps {
  total: string
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    backgroundColor: t.card,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: t.mutedForeground,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: t.foreground,
  },
}))

export function OrderTotal({ total }: OrderTotalProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total</Text>
      <Text style={styles.amount}>${total}</Text>
    </View>
  )
}
```

- [ ] **Step 2: Run lint to verify**

Run: `npm run lint`
Expected: No errors

---

### Task 4: Wire Everything in Order Screen

**Files:**
- Modify: `src/app/order.tsx`

- [ ] **Step 1: Update order.tsx with filters, remove OrderHeader, add OrderTotal**

Replace the entire content of `src/app/order.tsx` with:

```typescript
import { ItemSearchInput } from '@/components/order/ItemSearchInput'
import { OrderFilterBar } from '@/components/order/OrderFilterBar'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { OrderTotal } from '@/components/order/OrderTotal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { useSession } from '@/context/SessionContext'
import { useOrderDetail } from '@/hooks/api/useOrderDetail'
import { useOrderStream } from '@/hooks/api/useOrderStream'
import { makeStyles } from '@/theme/makeStyles'
import { ORDER_ITEM_STATUS, type OrderItem } from '@/types/api'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type OrderStatusType = (typeof ORDER_ITEM_STATUS)[number]

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
    height: '100%',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
  },
  tableName: {
    fontSize: 20,
    fontWeight: '700',
    color: t.foreground,
    marginBottom: t.spacing[3],
  },
}))

export default function OrderScreen() {
  const router = useRouter()
  const { tableId, removeToken } = useSession()
  const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()

  const stream = useOrderStream()
  const styles = useStyles()

  const [activeStatuses, setActiveStatuses] = useState<OrderStatusType[] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const allGroups = useMemo(() => {
    const items = orderData?.data?.order?.items ?? []
    return groupItems(items)
  }, [orderData])

  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesStatus =
        activeStatuses === null ||
        group.items.some((item) => activeStatuses.includes(item.status as OrderStatusType))

      const matchesSearch =
        searchQuery === '' ||
        group.productName.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [allGroups, activeStatuses, searchQuery])

  const totalAmount = useMemo(() => {
    const items = orderData?.data?.order?.items ?? []
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    return total.toFixed(2)
  }, [orderData])

  const handleToggleStatus = useCallback((status: OrderStatusType) => {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <Text style={styles.tableName}>
            {orderData?.data?.table?.name ?? `Mesa ${tableId ?? ''}`}
          </Text>

          <OrderFilterBar
            activeStatuses={activeStatuses}
            onToggle={handleToggleStatus}
            onClearAll={handleClearFilters}
          />

          <ItemSearchInput onChange={handleSearch} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 80 }}
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
              />
            ))
          )}
        </ScrollView>

        <OrderTotal total={totalAmount} />
      </View>
    </SafeAreaView>
  )
}
```

- [ ] **Step 2: Run lint to verify**

Run: `npm run lint`
Expected: No errors

---
