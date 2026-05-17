# Adapt Backend API Changes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the mobile app to match the new backend SSE endpoint (`/api/mobile/stream` without `orderId`) and revised SSE event payloads (`connected` now carries `activeOrder`; `order.item_added` drops `status`; `order.item_ready`/`item_served` drop `status`).

**Architecture:** The SSE client becomes table-scoped (JWT-only) instead of order-scoped. The `connected` event now boots the order state, so `useOrderStream` hydrates the `orderDetail` React Query cache on first connect. All incremental events continue to patch that same cache.

**Tech Stack:** React Native, Expo, TypeScript, `@microsoft/fetch-event-source` (via `react-native-sse`), React Query v5, expo-router.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/constants/api.ts` | API endpoint constants |
| `src/types/api.ts` | TypeScript interfaces for API payloads and SSE events |
| `src/services/sse/client.ts` | SSE subscription wrapper — opens `/stream` and dispatches typed events |
| `src/hooks/api/useOrderStream.ts` | React hook that consumes SSE, manages connection state, and patches React Query cache |
| `src/app/order.tsx` | Screen that displays order items, wires `useOrderDetail` + `useOrderStream` |

---

### Task 1: Update `src/constants/api.ts` — remove `orderId` from stream endpoint

**Files:**
- Modify: `src/constants/api.ts`

- [ ] **Step 1: Edit the `ENDPOINTS` object**

Change `orderStream` from a function to a plain string.

```ts
// src/constants/api.ts
export const ENDPOINTS = {
  joinTable: '/auth/join',
  logout: '/auth/logout',
  tableStatus: (id: string) => `/tables/${id}/status`,
  orderDetail: '/orders/order-detail',
  orderItemStatuses: '/orders/order-item-statuses',
  orderStream: '/stream', // <-- was (id: string) => `/orders/${id}/stream`
} as const
```

- [ ] **Step 2: Run lint to verify no syntax errors**

Run: `npm run lint`
Expected: No errors in `src/constants/api.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/constants/api.ts
git commit -m "refactor(api): remove orderId param from stream endpoint constant"
```

---

### Task 2: Update `src/types/api.ts` — revise SSE event types

**Files:**
- Modify: `src/types/api.ts`

- [ ] **Step 1: Add a `StreamOrderItem` type (no `status`)**

Append after the existing `OrderItem` interface:

```ts
// Same shape as OrderItem but without status — used in SSE incremental events
export interface StreamOrderItem {
  itemId: string
  productId: string
  productName: string
  price: string
  imageUrl: string | null
}
```

- [ ] **Step 2: Change `ConnectedData` to match new `connected` payload**

Replace the existing `ConnectedData` interface:

```ts
export interface ConnectedData {
  table: TableStatus
  activeOrder: OrderDetailOrder | null
  message: string
}
```

- [ ] **Step 3: Change `ItemAddedData` to use `StreamOrderItem`**

Replace the existing `ItemAddedData` interface:

```ts
export interface ItemAddedData {
  items: StreamOrderItem[]
}
```

- [ ] **Step 4: Make `status` optional in `ItemStatusData`**

Backend no longer sends `status` in `order.item_ready` / `order.item_served`.

```ts
export interface ItemStatusData {
  itemId: string
  productName?: string
  status?: string // optional now
}
```

- [ ] **Step 5: Keep `OrderStreamEventEnum` and `OrderStreamEvent` union as-is**

Do **not** remove `Connected` from the enum. The Swagger `OrderStreamEvent` schema omits it, but the `/stream` endpoint documentation explicitly lists `connected` as part of the protocol. Removing it would break type checking for the initial handshake.

- [ ] **Step 6: Run lint**

Run: `npm run lint`
Expected: No errors in `src/types/api.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/types/api.ts
git commit -m "refactor(types): align SSE event payloads with new backend contract"
```

---

### Task 3: Update `src/services/sse/client.ts` — subscribe without `orderId`

**Files:**
- Modify: `src/services/sse/client.ts`

- [ ] **Step 1: Rewrite `subscribeOrderStream` signature and URL**

Remove the `orderId` parameter. The URL is now built from the constant directly.

```ts
// src/services/sse/client.ts
import { API_BASE_URL, ENDPOINTS } from '@/constants/api'
import { getToken } from '@/services/session'
import { STEAM_EVENT_TYPE_LIST, type OrderStreamEvent } from '@/types/api'
import EventSource from 'react-native-sse'

