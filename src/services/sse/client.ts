import { API_BASE_URL } from '@/constants/api'
import { getToken } from '@/services/session'
import { STEAM_EVENT_TYPE_LIST, type OrderStreamEvent } from '@/types/api'
import EventSource from 'react-native-sse'

export async function subscribeOrderStream(
  orderId: string,
  {
    onEvent,
    onError,
    onOpen,
    signal,
  }: {
    onEvent: (event: OrderStreamEvent) => void
    onError?: (err: Error) => void
    onOpen?: () => void
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

  const es = new EventSource<string>(url, { headers })

  es.addEventListener('open', () => {
    onOpen?.()
  })

  for (const eventType of STEAM_EVENT_TYPE_LIST) {
    es.addEventListener(eventType, (event) => {
      const data = event.data ? JSON.parse(event.data) : {}
      onEvent({ event: eventType, data })
    })
  }

  es.addEventListener('error', (event) => {
    const message =
      'message' in event && typeof event.message === 'string'
        ? event.message
        : 'SSE connection error'
    onError?.(new Error(message))
  })

  signal.addEventListener('abort', () => {
    es.close()
  })
}
