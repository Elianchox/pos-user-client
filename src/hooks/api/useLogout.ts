import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '@/services/api/endpoints'
import { useSession } from '@/context/SessionContext'
import { useRouter } from 'expo-router'

export function useLogout() {
  const { removeToken } = useSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (signal?: AbortSignal) => logout(signal),
    onSuccess: () => {
      removeToken()
      queryClient.clear()
      router.replace('/')
    },
  })
}
