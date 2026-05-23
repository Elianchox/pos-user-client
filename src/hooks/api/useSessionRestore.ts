import { useSession } from '@/context/SessionContext'
import { ApiError } from '@/services/api/client'
import { getOrderDetail } from '@/services/api/endpoints'
import { parseQrUrl } from '@/utils/qr'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'

export function useSessionRestore() {
  const { token, tableId, removeToken, isLoading: sessionLoading } = useSession()
  const router = useRouter()
  const [isRestoring, setIsRestoring] = useState(true)
  const hasRun = useRef(false)

  useEffect(() => {
    if (sessionLoading || hasRun.current) return
    hasRun.current = true

    async function restore() {
      const initialUrl = await Linking.getInitialURL()
      const parsedQr = initialUrl ? parseQrUrl(initialUrl) : null

      if (!token) {
        if (parsedQr) {
          router.replace({ pathname: '/scan', params: { tableId: parsedQr.tableId } })
        }
        setIsRestoring(false)
        return
      }

      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        const result = await getOrderDetail(controller.signal)
        clearTimeout(timeout)

        if (result.success && result.data) {
          // router.replace('/order')
        } else {
          await removeToken()
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await removeToken()
        }
      } finally {
        setIsRestoring(false)
      }
    }

    restore()
  }, [token, tableId, sessionLoading, removeToken, router])

  return { isRestoring }
}
