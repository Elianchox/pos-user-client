import { useMutation } from '@tanstack/react-query'
import { joinTable } from '@/services/api/endpoints'
import type { JoinTableRequest } from '@/types/api'

export function useJoinTable() {
  return useMutation({
    mutationFn: ({ body, signal }: { body: JoinTableRequest; signal?: AbortSignal }) =>
      joinTable(body, signal),
  })
}
