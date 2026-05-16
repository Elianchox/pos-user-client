import { useQuery } from '@tanstack/react-query'
import { getOrderItemStatuses } from '@/services/api/endpoints'
import type { OrderItemStatusesResponse } from '@/types/api'

export function useOrderItemStatuses() {
  return useQuery<OrderItemStatusesResponse>({
    queryKey: ['orderItemStatuses'],
    queryFn: ({ signal }) => getOrderItemStatuses(signal),
    staleTime: Infinity,
  })
}
