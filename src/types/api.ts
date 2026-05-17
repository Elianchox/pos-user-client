export interface MobileSession {
  id: string
  tableId: string
  businessId: string
  customerName: string | null
  joinedAt: string
  expiresAt: string
  isActive: boolean
}

export interface JoinTableRequest {
  tableId: string
  customerName?: string | null
}

export interface JoinTableResponse {
  success: boolean
  data: {
    token: string
    expiresAt: string
    session: MobileSession
    table: TableStatus
  }
}


export enum OrderStatusEnum {
  PENDING = 'PENDING',
  SENT_TO_KITCHEN = 'SENT_TO_KITCHEN',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}
export const ORDER_ITEM_STATUS = Object.values(OrderStatusEnum)
export type OrderItemStatusType = typeof ORDER_ITEM_STATUS[number];

export interface TableStatus {
  id: string
  name: string
  capacity: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'
  zone: { id: string; name: string } | null
}

export interface OrderItem {
  itemId: string
  productId: string
  productName: string
  price: string
  imageUrl: string | null
  status: string
}

export interface StreamOrderItem {
  itemId: string
  productId: string
  productName: string
  price: string
  imageUrl: string | null
}

export interface OrderDetailOrder {
  orderId: string
  status: string
  items: OrderItem[]
}

export interface OrderDetailResponse {
  success: boolean
  data: { table: TableStatus; order: OrderDetailOrder | null }
}

export interface OrderItemStatus {
  value: string
  label: string
}

export interface OrderItemStatusesResponse {
  success: boolean
  data: { statuses: OrderItemStatus[] }
}

export interface LogoutResponse {
  success: boolean
  data: { message: string }
}

export enum OrderStreamEventEnum  {
  Connected = 'connected',
  Heartbeat = 'heartbeat',
  ItemAdded = 'order.item_added',
  ItemSentToKitchen = 'order.item_sent_to_kitchen',
  ItemReady = 'order.item_ready',
  ItemServed = 'order.item_served',
  ItemCancelled = 'order.item_cancelled',
  PaymentReceived = 'order.payment_received',
  OrderClosed = 'order.order_closed',
  SessionEnded = 'session.ended',
}

export const STEAM_EVENT_TYPE_LIST = Object.values(OrderStreamEventEnum)

export type OrderStreamEventType = `${OrderStreamEventEnum}`

export interface ItemAddedData {
  items: StreamOrderItem[]
}

export interface ConnectedData {
  table: TableStatus
  activeOrder: OrderDetailOrder | null
  message: string
}

export interface ItemSentToKitchenData {
  itemIds: string[]
  stations: string[]
}

export interface ItemStatusData {
  itemId: string
  productName?: string
  status?: string
}

export interface ItemCancelledData extends ItemStatusData {
  reason?: string
}

export interface PaymentReceivedData {
  paymentId: string
  amount: number
  method: string
}

export interface OrderClosedData {
  orderId: string
}

export interface SessionEndedData {
  reason: string
  tableId: string
  message: string
}

export type OrderStreamEvent = {
  event: OrderStreamEventEnum.Connected
  data: ConnectedData
} | {
  event: OrderStreamEventEnum.Heartbeat
  data: Record<string, never>
} | {
  event: OrderStreamEventEnum.ItemAdded
  data: ItemAddedData
} | {
  event: OrderStreamEventEnum.ItemSentToKitchen
  data: ItemSentToKitchenData
} | {
  event: OrderStreamEventEnum.ItemReady
  data: ItemStatusData
} | {
  event: OrderStreamEventEnum.ItemServed
  data: ItemStatusData
} | {
  event: OrderStreamEventEnum.ItemCancelled
  data: ItemCancelledData
} | {
  event: OrderStreamEventEnum.PaymentReceived
  data: PaymentReceivedData
} | {
  event: OrderStreamEventEnum.OrderClosed
  data: OrderClosedData
} | {
  event: OrderStreamEventEnum.SessionEnded
  data: SessionEndedData
}
