# SSE to Polling Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace SSE real-time order updates with 8-second polling to `order-detail` endpoint, with automatic pause/resume on app background/focus.

**Architecture:** Add `focusManager` bridge in `_layout.tsx` using React Native's `AppState` so React Query's `refetchOnWindowFocus` works natively. Then use `useQuery` with `refetchInterval: 8000` and `refetchOnWindowFocus: true` — React Query handles all lifecycle internally (pause in background, resume on focus, dedupe requests). Remove all SSE-related code, components, and fallback logic.

**Tech Stack:** @tanstack/react-query v5, expo-router, TypeScript

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/app/_layout.tsx` | Add `focusManager` bridge with `AppState` for `refetchOnWindowFocus` |
| Modify | `src/hooks/api/useOrderDetail.ts` | Add `refetchInterval: 8000`, `refetchOnWindowFocus: true` |
| Modify | `src/app/order.tsx` | Remove SSE hook usage, remove ConnectionStatus, remove reconnectFallback |
| Delete | `src/hooks/api/useOrderStream.ts` | SSE hook — no longer needed |
| Delete | `src/hooks/api/useReconnectFallback.ts` | SSE reconnect fallback — no longer needed |
| Delete | `src/components/order/ConnectionStatus.tsx` | SSE connection indicator — no longer needed |
| Delete | `src/services/sse/client.ts` | SSE client — no longer needed |
| Modify | `src/constants/api.ts` | Remove `orderStream` endpoint |
| Modify | `src/types/api.ts` | Remove SSE-specific types (`StreamOrderItem`, `OrderStreamEvent`, `STEAM_EVENT_TYPE_LIST`) |
| Modify | `package.json` | Remove `@microsoft/fetch-event-source` and `react-native-sse` dependencies |

---

### Task 1: Add `focusManager` bridge to `_layout.tsx`

**Files:**
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Add AppState focus manager**

Add these imports:
```typescript
import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import type { AppStateStatus } from 'react-native'
import { focusManager } from '@tanstack/react-query'
```

Add the `AppStateHandler` component before `RootLayout`:
```typescript
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

function AppStateHandler() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  return null
}
```

Add `<AppStateHandler />` inside `QueryClientProvider`:
```typescript
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateHandler />
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

- [ ] **Step 2: Commit**

```bash
git add src/app/_layout.tsx
git commit -m "feat: add focusManager bridge for React Query refetchOnWindowFocus"
```

---

### Task 2: Add polling options to `useOrderDetail`

**Files:**
- Modify: `src/hooks/api/useOrderDetail.ts`

- [ ] **Step 1: Add `refetchInterval` and `refetchOnWindowFocus`**

Update the hook:
```typescript
import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/client'
import type { OrderDetailResponse } from '@/types/api'

export function useOrderDetail() {
  return useQuery<OrderDetailResponse>({
    queryKey: ['orderDetail'],
    queryFn: ({ signal }) => getOrderDetail(signal),
    staleTime: 0,
    refetchInterval: 8000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}
```

Note: Changed `staleTime: Infinity` to `staleTime: 0` so data is always considered stale and refetches on interval.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/api/useOrderDetail.ts
git commit -m "feat: add 8s polling and refetchOnWindowFocus to useOrderDetail"
```

---

### Task 3: Update `order.tsx` to remove SSE

**Files:**
- Modify: `src/app/order.tsx`

- [ ] **Step 1: Remove SSE-related imports**

Remove these lines:
```typescript
import { useOrderStream } from '@/hooks/api/useOrderStream'
import { useReconnectFallback } from '@/hooks/api/useReconnectFallback'
```

- [ ] **Step 2: Simplify hook calls in `OrderScreen`**

Replace:
```typescript
const { data: orderData, isLoading: orderLoading, error: orderError, refetch } = useOrderDetail()
const stream = useOrderStream()
const reconnectFallback = useReconnectFallback(stream.reconnectFailed, refetch)
```

With:
```typescript
const { data: orderData, isLoading: orderLoading, error: orderError } = useOrderDetail()
```

- [ ] **Step 3: Remove SSE-related effects**

Remove this entire effect block:
```typescript
useEffect(() => {
  if (stream.orderClosed || stream.sessionEnded) {
    if (hasNavigated.current) return
    hasNavigated.current = true
    removeToken().then(() => {
      router.replace('/thank-you')
    })
  }
}, [stream.orderClosed, stream.sessionEnded, removeToken, router])

