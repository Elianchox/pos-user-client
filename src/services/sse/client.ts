import { fetchEventSource } from '@microsoft/fetch-event-source'
import { API_BASE_URL } from '@/constants/api'
import { getToken } from '@/services/session'
import type { OrderStreamEvent } from '@/types/api'

export async function subscribeOrderStream(
  orderId: string,
  {
    onEvent,
    onError,
    signal,
  }: {
    onEvent: (event: OrderStreamEvent) => void
    onError?: (err: Error) => void
    signal: AbortSignal
  },
) {
  const url = `${API_BASE_URL}/orders/${orderId}/stream`
  const token = await getToken()

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  await fetchEventSource(url, {
    headers,
    signal,
    onmessage(msg) {
      try {
        const data = JSON.parse(msg.data)
        onEvent({ event: msg.event as OrderStreamEvent['event'], data })
      } catch {
        onEvent({ event: msg.event as OrderStreamEvent['event'], data: {} })
      }
    },
    onerror(err) {
      onError?.(err)
      throw err
    },
  })
}
