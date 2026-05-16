import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeOrderStream } from '@/services/sse/client'
import type { OrderItem, OrderDetailResponse } from '@/types/api'

export interface OrderStreamState {
  isConnected: boolean
  orderClosed: boolean
  sessionEnded: boolean
}

const initialStreamState: OrderStreamState = {
  isConnected: false,
  orderClosed: false,
  sessionEnded: false,
}

export function useOrderStream(orderId: string) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OrderStreamState>(initialStreamState)

  useEffect(() => {
    if (!orderId) return

    const controller = new AbortController()
    let isActive = true

    ;(async () => {
      try {
        await subscribeOrderStream(orderId, {
          signal: controller.signal,
          onEvent: (event) => {
            if (!isActive) return
            setState((prev) => {
              const base = { ...prev, isConnected: true }

              switch (event.event) {
                case 'order.item_added': {
                  const newItem = event.data as Partial<OrderItem>
                  if (!newItem.itemId || !newItem.productId) return base
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.items) return old
                    return {
                      ...old,
                      data: { ...old.data, items: [...old.data.items, newItem as OrderItem] },
                    }
                  })
                  return base
                }
                case 'order.item_sent_to_kitchen':
                case 'order.item_ready':
                case 'order.item_served':
                case 'order.item_cancelled': {
                  const update = event.data as { itemId?: string; status?: string }
                  if (!update.itemId || !update.status) return base
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.items) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        items: old.data.items.map((item) =>
                          item.itemId === update.itemId ? { ...item, status: update.status } : item
                        ),
                      },
                    }
                  })
                  return base
                }
                case 'order.order_closed':
                  return { ...base, orderClosed: true }
                case 'session.ended':
                  return { ...base, sessionEnded: true, isConnected: false }
                default:
                  return base
              }
            })
          },
          onError: () => {
            if (!isActive) return
            setState((prev) => ({ ...prev, isConnected: false }))
          },
        })
      } catch {
        // Connection aborted or failed
      } finally {
        if (isActive) {
          setState((prev) => ({ ...prev, isConnected: false }))
        }
      }
    })()

    return () => {
      isActive = false
      controller.abort()
      setState(initialStreamState)
    }
  }, [orderId, queryClient])

  return state
}
