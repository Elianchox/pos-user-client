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

export interface OrderDetailResponse {
  success: boolean
  data: { orderId?: string; items: OrderItem[] }
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

export type OrderStreamEventType =
  | 'order.item_added'
  | 'order.item_sent_to_kitchen'
  | 'order.item_ready'
  | 'order.item_served'
  | 'order.item_cancelled'
  | 'order.payment_received'
  | 'order.order_closed'
  | 'session.ended'
  | 'heartbeat'

export interface OrderStreamEvent {
  event: OrderStreamEventType
  data: Record<string, unknown>
}
