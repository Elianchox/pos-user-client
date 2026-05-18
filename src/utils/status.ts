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

const WHITE = 'oklch(1 0 0)'

export const ORDER_ITEM_STATUS_COLORS: Record<string, StatusColor> = {
  PENDING: { bg: 'oklch(0.795 0.184 86.047)', text: WHITE },
  SENT_TO_KITCHEN: { bg: 'oklch(0.705 0.213 47.604)', text: WHITE },
  PREPARING: { bg: 'oklch(0.623 0.214 259.815)', text: WHITE },
  READY: { bg: 'oklch(0.627 0.194 149.21)', text: WHITE },
  SERVED: { bg: 'oklch(0.72 0 0)', text: WHITE },
  CANCELLED: { bg: 'oklch(0.637 0.237 25.331)', text: WHITE },
}

export function getStatusLabel(status: string): string {
  return ORDER_ITEM_STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: string): StatusColor {
  return ORDER_ITEM_STATUS_COLORS[status] ?? { bg: 'oklch(0.72 0 0)', text: WHITE }
}
