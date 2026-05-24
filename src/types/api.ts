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
  pushToken?: string | null
  deviceId: string
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


export enum OrderItemStatusEnum {
  PENDING = 'PENDING',
  SENT_TO_KITCHEN = 'SENT_TO_KITCHEN',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

export enum OrderStatusEnum {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
}

export const ORDER_ITEM_STATUS = Object.values(OrderItemStatusEnum)
export type OrderItemStatusType = typeof ORDER_ITEM_STATUS[number];
export type OrderStatus = `${OrderStatusEnum}`

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
  status: OrderItemStatusType
}

export interface OrderDetailOrder {
  orderId: string
  status: OrderStatus
  items: OrderItem[]
  totalAmount: string
}

export interface OrderDetailResponse {
  success: boolean
  data: { table: TableStatus; order: OrderDetailOrder | null }
}

export interface OrderItemStatus {
  value: OrderItemStatusType
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

export interface DeviceOrderItem {
  orderId: string
  businessName: string
  tableName: string
  status: string
  totalAmount: string
  itemCount: number
  createdAt: string
}

export interface DeviceOrderDetailItem {
  itemId: string
  productName: string
  unitPrice: string
  status: string
  notes: string | null
}

export interface DeviceOrderDetail {
  orderId: string
  businessName: string
  tableName: string
  status: string
  notes: string | null
  items: DeviceOrderDetailItem[]
  totalAmount: string
  createdAt: string
}

export interface DeviceOrdersResponse {
  success: boolean
  data: DeviceOrderItem[]
}

export interface DeviceOrderDetailResponse {
  success: boolean
  data: DeviceOrderDetail
}
