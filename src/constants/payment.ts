export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  CREDIT_CARD: 'Tarjeta de Crédito',
  DEBIT_CARD: 'Tarjeta de Débito',
  TRANSFER: 'Transferencia',
  QR_CODE: 'Código QR',
  GIFT_CARD: 'Tarjeta de Regalo',
  CHECK: 'Cheque',
  WOMPI: 'Wompi (Nequi/PSE/Tarjeta)',
  OTHER: 'Otro',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  COMPLETED: 'Completado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Reembolsado Parcial',
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  PAID: 'Pagada',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  OPEN: 'Abierta',
  IN_PROGRESS: 'En Progreso',
  PENDING_PAYMENT: 'Pendiente de Pago',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
}
