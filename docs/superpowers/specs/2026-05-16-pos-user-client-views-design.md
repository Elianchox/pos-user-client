# POS User Client — Main Views Design

**Date:** 2026-05-16
**Scope:** Implement the main user-facing views (welcome, QR scan, order detail, thank-you) and improve existing custom hooks for SSE integration, session persistence, and deep-link handling.
**Approach:** Structured (B)

---

## 1. Context

The project is an Expo 55 + React Native 0.83 app using expo-router, NativeWind v4, and `@tanstack/react-query`. It already has:

- API layer: `constants/api.ts` → `types/api.ts` → `services/api/endpoints.ts` → `hooks/api/*.ts`
- SSE client via `@microsoft/fetch-event-source`
- Session persistence in AsyncStorage (`mobile_session_token`, `mobile_table_id`)
- `SessionContext` and `ThemeContext` providers wired in `_layout.tsx`
- A minimal `HomeScreen` placeholder

The goal is to wire these pieces into a complete user flow: welcome → QR scan → order detail with real-time updates → session cleanup on close.

---

## 2. Flow Overview

```
[Deep link /]
       │
       ▼
┌─────────────────────┐
│  / (WelcomeScreen)  │───► "Scan QR" button ───► /scan
│                     │
│  If session exists  │───► redirect to /order
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│  /scan (ScanScreen) │───► expo-camera QR scan
│                     │───► parse tableId from URL
│  If no token        │───► show name input + call joinTable
│                     │───► redirect to /order
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ /order (OrderScreen)│───► useOrderDetail + useOrderStream
│                     │───► grouped accordion items
│                     │───► SSE connection indicator
│                     │───► on order_closed / session.ended
│                     │     → clear storage → /thank-you
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│/thank-you (Thanks)  │───► "Scan another table" → /
└─────────────────────┘
```

---

## 3. File Structure

```
src/
  app/
    _layout.tsx
    index.tsx              → WelcomeScreen
    scan.tsx               → ScanScreen
    order.tsx              → OrderScreen
    thank-you.tsx          → ThankYouScreen

  hooks/
    api/
      useJoinTable.ts      ← improve: persist tableId
      useOrderDetail.ts    ← improve: tipado, staleTime
      useOrderStream.ts    ← improve: write to queryClient cache
      useOrderItemStatuses.ts ← improve
      useLogout.ts         ← improve: redirect on success
      useSessionRestore.ts ← NEW
    useDeepLink.ts         ← NEW

  components/
    ui/
      LoadingState.tsx     ← NEW
      ErrorState.tsx       ← NEW
      EmptyState.tsx       ← NEW
    order/
      OrderItemGroup.tsx   ← NEW (accordion)
      OrderItemRow.tsx     ← NEW
      StatusBadge.tsx      ← NEW
      ConnectionStatus.tsx ← NEW
      OrderHeader.tsx      ← NEW

  utils/
    qr.ts                  ← NEW (URL parser)
    status.ts              ← NEW (status labels/colors map)
```

---

## 4. Detailed Design

### 4.1 Deep Link & QR Format

The QR code contains a URL like:
```
https://pos.eliancho.dev/deeplink/table/{tableId}
```

Both the in-app camera scanner and external deep-link handler must extract `{tableId}`.

`utils/qr.ts`:
- `parseQrUrl(url: string): { tableId: string } | null`
- Supports the production domain path `/deeplink/table/:id`
- Rejects malformed URLs gracefully (returns null)

### 4.2 Session Restoration

`hooks/api/useSessionRestore.ts`:
- On mount, reads AsyncStorage for `token` + `tableId`.
- If both exist, calls `getOrderDetail` to validate the session is still active.
- If active: redirect to `/order`.
- If inactive (401 / no active order): clear storage, stay on `/`.
- Returns `{ isRestoring: boolean }` so the UI can show a splash/loading overlay.

This hook is used inside `_layout.tsx` (or `index.tsx`) **after** providers are ready.

