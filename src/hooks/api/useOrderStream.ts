import { subscribeOrderStream } from '@/services/sse/client'
import { OrderStatusEnum, OrderStreamEventType, type OrderDetailResponse, type OrderItemStatusType } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const STATUS_MAP: Partial<Record<OrderStreamEventType, OrderItemStatusType>> = {
  'order.item_sent_to_kitchen': OrderStatusEnum.SENT_TO_KITCHEN,
  'order.item_ready': OrderStatusEnum.READY,
  'order.item_served': OrderStatusEnum.SERVED,
  'order.item_cancelled': OrderStatusEnum.CANCELLED,
}

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
          onOpen: () => {
            if (!isActive) return
            setState((prev) => ({ ...prev, isConnected: true }))
          },
          onEvent: (event) => {
            if (!isActive) return
            setState((prev) => {
              const base = { ...prev, isConnected: true }

              switch (event.event) {
                case 'connected':
                case 'heartbeat':
                  return base
                case 'order.item_added': {
                  const added = event.data.items
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items || added.length === 0) return old
                    const existingIds = new Set(old.data.order.items.map((i) => i.itemId))
                    const newItems = added.filter((i) => !existingIds.has(i.itemId))
                    if (newItems.length === 0) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: { ...old.data.order, items: [...old.data.order.items, ...newItems] },
                      },
                    }
                  })
                  return base
                }
                case 'order.item_sent_to_kitchen': {
                  const status = STATUS_MAP[event.event]
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items) return old
                    const ids = new Set(event.data.itemIds)
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: {
                          ...old.data.order,
                          items: old.data.order.items.map((item) =>
                            ids.has(item.itemId) ? { ...item, status } : item
                          ),
                        },
                      },
                    }
                  })
                  return base
                }
                case 'order.item_ready':
                case 'order.item_served':
                case 'order.item_cancelled': {
                  const status = event.data.status ?? STATUS_MAP[event.event]
                  queryClient.setQueryData(['orderDetail'], (old: OrderDetailResponse | undefined) => {
                    if (!old?.data?.order?.items) return old
                    return {
                      ...old,
                      data: {
                        ...old.data,
                        order: {
                          ...old.data.order,
                          items: old.data.order.items.map((item) =>
                            item.itemId === event.data.itemId ? { ...item, status } : item
                          ),
                        },
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
            console.error('SSE connection error')
            setState((prev) => ({ ...prev, isConnected: false }))
          },
        })
      } catch (err) {
        console.error('SSE subscription setup failed:', err)
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
