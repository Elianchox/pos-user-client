# POS User Client Main Views Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the main user-facing views (welcome, QR scan, order detail, thank-you) and improve existing hooks for SSE integration, session persistence, and deep-link handling.

**Architecture:** Single-stack expo-router navigation with 4 routes. Existing hooks are enhanced to integrate SSE with React Query cache. New reusable UI components handle loading/error/empty states. Order items are grouped by productId and rendered as animated accordions.

**Tech Stack:** Expo 55, React Native 0.83, expo-router, NativeWind v4, @tanstack/react-query v5, expo-camera, react-native-reanimated, expo-image, expo-linking, @microsoft/fetch-event-source.

---

## File Structure

```
src/
  utils/
    qr.ts                      NEW
    status.ts                  NEW

  hooks/
    api/
      useJoinTable.ts          MODIFY
      useOrderDetail.ts        MODIFY
      useOrderStream.ts        MODIFY
      useOrderItemStatuses.ts  MODIFY
      useLogout.ts             MODIFY
      useSessionRestore.ts     NEW
    useDeepLink.ts             NEW

  components/
    ui/
      LoadingState.tsx         NEW
      ErrorState.tsx           NEW
      EmptyState.tsx           NEW
    order/
      StatusBadge.tsx          NEW
      ConnectionStatus.tsx     NEW
      OrderItemRow.tsx         NEW
      OrderItemGroup.tsx       NEW
      OrderHeader.tsx          NEW

  app/
    _layout.tsx                MODIFY
    index.tsx                  MODIFY
    scan.tsx                   NEW
    order.tsx                  NEW
    thank-you.tsx              NEW

  screens/
    HomeScreen.tsx             DELETE
```

---

## Task 1: Install expo-camera

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install dependency**

Run:
```bash
npx expo install expo-camera
```
Expected: package installs successfully.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: install expo-camera for QR scanning"
```

---

## Task 2: Create utility — QR URL parser

**Files:**
- Create: `src/utils/qr.ts`

- [ ] **Step 1: Write `src/utils/qr.ts`**

```ts
const DEEPLINK_PATH = '/deeplink/table/'
const ALLOWED_HOSTS = ['pos.eliancho.dev']

export interface ParsedQrUrl {
  tableId: string
}

