# Reconnect Fallback with Order-Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When SSE reconnection fails twice, call `/orders/order-detail` endpoint and navigate based on order status (CLOSED/PAID → thank-you, CANCELLED → scan QR, OPEN → stay with loading).

**Architecture:** Create `useReconnectFallback` hook that observes `reconnectFailed` from `useOrderStream`, calls `useOrderDetail.refetch()`, and returns status info. `order.tsx` orchestrates navigation based on returned states.

**Tech Stack:** TypeScript, React Query v5, expo-router, React Native

---

### File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/types/api.ts` | Modify | Update `OrderStatusEnum` with all states |
| `src/hooks/api/useReconnectFallback.ts` | **Create** | Hook that calls `/order-detail` when reconnect fails |
| `src/app/order.tsx` | Modify | Update navigation logic to use new hook |

---

### Task 1: Update OrderStatusEnum with all order states

**Files:**
- Modify: `src/types/api.ts:27-34`

- [ ] **Step 1: Update OrderStatusEnum**

Replace the existing enum at `src/types/api.ts:27-34`:

```typescript
export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  SENT_TO_KITCHEN = 'SENT_TO_KITCHEN',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
}
```

- [ ] **Step 2: Add OrderStatus type export**

Add after the enum (around line 36):

```typescript
export type OrderStatus = `${OrderStatusEnum}`
```

- [ ] **Step 3: Verify no TypeScript errors**

Check editor for any type errors. The existing code uses `string` for order status, so this is additive.

---

### Task 2: Create useReconnectFallback hook

**Files:**
- Create: `src/hooks/api/useReconnectFallback.ts`

- [ ] **Step 1: Create the hook file**

```typescript
import { useOrderDetail } from './useOrderDetail'
import { ApiError } from '@/services/api/client'
import { useEffect, useState } from 'react'

export interface ReconnectFallbackState {
  checkingStatus: boolean
  orderStatus: string | null
  authError: boolean
}

export function useReconnectFallback(reconnectFailed: boolean) {
  const { refetch, data } = useOrderDetail()
  const [state, setState] = useState<ReconnectFallbackState>({
    checkingStatus: false,
    orderStatus: null,
    authError: false,
  })

  useEffect(() => {
    if (!reconnectFailed) {
      setState({ checkingStatus: false, orderStatus: null, authError: false })
      return
    }

    let isActive = true

    async function checkOrderStatus() {
      setState({ checkingStatus: true, orderStatus: null, authError: false })

      try {
        const result = await refetch()

        if (!isActive) return

        if (result.error instanceof ApiError && result.error.status === 401) {
          setState({ checkingStatus: false, orderStatus: null, authError: true })
          return
        }

        if (result.data?.data?.order?.status) {
          setState({
            checkingStatus: false,
            orderStatus: result.data.data.order.status,
            authError: false,
          })
        } else {
          // No order found → treat as cancelled
          setState({ checkingStatus: false, orderStatus: 'CANCELLED', authError: false })
        }
      } catch {
        if (!isActive) return
        setState({ checkingStatus: false, orderStatus: null, authError: true })
      }
    }

    checkOrderStatus()

    return () => {
      isActive = false
    }
  }, [reconnectFailed, refetch])

  return state
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Check that imports resolve correctly and types match.

---

### Task 3: Update order.tsx navigation logic

**Files:**
- Modify: `src/app/order.tsx`

- [ ] **Step 1: Add import for useReconnectFallback**

Add after line 10:

```typescript
import { useReconnectFallback } from '@/hooks/api/useReconnectFallback'
```

- [ ] **Step 2: Add useReconnectFallback call**

After line 77 (`const stream = useOrderStream()`), add:

```typescript
const reconnectFallback = useReconnectFallback(stream.reconnectFailed)
```

- [ ] **Step 3: Replace reconnectFailed useEffect**

Replace lines 133-139:

```typescript
  useEffect(() => {
    if (stream.reconnectFailed) {
      removeToken().then(() => {
        router.replace('/')
      })
    }
  }, [stream.reconnectFailed, removeToken, router])
```

With:

```typescript
  useEffect(() => {
    if (reconnectFallback.authError) {
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
      removeToken().then(() => {
        router.replace('/thank-you')
      })
    } else if (status === 'CANCELLED') {
      removeToken().then(() => {
        router.replace('/')
      })
    }
    // DRAFT, OPEN, IN_PROGRESS, PENDING_PAYMENT → stay on screen
  }, [reconnectFallback.authError, reconnectFallback.checkingStatus, reconnectFallback.orderStatus, removeToken, router])
```

- [ ] **Step 4: Add checkingStatus loading state**

Add after line 141 (after the `orderLoading` check):

```typescript
  if (reconnectFallback.checkingStatus) {
    return <LoadingState fullScreen message="Reconectando..." />
  }
```

- [ ] **Step 5: Verify complete file structure**

The final `order.tsx` should have:
- Imports at top (including `useReconnectFallback`)
- `useReconnectFallback` hook call after `useOrderStream`
- Three `useEffect` blocks:
  1. `stream.orderClosed || stream.sessionEnded` → `/thank-you`
  2. `reconnectFallback` → navigate based on status
  3. (existing ones remain unchanged)
- Loading states in order: `orderLoading`, `reconnectFallback.checkingStatus`, `orderError`
- Main UI render

---

### Task 4: Test the implementation

**Files:**
- No new test files (no test runner in project)

- [ ] **Step 1: Run ESLint**

Run: `npm run lint`

Expected: No errors

- [ ] **Step 2: Manual test scenarios**

Test these scenarios in the app:

1. **Order CLOSED after reconnect fails:**
   - Start order, add items
   - Close order from admin side
   - Kill network or stop server to trigger SSE failure
   - Wait for 2 reconnect attempts to fail
   - Expected: Shows "Reconectando..." → redirects to `/thank-you`

2. **Order CANCELLED after reconnect fails:**
   - Start order, add items
   - Cancel order from admin side
   - Kill network or stop server
   - Wait for 2 reconnect attempts to fail
   - Expected: Shows "Reconectando..." → redirects to `/` (scan QR)

3. **Order still OPEN after reconnect fails:**
   - Start order, add items
   - Kill network or stop server
   - Wait for 2 reconnect attempts to fail
   - Expected: Shows "Reconectando..." → stays on order screen

4. **Session expired (401):**
   - Start order
   - Invalidate server-side session
   - Kill network or stop server
   - Wait for 2 reconnect attempts to fail
   - Expected: Shows "Reconectando..." → redirects to `/` (scan QR)

---

### Task 5: Commit changes

- [ ] **Step 1: Review all changes**

Run: `git diff`

Verify:
- `src/types/api.ts` has updated enum
- `src/hooks/api/useReconnectFallback.ts` is new file
- `src/app/order.tsx` has updated navigation logic

- [ ] **Step 2: Commit**

```bash
git add src/types/api.ts src/hooks/api/useReconnectFallback.ts src/app/order.tsx
git commit -m "feat: add reconnect fallback with order-detail endpoint

When SSE reconnection fails twice, call /order-detail to determine
navigation: CLOSED/PAID → thank-you, CANCELLED → scan QR,
OPEN → stay with loading, 401 → scan QR."
```

- [ ] **Step 3: Verify commit**

Run: `git log -1 --stat`

Expected: Shows 3 files changed
