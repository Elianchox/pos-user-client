import { useQuery } from '@tanstack/react-query'
import { getDeviceOrders } from '@/services/api/endpoints'
import type { DeviceOrdersResponse } from '@/types/api'

export function useDeviceOrders(
  deviceId: string | null,
  filters?: { status?: string; search?: string },
) {
  return useQuery<DeviceOrdersResponse>({
    queryKey: ['deviceOrders', deviceId, filters],
    queryFn: async ({ signal }) => {
      const response = await getDeviceOrders(
        deviceId!,
        { ...filters, page: 1, limit: 50 },
        signal,
      )
      console.log('[useDeviceOrders] API response:', JSON.stringify(response, null, 2))
      return response
    },
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
  })
}
