import { POS_BASE_URL } from '@/constants/api'
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '@/constants/payment'
import { makeStyles } from '@/theme/makeStyles'
import type { OrderDetailOrder } from '@/types/api'
import { ChevronDown, ChevronUp, Receipt } from 'lucide-react-native'
import { useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { InvoiceModal } from './InvoiceModal'

interface OrderSummaryCardProps {
  order: OrderDetailOrder | null | undefined
}

const useStyles = makeStyles((t) => ({
  container: {
    backgroundColor: t.card,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  collapsed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
  },
  totalLabel: {
    fontSize: 12,
    color: t.mutedForeground,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: t.foreground,
  },
  paidText: {
    fontSize: 12,
    color: '#22c55e',
  },
  remainingText: {
    fontSize: 12,
    color: '#d97706',
  },
  expandButton: {
    padding: t.spacing[2],
  },
  // Detail bottom-sheet modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  detailCard: {
    backgroundColor: t.card,
    borderTopLeftRadius: t.radii.xl,
    borderTopRightRadius: t.radii.xl,
    paddingHorizontal: t.spacing[4],
    paddingTop: t.spacing[4],
    maxHeight: '70%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing[4],
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: t.foreground,
  },
  paymentsScroll: {
    maxHeight: 250,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: t.spacing[1.5],
  },
  lineLabel: {
    fontSize: 14,
    color: t.mutedForeground,
  },
  lineValue: {
    fontSize: 14,
    fontWeight: '500',
    color: t.foreground,
  },
  separator: {
    height: 1,
    backgroundColor: t.border,
    marginVertical: t.spacing[2],
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: t.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: t.spacing[3],
    marginBottom: t.spacing[2],
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: t.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
  paymentMeta: {
    fontSize: 12,
    color: t.mutedForeground,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
  actionRow: {
    flexDirection: 'row',
    gap: t.spacing[2],
    marginVertical: t.spacing[8],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[2],
    paddingVertical: t.spacing[3],
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: t.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
}))

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const styles = useStyles()
  const [showDetail, setShowDetail] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const queryClient = useQueryClient()

  function openPayUrl(reference: string) {
    if (!order.invoice) return
    const payUrl = `${POS_BASE_URL}/pay/${order.invoice.id}?ref=${reference}`
    Alert.alert(
      'Abrir pago',
      '¿Cómo quieres abrir el enlace de pago?',
      [
        {
          text: 'En esta app',
          onPress: async () => {
            const result = await WebBrowser.openAuthSessionAsync(payUrl)
            if (result.type === 'success') {
              queryClient.invalidateQueries({ queryKey: ['orderDetail'] })
            }
          },
        },
        {
          text: 'Navegador externo',
          onPress: () => {
            Linking.openURL(payUrl)
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    )
  }

  function handlePayWithWompi() {
    if (links.length === 1) {
      openPayUrl(links[0].reference)
      return
    }

    Alert.alert(
      'Selecciona monto',
      '¿Cuánto deseas pagar?',
      [
        ...links.map((link) => ({
          text: `$${link.amount.toFixed(2)}`,
          onPress: () => openPayUrl(link.reference),
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    )
  }

  if (!order) return null

  // Fallback: si el backend devuelve total 0 pero hay items, calcular de items + taxes
  const computedTotal = order.items
    .reduce((sum, item) => sum + parseFloat(item.price || '0'), 0)
    .toFixed(2)
  const taxTotal = (order.taxBreakdown ?? [])
    .reduce((sum, tax) => sum + parseFloat(tax.amount || '0'), 0)
    .toFixed(2)
  const fallbackTotal = (parseFloat(computedTotal) + parseFloat(taxTotal)).toFixed(2)

  const total =
    order.totalAmount && parseFloat(order.totalAmount) > 0
      ? order.totalAmount
      : fallbackTotal

  const alreadyPaid = order.alreadyPaid
  const remaining = order.remaining
  const hasPayments = (order.payments?.length ?? 0) > 0
  const hasInvoice = !!order.invoice
  const hasCheckoutLinks = (order.checkoutLinks?.length ?? 0) > 0
  const links = order.checkoutLinks ?? []

  return (
    <>
      <Pressable
        onPress={() => setShowDetail(true)}
        style={[styles.container, { paddingBottom: 16 }]}
      >
        <View style={styles.collapsed}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${total}</Text>
          </View>
          <View>
            {alreadyPaid && parseFloat(alreadyPaid) > 0 ? (
              <>
                <Text style={styles.paidText}>Pagado ${parseFloat(alreadyPaid).toFixed(2)}</Text>
                <Text style={styles.remainingText}>Restante ${parseFloat(remaining!).toFixed(2)}</Text>
              </>
            ) : (
              <Text style={styles.totalLabel}>Toca para ver detalle</Text>
            )}
          </View>
          <View style={styles.expandButton}>
            <ChevronUp size={20} color={styles.totalLabel.color} />
          </View>
        </View>
      </Pressable>

      {/* Detail bottom-sheet modal */}
      <Modal visible={showDetail} transparent animationType="slide" onRequestClose={() => setShowDetail(false)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowDetail(false)} />
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle}>Detalle de cuenta</Text>
              <Pressable onPress={() => setShowDetail(false)}>
                <ChevronDown size={24} color={styles.detailTitle.color} />
              </Pressable>
            </View>

            <View style={styles.lineRow}>
              <Text style={styles.lineLabel}>Subtotal</Text>
              <Text style={styles.lineValue}>
                ${order.items.reduce((sum, item) => sum + parseFloat(item.price || '0'), 0).toFixed(2)}
              </Text>
            </View>

            {order.taxBreakdown?.map((tax) => (
              <View key={tax.name} style={styles.lineRow}>
                <Text style={styles.lineLabel}>{tax.name} ({tax.percentage}%)</Text>
                <Text style={styles.lineValue}>${tax.amount}</Text>
              </View>
            ))}

            <View style={styles.separator} />

            <View style={styles.lineRow}>
              <Text style={[styles.lineLabel, { fontWeight: '700' }]}>Total</Text>
              <Text style={[styles.lineValue, { fontSize: 18, fontWeight: '700' }]}>${total}</Text>
            </View>

            {alreadyPaid && parseFloat(alreadyPaid) > 0 && (
              <>
                <View style={styles.separator} />
                <View style={styles.lineRow}>
                  <Text style={[styles.lineLabel, { color: '#22c55e' }]}>Pagado</Text>
                  <Text style={[styles.lineValue, { color: '#22c55e' }]}>${parseFloat(alreadyPaid).toFixed(2)}</Text>
                </View>
                <View style={styles.lineRow}>
                  <Text style={[styles.lineLabel, { color: '#d97706' }]}>Restante</Text>
                  <Text style={[styles.lineValue, { color: '#d97706', fontWeight: '700' }]}>
                    ${parseFloat(remaining!).toFixed(2)}
                  </Text>
                </View>
              </>
            )}

            {hasPayments && (
              <>
                <Text style={styles.sectionTitle}>Pagos</Text>
                <ScrollView style={styles.paymentsScroll}>
                  {order.payments!.map((payment) => (
                    <View key={payment.id} style={styles.paymentRow}>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentMethod}>
                          {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                        </Text>
                        <Text style={styles.paymentMeta}>
                          {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                          {' — '}
                          {new Date(payment.processedAt ?? payment.createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.paymentAmount}>${parseFloat(payment.amount).toFixed(2)}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.actionRow}>
              {hasInvoice && (
                <Pressable
                  style={styles.actionButton}
                  onPress={() => { setShowInvoice(true); setShowDetail(false) }}
                >
                  <Receipt size={16} color={styles.actionButtonText.color} />
                  <Text style={styles.actionButtonText}>Ver Factura</Text>
                </Pressable>
              )}
              {order.status === 'PENDING_PAYMENT'
                && parseFloat(order.remaining) > 0
                && hasCheckoutLinks
                && order.invoice && (
                <Pressable
                  style={[styles.actionButton, { backgroundColor: '#00A650', borderColor: '#00A650' }]}
                  onPress={handlePayWithWompi}
                >
                  <Text style={[styles.actionButtonText, { color: '#fff' }]}>
                    Pagar con Wompi
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <InvoiceModal
        visible={showInvoice}
        onClose={() => setShowInvoice(false)}
        invoice={order.invoice ?? null}
        items={order.items}
      />
    </>
  )
}
