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
  reconnecting: boolean
  reconnectFailed: boolean
  orderClosed: boolean
  sessionEnded: boolean
}

const initialStreamState: OrderStreamState = {
  isConnected: false,
  reconnecting: false,
  reconnectFailed: false,
  orderClosed: false,
  sessionEnded: false,
}

const MAX_RECONNECT_ATTEMPTS = 2
const RETRY_DELAY_MS = 3000

export function useOrderStream() {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OrderStreamState>(initialStreamState)
  useEffect(() => {
    let isActive = true
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let currentController: AbortController | null = null
    let attemptCount = 0

    function scheduleRetry() {
      attemptCount++
      if (attemptCount >= MAX_RECONNECT_ATTEMPTS) {
        setState((prev) => ({ ...prev, isConnected: false, reconnectFailed: true }))
        return
      }
      setState((prev) => ({ ...prev, isConnected: false, reconnecting: true }))
      retryTimeout = setTimeout(start, RETRY_DELAY_MS)
    }

    async function start() {
      const controller = new AbortController()
      currentController = controller

      try {
        await subscribeOrderStream({
          signal: controller.signal,
          onOpen: () => {
            if (!isActive) return
            attemptCount = 0
            setState((prev) => ({ ...prev, isConnected: true, reconnecting: false }))
          },
          onEvent: (event) => {
            if (!isActive) return
            setState((prev) => {
              const base = { ...prev, isConnected: true }

              switch (event.event) {
                case 'connected': {
                  const activeOrder = event.data.activeOrder
                  if (activeOrder) {
                    const payload: OrderDetailResponse = {
                      success: true,
                      data: {
                        table: event.data.table,
                        order: activeOrder,
                      },
                    }
                    queryClient.setQueryData(['orderDetail'], payload)
                  } else {
                    queryClient.setQueryData(['orderDetail'], {
                      success: true,
                      data: { table: event.data.table, order: null },
                    })
                  }
                  return base
                }
                case 'heartbeat':
                  return base
                case 'order.item_added': {
                  const added = event.data.items.map((item) => ({
                    ...item,
                    status: OrderStatusEnum.PENDING,
                  }))
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
          onError: (err: Error) => {
            if (!isActive) return
            console.error('SSE connection error:', err)
            scheduleRetry()
          },
        })
      } catch (err) {
        console.error('SSE subscription setup failed:', err)
        if (!isActive) return
        scheduleRetry()
      }
    }

    start()

    return () => {
      isActive = false
      if (retryTimeout) clearTimeout(retryTimeout)
      if (currentController) currentController.abort()
      setState(initialStreamState)
    }
  }, [queryClient])

  return state
}
