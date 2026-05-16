import { useQuery } from '@tanstack/react-query'
import { getOrderDetail } from '@/services/api/endpoints'

export function useOrderDetail() {
  return useQuery({
    queryKey: ['orderDetail'],
    queryFn: ({ signal }) => getOrderDetail(signal),
  })
}
