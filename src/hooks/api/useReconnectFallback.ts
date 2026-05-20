import { ApiError } from '@/services/api/client'
import { useEffect, useState } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import type { OrderDetailResponse } from '@/types/api'

export interface ReconnectFallbackState {
  checkingStatus: boolean
  orderStatus: string | null
  authError: boolean
}

export function useReconnectFallback(
  reconnectFailed: boolean,
  refetch: () => Promise<UseQueryResult<OrderDetailResponse>>,
) {
  const [state, setState] = useState<ReconnectFallbackState>({
    checkingStatus: false,
    orderStatus: null,
    authError: false,
  })

  useEffect(() => {
    if (!reconnectFailed) {
      setState({ checkingStatus: false, orderStatus: null, authError: false })
      return
    }

    let isActive = true

    async function checkOrderStatus() {
      setState({ checkingStatus: true, orderStatus: null, authError: false })

      try {
        const result = await refetch()

        if (!isActive) return

        if (result.error instanceof ApiError && result.error.status === 401) {
          setState({ checkingStatus: false, orderStatus: null, authError: true })
          return
        }

        if (result.data?.data?.order?.status) {
          setState({
            checkingStatus: false,
            orderStatus: result.data.data.order.status,
            authError: false,
          })
        } else {
          // No order found → treat as cancelled
          setState({ checkingStatus: false, orderStatus: 'CANCELLED', authError: false })
        }
      } catch (err) {
        if (!isActive) return
        if (err instanceof ApiError && err.status === 401) {
          setState({ checkingStatus: false, orderStatus: null, authError: true })
        } else {
          // Network error, server down, etc → go scan QR
          setState({ checkingStatus: false, orderStatus: 'CANCELLED', authError: false })
        }
      }
    }

    checkOrderStatus()

    return () => {
      isActive = false
    }
  }, [reconnectFailed, refetch])

  return state
}
