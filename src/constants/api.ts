export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://pos.eliancho.dev/api/mobile'
export const POS_BASE_URL = process.env.EXPO_PUBLIC_POS_BASE_URL ?? 'https://pos.eliancho.dev'

const DEFAULT_QR_HOSTS = 'pos.eliancho.dev,192.168.1.17:3000'
export const QR_ALLOWED_HOSTS = (process.env.EXPO_PUBLIC_QR_ALLOWED_HOSTS ?? DEFAULT_QR_HOSTS)
  .split(',')
  .map((h) => h.trim())
  .filter(Boolean)

export const ENDPOINTS = {
  joinTable: '/auth/join',
  logout: '/auth/logout',
  tableStatus: (id: string) => `/tables/${id}/status`,
  orderDetail: '/orders/order-detail',
  orderItemStatuses: '/orders/order-item-statuses',
  deviceOrders: '/orders/device-orders',
  deviceOrderDetail: '/orders/device-order-detail',
} as const