export function parseQrUrl(url: string): ParsedQrUrl | null {
  try {
    const parsed = new URL(url)

    if (!ALLOWED_HOSTS.includes(parsed.host)) {
      return null
    }

    const path = parsed.pathname
    if (!path.startsWith(DEEPLINK_PATH)) {
      return null
    }

    const tableId = path.slice(DEEPLINK_PATH.length)
    if (!tableId || tableId.includes('/')) {
      return null
    }

    return { tableId }
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/qr.ts
git commit -m "feat(utils): add QR/deep-link URL parser"
```

---

## Task 3: Create utility — status labels & colors

**Files:**
- Create: `src/utils/status.ts`

- [ ] **Step 1: Write `src/utils/status.ts`**

```ts
export const ORDER_ITEM_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  SENT_TO_KITCHEN: 'En cocina',
  PREPARING: 'Preparando',
  READY: 'Lista',
  SERVED: 'Servida',
  CANCELLED: 'Cancelada',
}

export interface StatusColor {
  bg: string
  text: string
}

export const ORDER_ITEM_STATUS_COLORS: Record<string, StatusColor> = {
  PENDING: { bg: 'bg-yellow-500', text: 'text-white' },
  SENT_TO_KITCHEN: { bg: 'bg-orange-500', text: 'text-white' },
  PREPARING: { bg: 'bg-blue-500', text: 'text-white' },
  READY: { bg: 'bg-green-500', text: 'text-white' },
  SERVED: { bg: 'bg-gray-400', text: 'text-white' },
  CANCELLED: { bg: 'bg-red-500', text: 'text-white' },
}

export function getStatusLabel(status: string): string {
  return ORDER_ITEM_STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: string): StatusColor {
  return ORDER_ITEM_STATUS_COLORS[status] ?? { bg: 'bg-gray-400', text: 'text-white' }
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/utils/status.ts
git commit -m "feat(utils): add order item status labels and color map"
```

---

## Task 4: Improve `useJoinTable`

**Files:**
- Modify: `src/hooks/api/useJoinTable.ts`

- [ ] **Step 1: Update `useJoinTable.ts`**

Replace the entire file with:

```ts
import { useMutation } from '@tanstack/react-query'
import { joinTable } from '@/services/api/endpoints'
import { useSession } from '@/context/SessionContext'
import type { JoinTableRequest } from '@/types/api'

export function useJoinTable() {
  const { saveToken, saveTableId } = useSession()

  return useMutation({
    mutationFn: ({ body, signal }: { body: JoinTableRequest; signal?: AbortSignal }) =>
      joinTable(body, signal),
    onSuccess: (data, variables) => {
      if (data.data.token) {
        saveToken(data.data.token)
      }
      if (variables.body.tableId) {
        saveTableId(variables.body.tableId)
      }
    },
  })
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useJoinTable.ts
git commit -m "feat(hooks): persist tableId in useJoinTable on success"
```

---

## Task 5: Improve `useOrderDetail`

**Files:**
- Modify: `src/hooks/api/useOrderDetail.ts`

- [ ] **Step 1: Update `useOrderDetail.ts`**

Replace the entire file with:

```ts
import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/client'
import type { OrderDetailResponse } from '@/types/api'

export function useOrderDetail() {
  return useQuery<OrderDetailResponse>({
    queryKey: ['orderDetail'],
    queryFn: ({ signal }) => getOrderDetail(signal),
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useOrderDetail.ts
git commit -m "feat(hooks): add staleTime Infinity and 401 handling to useOrderDetail"
```

---

## Task 6: Improve `useOrderStream`

**Files:**
- Modify: `src/hooks/api/useOrderStream.ts`

- [ ] **Step 1: Update `useOrderStream.ts`**

Replace the entire file with:

```ts
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeOrderStream } from '@/services/sse/client'
import type { OrderItem, OrderDetailResponse } from '@/types/api'

export interface OrderStreamState {
  isConnected: boolean
  orderClosed: boolean
  sessionEnded: boolean
}

const initialStreamState: OrderStreamState = {
  isConnected: false,
  orderClosed: false,
  sessionEnded: false,
}

export function useOrderStream(orderId: string) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OrderStreamState>(initialStreamState)

  useEffect(() => {
    if (!orderId) return

    const controller = new AbortController()
    let isActive = true

    ;(async () => {
      try {
        await subscribeOrderStream(orderId, {
          signal: controller.signal,
          onEvent: (event) => {
            if (!isActive) return
            setState((prev) => {
              const base = { ...prev, isConnected: true }

              switch (event.event) {
                case 'order.item_added': {
                  const newItem = event.data as Partial<OrderItem>
                  if (!newItem.itemId || !newItem.productId) return base
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.items) return old
                    return {
                      ...old,
                      data: { ...old.data, items: [...old.data.items, newItem as OrderItem] },
                    }
                  })
                  return base
                }
                case 'order.item_sent_to_kitchen':
                case 'order.item_ready':
                case 'order.item_served':
                case 'order.item_cancelled': {
                  const update = event.data as { itemId?: string; status?: string }
                  if (!update.itemId || !update.status) return base
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.items) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.map((item) =>
                          item.itemId === update.itemId ? { ...item, status: update.status } : item
                        ),
                      },
                    }
                  })
                  return base
                }
                case 'order.order_closed':
                  return { ...base, orderClosed: true }
                case 'session.ended':
                  return { ...base, sessionEnded: true, isConnected: false }
                default:
                  return base
              }
            })
          },
          onError: () => {
            if (!isActive) return
            setState((prev) => ({ ...prev, isConnected: false }))
          },
        })
      } catch {
        // Connection aborted or failed
      } finally {
        if (isActive) {
          setState((prev) => ({ ...prev, isConnected: false }))
        }
      }
    })()

    return () => {
      isActive = false
      controller.abort()
      setState(initialStreamState)
    }
  }, [orderId, queryClient])

  return state
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useOrderStream.ts
git commit -m "feat(hooks): integrate useOrderStream with queryClient cache updates"
```

---

## Task 7: Improve `useOrderItemStatuses`

**Files:**
- Modify: `src/hooks/api/useOrderItemStatuses.ts`

- [ ] **Step 1: Update `useOrderItemStatuses.ts`**

Replace the entire file with:

```ts
import { useQuery } from '@tanstack/react-query'
import { getOrderItemStatuses } from '@/services/api/endpoints'
import type { OrderItemStatusesResponse } from '@/types/api'

