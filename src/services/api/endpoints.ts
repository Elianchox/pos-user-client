import { ENDPOINTS } from '@/constants/api'
import type {
  JoinTableRequest,
  JoinTableResponse,
  LogoutResponse,
  OrderDetailResponse,
  OrderItemStatusesResponse,
  TableStatus,
} from '@/types/api'
import { apiFetch } from './client'

export function joinTable(body: JoinTableRequest, signal?: AbortSignal) {
  return apiFetch<JoinTableResponse>(ENDPOINTS.joinTable, { method: 'POST', body }, signal)
}

export function logout(signal?: AbortSignal) {
  return apiFetch<LogoutResponse>(ENDPOINTS.logout, { method: 'POST' }, signal)
}

export function getTableStatus(tableId: string, signal?: AbortSignal) {
  return apiFetch<{ success: boolean; data: TableStatus }>(
    ENDPOINTS.tableStatus(tableId),
    { method: 'GET' },
    signal,
  )
}

export function getOrderDetail(signal?: AbortSignal) {
  return apiFetch<OrderDetailResponse>(ENDPOINTS.orderDetail, { method: 'GET' }, signal)
}

export function getOrderItemStatuses(signal?: AbortSignal) {
  return apiFetch<OrderItemStatusesResponse>(ENDPOINTS.orderItemStatuses, { method: 'GET' }, signal)
}