useEffect(() => {
  if (hasNavigated.current) return

  if (reconnectFallback.authError) {
    hasNavigated.current = true
    removeToken().then(() => {
      router.replace('/')
    })
    return
  }

  if (reconnectFallback.checkingStatus) {
    return
  }

  const status = reconnectFallback.orderStatus
  if (!status) return

  if (status === 'CLOSED' || status === 'PAID') {
    hasNavigated.current = true
    removeToken().then(() => {
      router.replace('/thank-you')
    })
  } else if (status === 'CANCELLED') {
    hasNavigated.current = true
    removeToken().then(() => {
      router.replace('/')
    })
  }
}, [reconnectFallback.authError, reconnectFallback.checkingStatus, reconnectFallback.orderStatus, removeToken, router])
```

- [ ] **Step 4: Remove reconnectFallback loading state**

Remove this block from the render:
```typescript
if (reconnectFallback.checkingStatus) {
  return <LoadingState fullScreen message="Reconectando..." />
}
```

- [ ] **Step 5: Remove `hasNavigated` ref** (no longer needed)

Remove:
```typescript
const hasNavigated = useRef(false)
```

- [ ] **Step 6: Remove unused imports**

Remove `useRef` from the React import:
```typescript
import { useCallback, useEffect, useMemo, useState } from 'react'
```

- [ ] **Step 7: Commit**

```bash
git add src/app/order.tsx
git commit -m "refactor: remove SSE hooks and effects from order screen"
```

---

### Task 4: Delete SSE-related files

**Files:**
- Delete: `src/hooks/api/useOrderStream.ts`
- Delete: `src/hooks/api/useReconnectFallback.ts`
- Delete: `src/components/order/ConnectionStatus.tsx`
- Delete: `src/services/sse/client.ts`

- [ ] **Step 1: Remove files**

```bash
rm src/hooks/api/useOrderStream.ts
rm src/hooks/api/useReconnectFallback.ts
rm src/components/order/ConnectionStatus.tsx
rm src/services/sse/client.ts
```

- [ ] **Step 2: Remove empty sse directory if exists**

```bash
rmdir src/services/sse 2>/dev/null || true
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove SSE-related files"
```

---

### Task 5: Clean up API constants and types

**Files:**
- Modify: `src/constants/api.ts`
- Modify: `src/types/api.ts`

- [ ] **Step 1: Remove `orderStream` endpoint from constants**

In `src/constants/api.ts`, remove this line:
```typescript
orderStream: '/stream',
```

Result:
```typescript
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://pos.eliancho.dev/api/mobile'

export const ENDPOINTS = {
  joinTable: '/auth/join',
  logout: '/auth/logout',
  tableStatus: (id: string) => `/tables/${id}/status`,
  orderDetail: '/orders/order-detail',
  orderItemStatuses: '/orders/order-item-statuses',
} as const
```

- [ ] **Step 2: Remove SSE types from `src/types/api.ts`**

Search for and remove these types/exports:
- `StreamOrderItem` interface
- `OrderStreamEvent` interface/type
- `STEAM_EVENT_TYPE_LIST` constant

- [ ] **Step 3: Commit**

```bash
git add src/constants/api.ts src/types/api.ts
git commit -m "chore: remove SSE endpoints and types"
```

---

### Task 6: Remove SSE dependencies from package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove SSE dependencies**

Remove these lines from `dependencies`:
```json
"@microsoft/fetch-event-source": "^2.0.1",
"react-native-sse": "^1.2.1",
```

- [ ] **Step 2: Run npm install to update lockfile**

```bash
npm install
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: remove SSE dependencies"
```

---

### Task 7: Run lint and verify

- [ ] **Step 1: Run ESLint**

```bash
npm run lint
```

Expected: No errors. If there are unused import warnings, fix them.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: address lint/type errors from SSE removal"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Polling every 8 seconds → `useOrderDetail` with `refetchInterval: 8000`
- ✅ Background pause/focus resume → `focusManager` bridge + `refetchOnWindowFocus: true`
- ✅ Remove SSE hook → deleted `useOrderStream.ts`
- ✅ Remove `ConnectionStatus` → deleted component
- ✅ Remove `useReconnectFallback` → deleted hook and all usage
- ✅ Remove SSE dependencies → removed from package.json
- ✅ Clean up types/constants → removed SSE-related exports

**2. Placeholder scan:** No TBDs, TODOs, or vague instructions found.

**3. Type consistency:**
- `useOrderDetail` returns same shape (`data`, `isLoading`, `error`) — no breaking changes for consumers
- `order.tsx` uses `orderData?.data?.order?.items` consistently with existing `OrderDetailResponse` type
- All removed types (`StreamOrderItem`, `OrderStreamEvent`, `STEAM_EVENT_TYPE_LIST`) are SSE-only and not referenced elsewhere