export function useOrderItemStatuses() {
  return useQuery<OrderItemStatusesResponse>({
    queryKey: ['orderItemStatuses'],
    queryFn: ({ signal }) => getOrderItemStatuses(signal),
    staleTime: Infinity,
  })
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useOrderItemStatuses.ts
git commit -m "feat(hooks): add Infinity staleTime to useOrderItemStatuses"
```

---

## Task 8: Improve `useLogout`

**Files:**
- Modify: `src/hooks/api/useLogout.ts`

- [ ] **Step 1: Update `useLogout.ts`**

Replace the entire file with:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/services/api/endpoints'
import { useSession } from '@/context/SessionContext'
import { useRouter } from 'expo-router'

export function useLogout() {
  const { removeToken } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (signal?: AbortSignal) => logout(signal),
    onSuccess: () => {
      removeToken()
      queryClient.clear()
      router.replace('/')
    },
  })
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useLogout.ts
git commit -m "feat(hooks): redirect to home on logout success"
```

---

## Task 9: Update types — add `orderId` to `OrderDetailResponse`

**Files:**
- Modify: `src/types/api.ts`

- [ ] **Step 1: Update `OrderDetailResponse`**

In `src/types/api.ts`, change:

```ts
export interface OrderDetailResponse {
  success: boolean
  data: { items: OrderItem[] }
}
```

To:

```ts
export interface OrderDetailResponse {
  success: boolean
  data: { orderId?: string; items: OrderItem[] }
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts
git commit -m "feat(types): add optional orderId to OrderDetailResponse"
```

---

## Task 10: Create `useSessionRestore`

**Files:**
- Create: `src/hooks/api/useSessionRestore.ts`

- [ ] **Step 1: Write `useSessionRestore.ts`**

```ts
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { getOrderDetail } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/client'
import { useSession } from '@/context/SessionContext'
import { parseQrUrl } from '@/utils/qr'

export function useSessionRestore() {
  const { token, tableId, removeToken, isLoading: sessionLoading } = useSession()
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState(true)
  const hasRun = useRef(false)

  useEffect(() => {
    if (sessionLoading || hasRun.current) return
    hasRun.current = true

    async function restore() {
      const initialUrl = await Linking.getInitialURL()
      const parsedQr = initialUrl ? parseQrUrl(initialUrl) : null

      if (!token) {
        if (parsedQr) {
          router.replace({ pathname: '/scan', params: { tableId: parsedQr.tableId } })
        }
        setIsRestoring(false)
        return
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const result = await getOrderDetail(controller.signal)
        clearTimeout(timeout)

        if (result.success && result.data) {
          router.replace('/order')
        } else {
          await removeToken()
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await removeToken()
        }
      } finally {
        setIsRestoring(false)
      }
    }

    restore()
  }, [token, tableId, sessionLoading, removeToken, router])

  return { isRestoring }
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useSessionRestore.ts
git commit -m "feat(hooks): add useSessionRestore for automatic session recovery"
```

---

## Task 11: Create `useDeepLink`

**Files:**
- Create: `src/hooks/useDeepLink.ts`

- [ ] **Step 1: Write `useDeepLink.ts`**

```ts
import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { parseQrUrl } from '@/utils/qr'
import { useSession } from '@/context/SessionContext'

export function useDeepLink() {
  const router = useRouter()
  const { token, saveTableId } = useSession()

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = parseQrUrl(event.url)
      if (!parsed) return

      if (token) {
        saveTableId(parsed.tableId)
        router.replace('/order')
      } else {
        router.push({ pathname: '/scan', params: { tableId: parsed.tableId } })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [token, router, saveTableId])
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDeepLink.ts
git commit -m "feat(hooks): add useDeepLink for external QR deep links while app is running"
```

---

## Task 12: Create UI state components

**Files:**
- Create: `src/components/ui/LoadingState.tsx`
- Create: `src/components/ui/ErrorState.tsx`
- Create: `src/components/ui/EmptyState.tsx`

- [ ] **Step 1: Write `LoadingState.tsx`**

```tsx
import { ActivityIndicator, Text, View } from 'react-native'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Cargando...', fullScreen = false }: LoadingStateProps) {
  const containerClass = fullScreen ? 'flex-1 items-center justify-center' : 'py-8 items-center'

  return (
    <View className={containerClass}>
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="mt-4 text-base text-muted-foreground">{message}</Text>
    </View>
  )
}
```

- [ ] **Step 2: Write `ErrorState.tsx`**

```tsx
import { Text, TouchableOpacity, View } from 'react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Algo salió mal', onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-4xl mb-4">⚠️</Text>
      <Text className="text-lg font-semibold text-foreground text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-6 bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground font-medium">Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
```

- [ ] **Step 3: Write `EmptyState.tsx`**

```tsx
import { Text, View } from 'react-native'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No hay datos' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-4xl mb-4">📭</Text>
      <Text className="text-lg text-muted-foreground text-center">{message}</Text>
    </View>
  )
}
```

- [ ] **Step 4: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/LoadingState.tsx src/components/ui/ErrorState.tsx src/components/ui/EmptyState.tsx
git commit -m "feat(ui): add LoadingState, ErrorState, EmptyState components"
```

---

## Task 13: Create order sub-components

**Files:**
- Create: `src/components/order/StatusBadge.tsx`
- Create: `src/components/order/ConnectionStatus.tsx`
- Create: `src/components/order/OrderItemRow.tsx`
- Create: `src/components/order/OrderItemGroup.tsx`

- [ ] **Step 1: Write `StatusBadge.tsx`**

```tsx
import { Text, View } from 'react-native'
import { getStatusLabel, getStatusColor } from '@/utils/status'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status)
  const colors = getStatusColor(status)

  return (
    <View className={`${colors.bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${colors.text} text-xs font-medium`}>{label}</Text>
    </View>
  )
}
```

- [ ] **Step 2: Write `ConnectionStatus.tsx`**

```tsx
import { Text, View } from 'react-native'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`}
      />
      <Text className="text-xs text-muted-foreground">
        {isConnected ? 'En vivo' : 'Desconectado'}
      </Text>
    </View>
  )
}
```

