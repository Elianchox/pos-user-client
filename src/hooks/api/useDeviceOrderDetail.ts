import { useQuery } from '@tanstack/react-query'
import { getDeviceOrderDetail } from '@/services/api/endpoints'
import type { DeviceOrderDetailResponse } from '@/types/api'

export function useDeviceOrderDetail(orderId: string | null) {
  return useQuery<DeviceOrderDetailResponse>({
    queryKey: ['deviceOrderDetail', orderId],
    queryFn: ({ signal }) => getDeviceOrderDetail(orderId!, signal),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
