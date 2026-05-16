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

export const ORDER_ITEM_STATUS_COLORS: Record<string, StatusColor> = {
  PENDING: { bg: 'bg-yellow-500', text: 'text-white' },
  SENT_TO_KITCHEN: { bg: 'bg-orange-500', text: 'text-white' },
  PREPARING: { bg: 'bg-blue-500', text: 'text-white' },
  READY: { bg: 'bg-green-500', text: 'text-white' },
  SERVED: { bg: 'bg-gray-400', text: 'text-white' },
  CANCELLED: { bg: 'bg-red-500', text: 'text-white' },
}

export function getStatusLabel(status: string): string {
  return ORDER_ITEM_STATUS_LABELS[status] ?? status
}

export function getStatusColor(status: string): StatusColor {
  return ORDER_ITEM_STATUS_COLORS[status] ?? { bg: 'bg-gray-400', text: 'text-white' }
}
