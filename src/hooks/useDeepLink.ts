import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { useQueryClient } from '@tanstack/react-query'
import { parseQrUrl } from '@/utils/qr'
import { useSession } from '@/context/SessionContext'

export function useDeepLink() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { token, saveTableId } = useSession()

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = parseQrUrl(event.url)
      if (!parsed) return

      if (token) {
        saveTableId(parsed.tableId)
        queryClient.removeQueries({ queryKey: ['orderDetail'] })
        router.replace('/order')
      } else {
        router.push({ pathname: '/scan', params: { tableId: parsed.tableId } })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [token, router, saveTableId, queryClient])
}
