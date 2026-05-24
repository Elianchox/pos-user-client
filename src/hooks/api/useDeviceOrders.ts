import { useInfiniteQuery } from '@tanstack/react-query'
import { getDeviceOrders } from '@/services/api/endpoints'
import type { DeviceOrdersResponse } from '@/types/api'

export function useDeviceOrders(
  deviceId: string | null,
  filters?: { status?: string; search?: string },
) {
  return useInfiniteQuery<DeviceOrdersResponse>({
    queryKey: ['deviceOrders', deviceId, filters],
    queryFn: ({ pageParam, signal }) =>
      getDeviceOrders(
        deviceId!,
        { ...filters, page: pageParam as number, limit: 10 },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  })
}
