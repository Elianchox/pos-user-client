import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { parseQrUrl } from '@/utils/qr'
import { useSession } from '@/context/SessionContext'

export function useDeepLink() {
  const router = useRouter()
  const { token, saveTableId } = useSession()

  useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = parseQrUrl(event.url)
      if (!parsed) return

      if (token) {
        saveTableId(parsed.tableId)
        router.replace('/order')
      } else {
        router.push({ pathname: '/scan', params: { tableId: parsed.tableId } })
      }
    })

    return () => {
      subscription.remove()
    }
  }, [token, router, saveTableId])
}