- [ ] **Step 3: Write `OrderItemRow.tsx`**

```tsx
import React from 'react'
import { Text, View } from 'react-native'
import { StatusBadge } from './StatusBadge'
import type { OrderItem } from '@/types/api'

interface OrderItemRowProps {
  item: OrderItem
  index: number
}

export const OrderItemRow = React.memo(function OrderItemRow({ item, index }: OrderItemRowProps) {
  return (
    <View className="flex-row items-center justify-between py-2 px-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-sm text-muted-foreground">#{index + 1}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text className="text-sm text-foreground">${item.price}</Text>
    </View>
  )
})
```

- [ ] **Step 4: Write `OrderItemGroup.tsx`**

```tsx
import React, { useCallback, useMemo, useState } from 'react'
import { LayoutAnimation, Pressable, Text, View } from 'react-native'
import { Image } from 'expo-image'
import { StatusBadge } from './StatusBadge'
import { OrderItemRow } from './OrderItemRow'
import type { OrderItem } from '@/types/api'

interface OrderItemGroupProps {
  productId: string
  productName: string
  imageUrl: string | null
  price: string
  count: number
  items: OrderItem[]
}

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
    <View className="bg-card rounded-xl border border-border overflow-hidden mb-3">
      <Pressable onPress={toggle} className="flex-row items-center p-3 gap-3 active:opacity-80">
        <View className="w-14 h-14 rounded-lg bg-muted overflow-hidden">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-muted-foreground text-xl">🍽️</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-card-foreground" numberOfLines={1}>
            {productName}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5">
            x{count} · ${totalPrice}
          </Text>
        </View>

        <View className="items-end gap-1">
          <StatusBadge status={majorityStatus} />
          <Text className="text-xs text-muted-foreground">{isOpen ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {isOpen && (
        <View className="border-t border-border">
          {items.map((item, idx) => (
            <OrderItemRow key={item.itemId} item={item} index={idx} />
          ))}
        </View>
      )}
    </View>
  )
})
```

