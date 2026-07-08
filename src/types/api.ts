export interface MobileSession {
  id: string
  tableId: string
  businessId: string
  customerName: string | null
  joinedAt: string
  expiresAt: string
  isActive: boolean
}

export interface OrderItemTax {
  name: string
  percentage: number
  amount: string
}

export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID'

export interface InvoiceData {
  id: string
  status: InvoiceStatus
  subtotal: string
  taxAmount: string | null
  totalAmount: string
  fiscalNumber: string | null
  createdAt: string
}

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'TRANSFER'
  | 'QR_CODE'
  | 'GIFT_CARD'
  | 'CHECK'
  | 'WOMPI'
  | 'OTHER'

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'

export interface PaymentData {
  id: string
  method: PaymentMethod
  amount: string
  status: PaymentStatus
  processedAt: string | null
  createdAt: string
}

export interface CheckoutLink {
  id: string
  amount: number
  reference: string
  /** @deprecated Construir URL manualmente con POS_BASE_URL + invoiceId + reference */
  checkoutUrl: string
  expiresAt: string
}

export interface TaxBreakdownItem {
  name: string
  percentage: number
  amount: string
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
  unitPrice: string
  imageUrl: string | null
  status: OrderItemStatusType
  notes: string | null
  taxes: OrderItemTax[]
}

export interface OrderDetailOrder {
  orderId: string
  status: OrderStatus
  notes: string | null
  items: OrderItem[]
  totalAmount: string
  invoice: InvoiceData | null
  payments: PaymentData[]
  taxBreakdown: TaxBreakdownItem[]
  alreadyPaid: string
  remaining: string
  checkoutLinks?: CheckoutLink[]
  createdAt: string
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
  invoiceStatus: string | null
  totalAmount: string
  itemCount: number
  createdAt: string
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DeviceOrderDetailItem {
  itemId: string
  productName: string
  unitPrice: string
  status: OrderItemStatusType
  notes: string | null
  taxes: OrderItemTax[]
}

export interface DeviceOrderDetail {
  orderId: string
  businessName: string
  tableName: string
  status: string
  notes: string | null
  items: DeviceOrderDetailItem[]
  totalAmount: string
  invoice: InvoiceData | null
  payments: PaymentData[]
  taxBreakdown: TaxBreakdownItem[]
  alreadyPaid: string
  remaining: string
  checkoutLinks?: CheckoutLink[]
  createdAt: string
}

export interface DeviceOrdersResponse {
  success: boolean
  data: DeviceOrderItem[]
  pagination: PaginationMeta
}

export interface DeviceOrderDetailResponse {
  success: boolean
  data: DeviceOrderDetail
}
