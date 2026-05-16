import { useEffect, useState } from 'react'
import { subscribeOrderStream } from '@/services/sse/client'

export interface OrderStreamState {
  itemsAdded: Record<string, unknown>[]
  itemsSentToKitchen: Record<string, unknown>[]
  itemsReady: Record<string, unknown>[]
  itemsServed: Record<string, unknown>[]
  itemsCancelled: Record<string, unknown>[]
  paymentsReceived: Record<string, unknown>[]
  orderClosed: Record<string, unknown> | null
  sessionEnded: Record<string, unknown> | null
  isConnected: boolean
}

const initialStreamState: OrderStreamState = {
  itemsAdded: [],
  itemsSentToKitchen: [],
  itemsReady: [],
  itemsServed: [],
  itemsCancelled: [],
  paymentsReceived: [],
  orderClosed: null,
  sessionEnded: null,
  isConnected: false,
}

export function useOrderStream(orderId: string) {
  const [state, setState] = useState<OrderStreamState>(initialStreamState)

  useEffect(() => {
    if (!orderId) return

    const controller = new AbortController()

    ;(async () => {
      try {
        await subscribeOrderStream(orderId, {
          signal: controller.signal,
          onEvent: (event) => {
            setState((prev) => {
              switch (event.event) {
                case 'order.item_added':
                  return { ...prev, itemsAdded: [...prev.itemsAdded, event.data], isConnected: true }
                case 'order.item_sent_to_kitchen':
                  return { ...prev, itemsSentToKitchen: [...prev.itemsSentToKitchen, event.data] }
                case 'order.item_ready':
                  return { ...prev, itemsReady: [...prev.itemsReady, event.data] }
                case 'order.item_served':
                  return { ...prev, itemsServed: [...prev.itemsServed, event.data] }
                case 'order.item_cancelled':
                  return { ...prev, itemsCancelled: [...prev.itemsCancelled, event.data] }
                case 'order.payment_received':
                  return { ...prev, paymentsReceived: [...prev.paymentsReceived, event.data] }
                case 'order.order_closed':
                  return { ...prev, orderClosed: event.data }
                case 'session.ended':
                  return { ...prev, sessionEnded: event.data, isConnected: false }
                default:
                  return prev
              }
            })
          },
          onError: () => {
            setState((prev) => ({ ...prev, isConnected: false }))
          },
        })
      } catch {
        // Connection aborted or failed — stream ended
      } finally {
        setState((prev) => ({ ...prev, isConnected: false }))
      }
    })()

    return () => {
      controller.abort()
      setState(initialStreamState)
    }
  }, [orderId])

  return state
}