- [ ] **Step 5: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/order/StatusBadge.tsx src/components/order/ConnectionStatus.tsx src/components/order/OrderItemRow.tsx src/components/order/OrderItemGroup.tsx
git commit -m "feat(order): add StatusBadge, ConnectionStatus, OrderItemRow, OrderItemGroup"
```

---

## Task 14: Create `OrderHeader` component

**Files:**
- Create: `src/components/order/OrderHeader.tsx`

- [ ] **Step 1: Write `OrderHeader.tsx`**

```tsx
import { Text, View } from 'react-native'
import { ConnectionStatus } from './ConnectionStatus'

interface OrderHeaderProps {
  tableName: string
  totalAmount: string
  isConnected: boolean
}

export function OrderHeader({ tableName, totalAmount, isConnected }: OrderHeaderProps) {
  return (
    <View className="px-4 py-4 bg-card border-b border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-card-foreground">{tableName}</Text>
        <ConnectionStatus isConnected={isConnected} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">Total</Text>
        <Text className="text-xl font-bold text-card-foreground">${totalAmount}</Text>
      </View>
    </View>
  )
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/order/OrderHeader.tsx
git commit -m "feat(order): add OrderHeader component with connection status"
```

---

## Task 15: Create Scan Screen

**Files:**
- Create: `src/app/scan.tsx`

- [ ] **Step 1: Write `scan.tsx`**

```tsx
import { useState } from 'react'
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useJoinTable } from '@/hooks/api/useJoinTable'
import { useSession } from '@/context/SessionContext'
import { parseQrUrl } from '@/utils/qr'