export async function subscribeOrderStream(
  {
    onEvent,
    onError,
    onOpen,
    signal,
  }: {
    onEvent: (event: OrderStreamEvent) => void
    onError?: (err: Error) => void
    onOpen?: () => void
    signal: AbortSignal
  },
) {
  const url = `${API_BASE_URL}${ENDPOINTS.orderStream}`
  const token = await getToken()

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const es = new EventSource<string>(url, { headers })

  es.addEventListener('open', () => {
    onOpen?.()
  })

  for (const eventType of STEAM_EVENT_TYPE_LIST) {
    es.addEventListener(eventType, (event) => {
      const data = event.data ? JSON.parse(event.data) : {}
      onEvent({ event: eventType, data })
    })
  }

  es.addEventListener('error', (event) => {
    const message =
      'message' in event && typeof event.message === 'string'
        ? event.message
        : 'SSE connection error'
    onError?.(new Error(message))
  })

  signal.addEventListener('abort', () => {
    es.close()
  })
}
```

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/services/sse/client.ts
git commit -m "refactor(sse): remove orderId from subscription, use /stream"
```

---

### Task 4: Update `src/hooks/api/useOrderStream.ts` — remove `orderId`, handle `activeOrder`, default `PENDING`

**Files:**
- Modify: `src/hooks/api/useOrderStream.ts`

- [ ] **Step 1: Remove `orderId` parameter and dependency**

```ts
// src/hooks/api/useOrderStream.ts
import { subscribeOrderStream } from '@/services/sse/client'
import { OrderStatusEnum, OrderStreamEventType, type OrderDetailResponse, type OrderItemStatusType } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const STATUS_MAP: Partial<Record<OrderStreamEventType, OrderItemStatusType>> = {
  'order.item_sent_to_kitchen': OrderStatusEnum.SENT_TO_KITCHEN,
  'order.item_ready': OrderStatusEnum.READY,
  'order.item_served': OrderStatusEnum.SERVED,
  'order.item_cancelled': OrderStatusEnum.CANCELLED,
}

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

export function useOrderStream() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OrderStreamState>(initialStreamState)

  useEffect(() => {
    const controller = new AbortController()
    let isActive = true

    ;(async () => {
      try {
        await subscribeOrderStream({
          signal: controller.signal,
          onOpen: () => {
            if (!isActive) return
            setState((prev) => ({ ...prev, isConnected: true }))
          },
          onEvent: (event) => {
            if (!isActive) return
            setState((prev) => {
              const base = { ...prev, isConnected: true }

              switch (event.event) {
                case 'connected': {
                  // Hydrate React Query cache with the full order from the handshake
                  const activeOrder = event.data.activeOrder
                  if (activeOrder) {
                    const payload: OrderDetailResponse = {
                      success: true,
                      data: {
                        table: event.data.table,
                        order: activeOrder,
                      },
                    }
                    queryClient.setQueryData(['orderDetail'], payload)
                  } else {
                    // Clear any stale order data when activeOrder is null
                    queryClient.setQueryData(['orderDetail'], {
                      success: true,
                      data: { table: event.data.table, order: null },
                    })
                  }
                  return base
                }
                case 'heartbeat':
                  return base
                case 'order.item_added': {
                  // Backend no longer sends status for added items — default to PENDING
                  const added = event.data.items.map((item) => ({
                    ...item,
                    status: OrderStatusEnum.PENDING,
                  }))
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items || added.length === 0) return old
                    const existingIds = new Set(old.data.order.items.map((i) => i.itemId))
                    const newItems = added.filter((i) => !existingIds.has(i.itemId))
                    if (newItems.length === 0) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: { ...old.data.order, items: [...old.data.order.items, ...newItems] },
                      },
                    }
                  })
                  return base
                }
                case 'order.item_sent_to_kitchen': {
                  const status = STATUS_MAP[event.event]
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items) return old
                    const ids = new Set(event.data.itemIds)
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: {
                          ...old.data.order,
                          items: old.data.order.items.map((item) =>
                            ids.has(item.itemId) ? { ...item, status } : item
                          ),
                        },
                      },
                    }
                  })
                  return base
                }
                case 'order.item_ready':
                case 'order.item_served':
                case 'order.item_cancelled': {
                  // Fallback to STATUS_MAP because event.data.status is no longer sent
                  const status = event.data.status ?? STATUS_MAP[event.event]
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: {
                          ...old.data.order,
                          items: old.data.order.items.map((item) =>
                            item.itemId === event.data.itemId ? { ...item, status } : item
                          ),
                        },
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
            console.error('SSE connection error')
            setState((prev) => ({ ...prev, isConnected: false }))
          },
        })
      } catch (err) {
        console.error('SSE subscription setup failed:', err)
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
  }, [queryClient])

  return state
}
```

