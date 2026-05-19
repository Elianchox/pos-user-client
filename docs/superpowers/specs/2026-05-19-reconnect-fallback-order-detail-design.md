# Reconnect Fallback with Order-Detail Endpoint

## Problem

When SSE connection fails after 2 reconnect attempts, the app redirects to home (`/`) without checking the actual order state. The `/api/mobile/orders/order-detail` endpoint now provides order status information that should drive navigation decisions.

## Changes

### 1. Update Order Status Enum (`src/types/api.ts`)

Add all order states: `DRAFT`, `OPEN`, `IN_PROGRESS`, `PENDING_PAYMENT`, `PAID`, `CANCELLED`, `CLOSED`

### 2. Create `useReconnectFallback` hook (`src/hooks/api/useReconnectFallback.ts`)

**Purpose:** Observe `reconnectFailed` flag and call `/order-detail` to determine navigation.

**Returns:**
```typescript
{
  checkingStatus: boolean  // true while fetching
  orderStatus: OrderStatus | null
  authError: boolean       // true if 401
}
```

**Logic:**
- When `reconnectFailed` becomes `true` → call `refetch()` on `useOrderDetail`
- Parse `order.status` from response
- If 401 error → `authError = true`
- If response success → `orderStatus = response.data.order?.status`

### 3. Update `order.tsx` navigation logic

**Current behavior:**
```typescript
if (stream.reconnectFailed) {
  removeToken().then(() => router.replace('/'))
}
```

**New behavior:**
```typescript
const { checkingStatus, orderStatus, authError } = useReconnectFallback(stream.reconnectFailed)

// CLOSED or PAID → /thank-you
// CANCELLED → / (scan QR)
// DRAFT, OPEN, IN_PROGRESS, PENDING_PAYMENT → stay on order screen
// authError (401) → / (session expired)
```

### 4. Show "Reconectando..." loading state

When `checkingStatus === true`, show full-screen loading with message "Reconectando..."

## Navigation Matrix

| Order Status | Action |
|---|---|
| `DRAFT`, `OPEN`, `IN_PROGRESS`, `PENDING_PAYMENT` | Stay on order screen, show "Reconectando..." |
| `CLOSED`, `PAID` | `router.replace('/thank-you')` |
| `CANCELLED` | `router.replace('/')` |
| `null` (no order) | `router.replace('/')` |
| 401 error | `router.replace('/')` |

## Files Modified

1. `src/types/api.ts` - Update `OrderStatusEnum`
2. `src/hooks/api/useReconnectFallback.ts` - **NEW** hook
3. `src/app/order.tsx` - Update navigation logic
4. `src/components/ui/LoadingState.tsx` - Verify exists (reuse for "Reconectando...")

## Architecture

```
useOrderStream          → SSE connection only
useReconnectFallback    → Calls /order-detail when reconnectFailed
order.tsx               → Orchestrates navigation based on states
```
