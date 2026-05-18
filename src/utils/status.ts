export const ORDER_ITEM_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  SENT_TO_KITCHEN: 'En cocina',
  PREPARING: 'Preparando',
  READY: 'Lista',
  SERVED: 'Servida',
  CANCELLED: 'Cancelada',
}

export interface StatusColor {
  bg: string
  text: string
}

const WHITE = '#ffffff'

export const ORDER_ITEM_STATUS_COLORS: Record<string, StatusColor> = {
  PENDING: { bg: '#eab308', text: WHITE },
  SENT_TO_KITCHEN: { bg: '#f97316', text: WHITE },
  PREPARING: { bg: '#3b82f6', text: WHITE },
  READY: { bg: '#22c55e', text: WHITE },
  SERVED: { bg: '#a1a1aa', text: WHITE },
  CANCELLED: { bg: '#ef4444', text: WHITE },
}

export function getStatusLabel(status: string): string {
  return ORDER_ITEM_STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: string): StatusColor {
  return ORDER_ITEM_STATUS_COLORS[status] ?? { bg: '#a1a1aa', text: WHITE }
}
