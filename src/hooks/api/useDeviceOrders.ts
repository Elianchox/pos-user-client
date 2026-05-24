import { useQuery } from '@tanstack/react-query'
import { getDeviceOrders } from '@/services/api/endpoints'
import type { DeviceOrdersResponse } from '@/types/api'

export function useDeviceOrders(deviceId: string | null) {
  return useQuery<DeviceOrdersResponse>({
    queryKey: ['deviceOrders', deviceId],
    queryFn: ({ signal }) => getDeviceOrders(deviceId!, signal),
    enabled: !!deviceId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  })
}
