import { INVOICE_STATUS_LABELS } from '@/constants/payment'
import { makeStyles } from '@/theme/makeStyles'
import type { InvoiceData, OrderItem } from '@/types/api'
import { X } from 'lucide-react-native'
import { useMemo } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

interface InvoiceModalProps {
  visible: boolean
  onClose: () => void
  invoice: InvoiceData | null
  items: OrderItem[]
}

const useStyles = makeStyles((t) => ({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: t.spacing[4],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: t.card,
    borderRadius: t.radii.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    padding: t.spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: t.spacing[4],
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: t.foreground,
  },
  closeButton: {
    padding: t.spacing[1],
  },
  itemsScroll: {
    maxHeight: 300
  },
  itemsScrollContent: {
    paddingBottom: t.spacing[2],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: t.spacing[2],
  },
  label: {
    fontSize: 14,
    color: t.mutedForeground,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: t.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: t.spacing[4],
    marginBottom: t.spacing[2],
  },
  itemCard: {
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: t.border,
    padding: t.spacing[3],
    marginBottom: t.spacing[2],
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: t.foreground,
    flex: 1,
  },
  itemQty: {
    fontSize: 13,
    color: t.mutedForeground,
    marginLeft: t.spacing[2],
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: t.foreground,
  },
  taxLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: t.spacing[1],
    paddingTop: t.spacing[1],
  },
  taxLabel: {
    fontSize: 12,
    color: t.mutedForeground,
  },
  taxAmount: {
    fontSize: 12,
    fontWeight: '500',
    color: t.mutedForeground,
  },
  summarySeparator: {
    height: 1,
    backgroundColor: t.border,
    marginVertical: t.spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: t.spacing[1.5],
  },
  summaryLabel: {
    fontSize: 14,
    color: t.mutedForeground,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: t.foreground,
  },
}))

interface GroupedInvoiceItem {
  productId: string
  productName: string
  unitPrice: number
  count: number
  taxes: { name: string; percentage: number; amount: number }[]
}

function groupInvoiceItems(items: OrderItem[]): GroupedInvoiceItem[] {
  const map = new Map<string, GroupedInvoiceItem>()
  for (const item of items) {
    if (item.status === 'CANCELLED') continue
    const existing = map.get(item.productId)
    if (existing) {
      existing.count += 1
    } else {
      map.set(item.productId, {
        productId: item.productId,
        productName: item.productName,
        unitPrice: parseFloat(item.unitPrice || item.price || '0'),
        count: 1,
        taxes: (item.taxes ?? []).map((t) => ({
          name: t.name,
          percentage: t.percentage,
          amount: parseFloat(t.amount) || 0,
        })),
      })
    }
  }
  return Array.from(map.values())
}

export function InvoiceModal({ visible, onClose, invoice, items }: InvoiceModalProps) {
  const styles = useStyles()

  const grouped = useMemo(() => groupInvoiceItems(items), [items])
  const subtotal = useMemo(
    () => grouped.reduce((s, g) => s + g.unitPrice * g.count, 0),
    [grouped],
  )
  const taxMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const group of grouped) {
      for (const tax of group.taxes) {
        const perItemTax = tax.amount
        const total = (map.get(tax.name) ?? 0) + perItemTax * group.count
        map.set(tax.name, total)
      }
    }
    return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }))
  }, [grouped])
  const totalTax = useMemo(() => taxMap.reduce((s, t) => s + t.amount, 0), [taxMap])
  const total = useMemo(() => subtotal + totalTax, [subtotal, totalTax])

  if (!invoice) return null

  const statusLabel = INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Factura</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <X size={20} color={styles.title.color} />
              </Pressable>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Estado</Text>
              <View style={[styles.badge, { backgroundColor: invoice.status === 'PAID' ? '#22c55e' : '#eab308' }]}>
                <Text style={styles.badgeText}>{statusLabel}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Emitida</Text>
              <Text style={styles.value}>
                {new Date(invoice.createdAt).toLocaleDateString('es-MX', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            {/* Scrollable items list */}
            {grouped.length > 0 && (
                <ScrollView
                  style={styles.itemsScroll}
                  contentContainerStyle={styles.itemsScrollContent}
                  nestedScrollEnabled

                  directionalLockEnabled={true} 
                >
                  <Text style={styles.sectionTitle}>Productos</Text>
                  {grouped.map((group) => (
                    <View key={group.productId} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName} numberOfLines={1}>{group.productName}</Text>
                        {group.count > 1 && <Text style={styles.itemQty}>x{group.count}</Text>}
                        <Text style={styles.itemPrice}>
                          ${(group.unitPrice * group.count).toFixed(2)}
                        </Text>
                      </View>
                      {group.taxes.length > 0 && group.taxes.map((tax) => (
                        <View key={tax.name} style={styles.taxLine}>
                          <Text style={styles.taxLabel}>{tax.name} ({tax.percentage}%)</Text>
                          <Text style={styles.taxAmount}>${(tax.amount * group.count).toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
            )}

            {/* Summary */}
            <View style={styles.summarySeparator} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
            </View>

            {taxMap.map((tax) => (
              <View key={tax.name} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{tax.name}</Text>
                <Text style={styles.summaryValue}>${tax.amount.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.summarySeparator} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total</Text>
              <Text style={[styles.summaryValue, { fontSize: 18, fontWeight: '700' }]}>
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
      </View>
    </Modal>
  )
}