### 4.3 Welcome Screen (`/`)

- Full-screen centered layout.
- Brand/app name.
- Subtitle: "Escanea el QR de tu mesa para ver tu orden en tiempo real."
- Primary CTA: large button "Escanear QR" → pushes `/scan`.
- If `isRestoring === true`: show `<LoadingState fullScreen />`.
- No bottom tabs. Single stack.

### 4.4 Scan Screen (`/scan`)

- Uses `expo-camera` (`CameraView` with `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`).
- On scan:
  1. Parse URL with `parseQrUrl`.
  2. If invalid → show toast/error inline, keep scanning.
  3. If valid:
     - Check if token exists (session already active).
     - If token exists → just save the new `tableId` (or validate it) → redirect `/order`.
     - If no token → show a modal/bottom sheet asking for `customerName` (optional) → call `useJoinTable` mutation.
     - On join success → save token + tableId → redirect `/order`.
- Back button to return to `/`.

### 4.5 Order Screen (`/order`)

#### Data layer
- `useOrderDetail()` fetches the current order.
- `useOrderStream(orderId)` subscribes to SSE.
- `useOrderItemStatuses()` fetches the dictionary of labels/colors for items.

#### SSE → Cache integration
`useOrderStream` is improved to accept a `queryClient` instance and call `queryClient.setQueryData(['orderDetail'], updater)` when receiving `order.item_added`, `order.item_served`, etc. This keeps the UI reactive without manual refetch.

On `order.order_closed` or `session.ended`:
- Set a small piece of local state (`isClosing`) to render a modal.
- After a short delay (or immediately), call `removeToken()` + `clearAll()` and redirect to `/thank-you`.

#### Visual layout
- Header:
  - Table name (from `useTableStatus` or cached).
  - Connection status dot (`ConnectionStatus`).
  - Total order amount (computed from items).
- Body (scroll):
  - If loading → `<LoadingState />`.
  - If error → `<ErrorState onRetry={refetch} />`.
  - If empty → `<EmptyState message="Aún no hay productos en tu orden" />`.
  - If items → grouped list.

#### Grouping logic (inside `OrderScreen` or `useOrderItems`)
```ts
const groups = useMemo(() => {
  const map = new Map<string, OrderItem[]>()
  items.forEach((item) => {
    map.set(item.productId, [...(map.get(item.productId) || []), item])
  })
  return Array.from(map.entries()).map(([productId, items]) => ({
    productId,
    productName: items[0].productName,
    imageUrl: items[0].imageUrl,
    price: items[0].price,
    count: items.length,
    items,
  }))
}, [items])
```

#### Accordion (`OrderItemGroup`)
- Animated expand/collapse with `react-native-reanimated` (already in deps).
- Header row:
  - Thumbnail (`expo-image`, `contentFit="cover"`).
  - Name + `x{count}`.
  - Price total (`price * count`).
  - Majority status badge (most frequent status in group).
- Expanded body:
  - List of `OrderItemRow`.
  - Each row: `#1`, `status badge`, mini price.

#### Status mapping
`utils/status.ts` exports:
- `ORDER_ITEM_STATUS_LABELS: Record<string, string>`
- `ORDER_ITEM_STATUS_COLORS: Record<string, { bg: string; text: string }>`
These mirror the server-side constants (PENDING, SENT_TO_KITCHEN, PREPARING, READY, SERVED, CANCELLED) so the UI has stable labels and Tailwind color classes without querying the server for them every time.

> **Important:** NativeWind v4 + TailwindCSS v4 generates CSS at build time. Dynamic class concatenation like `bg-${color}` will **not** work. The color map must store complete literal class strings (e.g., `{ bg: 'bg-yellow-500', text: 'text-white' }`) so Tailwind can scan them.

The endpoint `/orders/order-item-statuses` is kept as a fallback/enrichment but the primary mapping is static in the client to avoid layout shift while loading.

### 4.6 Thank You Screen (`/thank-you`)

