import { useQuery } from '@tanstack/react-query'
import { getTableStatus } from '@/services/api/endpoints'

export function useTableStatus(tableId: string) {
  return useQuery({
    queryKey: ['tableStatus', tableId],
    queryFn: ({ signal }) => getTableStatus(tableId, signal),
    enabled: !!tableId,
  })
}
