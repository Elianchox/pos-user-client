# Spec: Adapt Backend API Changes (SSE v2)

## Context

El backend actualizó el endpoint SSE y los payloads de eventos. El cliente móvil debe adaptarse para seguir funcionando.

## Changes Summary

### 1. Endpoint SSE

| Before | After |
|--------|-------|
| `GET /orders/{orderId}/stream` | `GET /stream` |
| Requires `orderId` in URL | Identifies table via JWT only |

### 2. Event `connected` Payload

| Before | After |
|--------|-------|
| `{ orderId, status, table, message }` | `{ table, activeOrder: OrderDetailOrder \| null, message }` |

**Impact:** El evento inicial ahora entrega la orden completa (o `null` si no hay orden activa). Esto permite hidratar el estado sin llamar a `/orders/order-detail`.

### 3. Event `order.item_added` Payload

Items ya **no incluyen `status`**:

```json
{
  "items": [
    {
      "itemId": "...",
      "productId": "...",
      "productName": "...",
      "price": "...",
      "imageUrl": "..."
    }
  ]
}
```

**Rationale:** Un item recién agregado siempre empieza en estado `PENDING`. El frontend debe asignar este valor por defecto antes de insertar en el cache.

### 4. Events `order.item_ready` / `order.item_served`

| Event | Before | After |
|-------|--------|-------|
| `order.item_ready` | `{ itemId, productName, status }` | `{ itemId, productName }` |
| `order.item_served` | `{ itemId, productName, status }` | `{ itemId }` |

**Rationale:** El nombre del evento **es** el estado destino. El frontend debe inferir `status` del tipo de evento, no del payload.

### 5. `order.item_sent_to_kitchen` / `order.item_cancelled`

Se mantienen igual que antes.

## Architecture

**SSE becomes table-scoped:**
- `subscribeOrderStream()` ya no recibe `orderId`.
- Se conecta a `/stream` autenticado solo con JWT.
- El evento `connected` entrega `activeOrder` completo → se usa para inicializar/hidratar el cache de React Query (`['orderDetail']`).
- Eventos incrementales (`item_added`, `item_ready`, etc.) parchean el mismo cache.

**State inference:**
- Todos los eventos incrementales deben mapear `eventType → status` vía lookup table. El campo `status` ya no se lee del payload del evento.

## Data Types

### `StreamOrderItem` (new)

Para eventos SSE donde no viene `status`:

```ts
interface StreamOrderItem {
  itemId: string
  productId: string
  productName: string
  price: string
  imageUrl: string | null
}
```

### `ConnectedData` (updated)

```ts
interface ConnectedData {
  table: TableStatus
  activeOrder: OrderDetailOrder | null
  message: string
}
```

### `ItemAddedData` (updated)

```ts
interface ItemAddedData {
  items: StreamOrderItem[]
}
```

### `ItemStatusData` (updated)

```ts
interface ItemStatusData {
  itemId: string
  productName?: string
  status?: string  // optional, not sent by backend anymore
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/constants/api.ts` | `orderStream` from function `(id) => /orders/${id}/stream` to plain string `/stream` |
| `src/types/api.ts` | Add `StreamOrderItem`, update `ConnectedData`, `ItemAddedData`, make `ItemStatusData.status` optional |
| `src/services/sse/client.ts` | Remove `orderId` parameter, use `ENDPOINTS.orderStream` directly |
| `src/hooks/api/useOrderStream.ts` | Remove `orderId` arg, hydrate cache from `connected`, default `PENDING` for added items, infer status from event type |
| `src/app/order.tsx` | Remove `orderId` extraction, call `useOrderStream()` with no args |

## Behavior Details

### `connected` handler

```ts
if (activeOrder) {
  queryClient.setQueryData(['orderDetail'], {
    success: true,
    data: { table, order: activeOrder }
  })
} else {
  queryClient.setQueryData(['orderDetail'], {
    success: true,
    data: { table, order: null }
  })
}
```

### `order.item_added` handler

```ts
const added = event.data.items.map(item => ({
  ...item,
  status: 'PENDING'
}))
// merge into cache, avoiding duplicates
```

### `order.item_ready` / `order.item_served` handler

```ts
const statusMap = {
  'order.item_ready': 'READY',
  'order.item_served': 'SERVED',
  // ...
}
const status = statusMap[event.event]
// update item in cache by itemId
```

## Edge Cases

1. **Reconexión SSE:** El evento `connected` se vuelve a emitir. El handler debe sobreescribir el cache con la data más reciente del backend (incluyendo `activeOrder: null` si la orden se cerró entre medias).

2. **Orden cerrada:** Cuando `activeOrder` es `null`, la UI debe mostrar estado vacío (sin items).

3. **Items duplicados en `order.item_added`:** El handler debe filtrar por `itemId` antes de agregar al cache (ya implementado en el código actual).
