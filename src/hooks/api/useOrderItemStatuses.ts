import { useQuery } from '@tanstack/react-query'
import { getOrderItemStatuses } from '@/services/api/endpoints'

export function useOrderItemStatuses() {
  return useQuery({
    queryKey: ['orderItemStatuses'],
    queryFn: ({ signal }) => getOrderItemStatuses(signal),
  })
}
