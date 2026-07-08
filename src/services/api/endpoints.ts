import { ENDPOINTS } from '@/constants/api';
import type {
  DeviceOrderDetailResponse,
  DeviceOrdersResponse,
  JoinTableRequest,
  JoinTableResponse,
  LogoutResponse,
  OrderDetailResponse,
  OrderItemStatusesResponse,
  TableStatus,
} from '@/types/api';
import { apiFetch } from './client';

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
  const response = apiFetch<OrderDetailResponse>(ENDPOINTS.orderDetail, { method: 'GET' }, signal)
  return response
}

export function getOrderItemStatuses(signal?: AbortSignal) {
  return apiFetch<OrderItemStatusesResponse>(ENDPOINTS.orderItemStatuses, { method: 'GET' }, signal)
}

export function getDeviceOrders(
  deviceId: string,
  params?: { page?: number; limit?: number; status?: string; search?: string },
  signal?: AbortSignal,
) {
  const queryParams = new URLSearchParams({ deviceId })
  if (params?.page) queryParams.set('page', String(params.page))
  if (params?.limit) queryParams.set('limit', String(params.limit))
  if (params?.status) queryParams.set('status', params.status)
  if (params?.search) queryParams.set('search', params.search)
  return apiFetch<DeviceOrdersResponse>(
    `${ENDPOINTS.deviceOrders}?${queryParams.toString()}`,
    { method: 'GET' },
    signal,
  )
}

export function getDeviceOrderDetail(id: string, signal?: AbortSignal) {
  return apiFetch<DeviceOrderDetailResponse>(
    `${ENDPOINTS.deviceOrderDetail}?id=${encodeURIComponent(id)}`,
    { method: 'GET' },
    signal,
  )
}
