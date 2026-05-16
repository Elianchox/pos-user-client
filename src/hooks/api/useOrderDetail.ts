import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/services/api/endpoints'
import { ApiError } from '@/services/api/client'
import type { OrderDetailResponse } from '@/types/api'

export function useOrderDetail() {
  return useQuery<OrderDetailResponse>({
    queryKey: ['orderDetail'],
    queryFn: ({ signal }) => getOrderDetail(signal),
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}
