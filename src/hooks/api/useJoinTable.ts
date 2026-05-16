import { useMutation } from '@tanstack/react-query'
import { joinTable } from '@/services/api/endpoints'
import { useSession } from '@/context/SessionContext'
import type { JoinTableRequest } from '@/types/api'

export function useJoinTable() {
  const { saveToken, saveTableId } = useSession()

  return useMutation({
    mutationFn: ({ body, signal }: { body: JoinTableRequest; signal?: AbortSignal }) =>
      joinTable(body, signal),
    onSuccess: (data, variables) => {
      if (data.data.token) {
        saveToken(data.data.token)
      }
      if (variables.body.tableId) {
        saveTableId(variables.body.tableId)
      }
    },
  })
}
