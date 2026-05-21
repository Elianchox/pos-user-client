export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://pos.eliancho.dev/api/mobile'

export const ENDPOINTS = {
  joinTable: '/auth/join',
  logout: '/auth/logout',
  tableStatus: (id: string) => `/tables/${id}/status`,
  orderDetail: '/orders/order-detail',
  orderItemStatuses: '/orders/order-item-statuses',
} as const