- Centered illustration/icon + "Gracias por tu visita".
- Subtitle: "Tu mesa ha sido cerrada."
- Primary CTA: "Escanear otra mesa" → `router.replace('/')`.
- No back navigation (stack reset).

### 4.7 UI States (reusable components)

`LoadingState`: spinner (`ActivityIndicator`) + optional text, centered, full-screen or inline via prop.

`ErrorState`: icon + message + retry button. Accepts `onRetry` callback.

`EmptyState`: icon + message. Used when order has no items.

`StatusBadge`: small pill/chip with dynamic background/text color classes based on status value.

`ConnectionStatus`: small dot or text pill in the header. Green when `isConnected`, red when not, with subtle pulse animation.

---

## 5. Hook Improvements

### `useJoinTable`
- Also call `saveTableId(body.tableId)` on success (in addition to `saveToken`).
- Accept `signal` in the mutation payload.

### `useOrderDetail`
- Add `staleTime: Infinity` (data is kept fresh via SSE, not polling).
- Add `retry: false` on 401 to let `useSessionRestore` handle redirect.
- Stronger return typing.

### `useOrderStream`
- Use `useQueryClient()` internally to update `['orderDetail']` cache on relevant SSE events, instead of only keeping local state.
- Keep local state only for transient UI (connection status, last event timestamp).
- Reset state correctly on `orderId` change without leaking listeners.

### `useSessionRestore`
- Encapsulate the "read storage → validate → redirect" flow.
- Exported as a standalone hook so any screen can call it if needed.

---

## 6. Error Handling & Edge Cases

| Scenario | Behavior |
|----------|----------|
| User scans invalid QR | Inline error, camera keeps active |
| User scans QR while already in session | Re-use token, update tableId, redirect to `/order` |
| joinTable fails (404/500) | Show `ErrorState` with retry |
| SSE disconnects | Show red dot in header; auto-reconnect handled by `fetch-event-source` |
| SSE receives `session.ended` | Clear storage, redirect `/thank-you` |
| App killed & reopened with valid session | `useSessionRestore` redirects to `/order` and reconnects SSE |
| App killed & reopened with expired token | Clear storage, stay on `/` |
| `useOrderDetail` 401 | Logout + redirect `/` |
| Tablet layout | Use `max-w-2xl mx-auto` and responsive padding; same components |

---

## 7. Performance Considerations

- `useMemo` for item grouping.
- `React.memo` on `OrderItemRow` and `OrderItemGroup`.
- `expo-image` for thumbnails (caching, content-fit).
- `staleTime: Infinity` on `useOrderDetail` to prevent background refetch.
- SSE cache writes prevent full re-renders on every event.
- AbortSignal propagated to all `apiFetch` calls.

---

## 8. Dependencies to Add

- `expo-camera` (for QR scanning)
- `@gorhom/bottom-sheet` or simple modal for name input during join (optional — can use inline overlay to avoid new dep)

No other new runtime dependencies expected.

---

## 9. Out of Scope (YAGNI)

- Bottom tab navigation (only one main screen post-login).
- Calling a waiter / chat features.
- Menu browsing / adding items from the app (read-only order view).
- Payment processing UI.
- Push notifications.
- Offline mode / local queueing.

---

## 10. Acceptance Criteria

- [ ] User opens app → sees welcome screen.
- [ ] Tapping "Escanear QR" opens camera and scans a QR.
- [ ] Scanning `https://pos.eliancho.dev/deeplink/table/123` extracts `123` and joins the table.
- [ ] Order screen shows items grouped by product in accordions.
- [ ] Each item shows correct status badge with color.
- [ ] SSE updates reflect immediately without manual pull-to-refresh.
- [ ] Connection status indicator is visible in the header.
- [ ] Closing and reopening the app restores the session and reconnects SSE.
- [ ] When the order is closed from the server, app clears session and shows thank-you screen.
- [ ] Deep link from external camera opens app and routes to the correct table.
- [ ] Layout renders correctly on phone and tablet.