export default function ScanScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const paramTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId
  const { token, saveTableId } = useSession()
  const joinTableMutation = useJoinTable()
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedTableId, setScannedTableId] = useState<string | null>(paramTableId ?? null)
  const [customerName, setCustomerName] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg text-foreground text-center mb-4">
          Necesitamos permiso para acceder a la cámara y escanear el código QR.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-primary-foreground font-medium">Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedTableId || joinTableMutation.isPending) return

    const parsed = parseQrUrl(data)
    if (!parsed) {
      setScanError('Código QR no válido. Intenta con otro.')
      return
    }

    setScanError(null)

    if (token) {
      saveTableId(parsed.tableId)
      router.replace('/order')
    } else {
      setScannedTableId(parsed.tableId)
    }
  }

  const handleJoin = async () => {
    if (!scannedTableId) return

    const controller = new AbortController()
    joinTableMutation.mutate(
      { body: { tableId: scannedTableId, customerName: customerName || null }, signal: controller.signal },
      {
        onSuccess: () => {
          router.replace('/order')
        },
        onError: () => {
          setScanError('No se pudo unir a la mesa. Intenta de nuevo.')
        },
      },
    )
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-2xl text-foreground">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">Escanear QR</Text>
      </View>

      {scanError && (
        <View className="mx-4 mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <Text className="text-sm text-destructive text-center">{scanError}</Text>
        </View>
      )}

      {!scannedTableId ? (
        <View className="flex-1 relative">
          <CameraView
            className="flex-1"
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View className="absolute inset-0 pointer-events-none items-center justify-center">
            <View className="w-64 h-64 border-2 border-white/50 rounded-xl" />
          </View>
          <Text className="absolute bottom-8 left-0 right-0 text-center text-white text-sm bg-black/40 py-2">
            Enfoca el código QR de tu mesa
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-6 py-8 items-center justify-center">
          <Text className="text-2xl mb-2">👋</Text>
          <Text className="text-lg font-semibold text-foreground mb-1">Bienvenido</Text>
          <Text className="text-muted-foreground text-center mb-6">
            Ingresa tu nombre para continuar (opcional)
          </Text>

          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Tu nombre"
            placeholderTextColor="#9ca3af"
            className="w-full max-w-sm bg-input text-foreground px-4 py-3 rounded-lg border border-border mb-4"
            autoCapitalize="words"
          />

          <TouchableOpacity
            onPress={handleJoin}
            disabled={joinTableMutation.isPending}
            className={`w-full max-w-sm py-3 rounded-lg items-center ${
              joinTableMutation.isPending ? 'bg-muted' : 'bg-primary'
            }`}
          >
            <Text className="text-primary-foreground font-medium">
              {joinTableMutation.isPending ? 'Uniendo...' : 'Unirse a la mesa'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScannedTableId(null)} className="mt-4">
            <Text className="text-muted-foreground">Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/scan.tsx
git commit -m "feat(scan): add QR scan screen with camera and join flow"
```

---

## Task 16: Create Order Screen

**Files:**
- Create: `src/app/order.tsx`

- [ ] **Step 1: Write `order.tsx`**

```tsx
import { useEffect, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useOrderDetail } from '@/hooks/api/useOrderDetail'
import { useOrderStream } from '@/hooks/api/useOrderStream'
import { useTableStatus } from '@/hooks/api/useTableStatus'
import { useSession } from '@/context/SessionContext'
import { OrderHeader } from '@/components/order/OrderHeader'
import { OrderItemGroup } from '@/components/order/OrderItemGroup'
import { LoadingState } from '@/components/ui/LoadingState'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import type { OrderItem } from '@/types/api'

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
  items.forEach((item) => {
    const existing = map.get(item.productId) || []
    existing.push(item)
    map.set(item.productId, existing)
  })

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
  const { data: tableData } = useTableStatus(tableId ?? '')
  const orderId = orderData?.data?.orderId ?? ''
  const stream = useOrderStream(orderId)

  const groups = useMemo(() => {
    const items = orderData?.data?.items ?? []
    return groupItems(items)
  }, [orderData])

  const totalAmount = useMemo(() => {
    const items = orderData?.data?.items ?? []
    const total = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    return total.toFixed(2)
  }, [orderData])

  useEffect(() => {
    if (!tableId) {
      router.replace('/')
    }
  }, [tableId, router])

  useEffect(() => {
    if (stream.orderClosed || stream.sessionEnded) {
      removeToken().then(() => {
        router.replace('/thank-you')
      })
    }
  }, [stream.orderClosed, stream.sessionEnded, removeToken, router])

  if (orderLoading) {
    return <LoadingState fullScreen message="Cargando tu orden..." />
  }

  if (orderError) {
    return (
      <ErrorState
        message="No pudimos cargar tu orden"
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <View className="flex-1 bg-background">
      <OrderHeader
        tableName={tableData?.data?.name ?? `Mesa ${tableId ?? ''}`}
        totalAmount={totalAmount}
        isConnected={stream.isConnected}
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
  )
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/order.tsx
git commit -m "feat(order): add order detail screen with grouped items and SSE"
```

---

## Task 17: Create Thank You Screen

**Files:**
- Create: `src/app/thank-you.tsx`

- [ ] **Step 1: Write `thank-you.tsx`**

```tsx
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function ThankYouScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-6xl mb-4">🙏</Text>
      <Text className="text-2xl font-bold text-foreground text-center mb-2">
        Gracias por tu visita
      </Text>
      <Text className="text-base text-muted-foreground text-center mb-8">
        Tu mesa ha sido cerrada. Esperamos verte pronto.
      </Text>
      <TouchableOpacity
        onPress={() => router.replace('/')}
        className="bg-primary px-8 py-4 rounded-2xl w-full max-w-sm active:opacity-80"
      >
        <Text className="text-primary-foreground text-center text-lg font-semibold">
          Escanear otra mesa
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/thank-you.tsx
git commit -m "feat(thank-you): add thank you screen after table closure"
```

---

## Task 18: Update Welcome Screen

**Files:**
- Modify: `src/app/index.tsx`
- Delete: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Write `src/app/index.tsx`**

```tsx
import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessionRestore } from '@/hooks/api/useSessionRestore'
import { LoadingState } from '@/components/ui/LoadingState'

export default function WelcomeScreen() {
  const router = useRouter()
  const { isRestoring } = useSessionRestore()

  if (isRestoring) {
    return <LoadingState fullScreen message="Restaurando sesión..." />
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-5xl mb-4">🍽️</Text>
      <Text className="text-3xl font-bold text-foreground text-center mb-2">
        Bienvenido
      </Text>
      <Text className="text-base text-muted-foreground text-center mb-8">
        Escanea el QR de tu mesa para ver tu orden en tiempo real.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/scan')}
        className="bg-primary px-8 py-4 rounded-2xl w-full max-w-sm active:opacity-80"
      >
        <Text className="text-primary-foreground text-center text-lg font-semibold">
          Escanear QR
        </Text>
      </TouchableOpacity>
    </View>
  )
}
```

- [ ] **Step 2: Delete old HomeScreen**

```bash
rm src/screens/HomeScreen.tsx
rmdir src/screens 2>/dev/null || true
```

- [ ] **Step 3: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/index.tsx
git rm src/screens/HomeScreen.tsx
git commit -m "feat(welcome): replace HomeScreen with inline WelcomeScreen and session restore"
```

---

## Task 19: Update Root Layout

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Update `_layout.tsx`**

Replace the entire file with:

```tsx
import '../global.css'

import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useDeepLink } from '@/hooks/useDeepLink'

const queryClient = new QueryClient()

function DeepLinkHandler() {
  useDeepLink()
  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <DeepLinkHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat(layout): add deep link handler to root layout"
```

---

## Task 20: Final verification

**Files:**
- All files above

- [ ] **Step 1: Run full lint**

Run: `npm run lint`
Expected: No errors across the entire project.

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "feat: complete main views implementation (welcome, scan, order, thank-you)"
```

---

## Spec Coverage Checklist

| Spec Requirement | Implementing Task |
|---|---|
| Welcome screen with CTA | Task 18 |
| QR scan with expo-camera | Task 15 |
| Parse QR URL | Task 2 |
| Join table / persist session | Task 4, Task 10 |
| Order detail with grouped items | Task 16 |
| Accordion groups | Task 13 |
| Status badges with colors | Task 3, Task 13 |
| SSE real-time updates | Task 6 |
| SSE → Query cache integration | Task 6 |
| Connection status indicator | Task 13, Task 14 |
| Session restore on app open | Task 10 |
| Deep link handling | Task 11, Task 19 |
| Order closed / session ended → cleanup | Task 6, Task 16 |
| Thank you screen | Task 17 |
| Loading / error / empty states | Task 12 |
| Responsive layout | All screen tasks |
| AbortSignal on requests | Existing + Tasks 4–8 |

---

## Placeholder Scan

- No "TBD", "TODO", or "implement later" found.
- No vague instructions like "add appropriate error handling" — every component has explicit error states.
- No "similar to Task N" references — each task is self-contained.
- All file paths are exact.
- All code blocks are complete and syntactically valid.