Key changes in this rewrite:
- `useOrderStream()` takes **no arguments**.
- `useEffect` dependency array is `[queryClient]` only.
- On `connected`, the hook now hydrates the `orderDetail` cache with `activeOrder` (or clears it when `null`).
- On `order.item_added`, each incoming item is enriched with `status: OrderStatusEnum.PENDING` before merging into the cache.
- `order.item_ready` / `order.item_served` handlers still work because they fall back to `STATUS_MAP[event.event]`.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/api/useOrderStream.ts
git commit -m "refactor(useOrderStream): remove orderId, hydrate order from connected event, default PENDING for added items"
```

---

### Task 5: Update `src/app/order.tsx` — remove `orderId` extraction and argument

**Files:**
- Modify: `src/app/order.tsx`

- [ ] **Step 1: Remove `orderId` and pass no args to `useOrderStream`**

```tsx
// src/app/order.tsx (relevant excerpt)
  const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()
  const { data: tableData, isLoading: tableLoading } = useTableStatus(tableId ?? '')

  const stream = useOrderStream() // <-- no argument
```

Delete these lines entirely:
```tsx
  const orderId = orderData?.data?.order?.orderId ?? ''
  const stream = useOrderStream(orderId)
```

And replace with:
```tsx
  const stream = useOrderStream()
```

- [ ] **Step 2: Verify no remaining references to `orderId`**

Run: `grep -n "orderId" src/app/order.tsx`
Expected: No matches.

- [ ] **Step 3: Run lint on the full project**

Run: `npm run lint`
Expected: Clean pass (0 errors, 0 warnings related to our changes).

- [ ] **Step 4: Commit**

```bash
git add src/app/order.tsx
git commit -m "refactor(order screen): remove orderId extraction, call useOrderStream without args"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] SSE endpoint changed from `/orders/{orderId}/stream` to `/stream` → Task 1, Task 3
- [x] `connected` event now carries `activeOrder` with full order data → Task 2, Task 4
- [x] `order.item_added` no longer includes `status` → Task 2, Task 4
- [x] `order.item_ready` / `order.item_served` no longer include `status` → Task 2, Task 4
- [x] `useOrderStream` no longer requires `orderId` → Task 4, Task 5
- [x] `useOrderStream` hydrates `orderDetail` cache on `connected` → Task 4

**2. Placeholder scan:**
- No TBD, TODO, or vague instructions found.
- All code blocks contain complete, copy-pasteable TypeScript.

**3. Type consistency:**
- `ENDPOINTS.orderStream` is now a plain string — consumed in `client.ts` as `${API_BASE_URL}${ENDPOINTS.orderStream}`.
- `subscribeOrderStream` signature updated to remove `orderId`.
- `useOrderStream()` takes no arguments.
- `OrderStreamEvent` union still includes `Connected` to match runtime protocol.
- `ItemAddedData.items` uses `StreamOrderItem[]` (no `status`), but `useOrderStream` maps them to full `OrderItem` with `status: PENDING` before cache insertion.

---

**Plan complete and saved to `.opencode/plans/2026-05-17-adapt-backend-api-changes.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like?
