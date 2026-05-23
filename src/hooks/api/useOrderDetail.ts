import { ApiError } from '@/services/api/client'
import { getOrderDetail } from '@/services/api/endpoints'
import type { OrderDetailResponse } from '@/types/api'
import { useQuery } from '@tanstack/react-query'

export function useOrderDetail() {
  return useQuery<OrderDetailResponse>({
    queryKey: ['orderDetail'],
    queryFn: ({ signal }) => getOrderDetail(signal),
    staleTime: 0,
    refetchInterval: (query) => {
      if (query.state.error instanceof ApiError && query.state.error.status === 401) {
        return false
      }
      return 8000
    },
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false
      }
      return failureCount < 3
    },
  })
}
