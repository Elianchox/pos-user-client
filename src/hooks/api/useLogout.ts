import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/services/api/endpoints'
import { useSession } from '@/context/SessionContext'

export function useLogout() {
  const { removeToken } = useSession()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (signal?: AbortSignal) => logout(signal),
    onSuccess: () => {
      removeToken()
      queryClient.clear()
    },
  })
}
