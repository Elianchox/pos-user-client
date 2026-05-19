import React, { memo } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { X } from 'lucide-react-native'
import { getStatusLabel, ORDER_ITEM_STATUS_COLORS } from '@/utils/status'
import { ORDER_ITEM_STATUS, OrderItemStatusType } from '@/types/api'
import { makeStyles } from '@/theme/makeStyles'

interface OrderFilterBarProps {
  activeStatuses: OrderItemStatusType[] | null
  onToggle: (status: OrderItemStatusType) => void
  onClearAll: () => void
}

const useStyles = makeStyles((t) => ({
  container: {
    marginBottom: t.spacing[3],
  },
  scrollRow: {
    flexDirection: 'row',
    gap: t.spacing[2],
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: t.muted,
  },
  clearLabel: {
    color: t.mutedForeground,
  },
  todosInactiveLabel: {
    color: t.mutedForeground,
  },
}))

export const OrderFilterBar = memo(function OrderFilterBar({ activeStatuses, onToggle, onClearAll }: OrderFilterBarProps) {
  const styles = useStyles()
  const hasActiveFilters = activeStatuses !== null && activeStatuses.length > 0

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.scrollRow}>
          <Pressable
            onPress={onClearAll}
            accessibilityRole="button"
            accessibilityState={{ selected: !hasActiveFilters }}
            style={[
              styles.chip,
              !hasActiveFilters && {
                backgroundColor: ORDER_ITEM_STATUS_COLORS.PENDING.bg,
                borderColor: ORDER_ITEM_STATUS_COLORS.PENDING.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.chipLabel,
                hasActiveFilters
                  ? styles.todosInactiveLabel
                  : { color: ORDER_ITEM_STATUS_COLORS.PENDING.text },
              ]}
            >
              Todos
            </Text>
          </Pressable>

          {ORDER_ITEM_STATUS.map((status) => {
            const isActive = hasActiveFilters && activeStatuses.includes(status)
            const colors = ORDER_ITEM_STATUS_COLORS[status]

            return (
              <Pressable
                key={status}
                onPress={() => onToggle(status)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: colors.bg, borderColor: colors.bg }
                    : { borderColor: colors.bg },
                ]}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isActive ? { color: colors.text } : { color: colors.bg },
                  ]}
                >
                  {getStatusLabel(status)}
                </Text>
              </Pressable>
            )
          })}

          {hasActiveFilters && (
            <Pressable onPress={onClearAll} style={styles.clearButton} accessibilityRole="button" accessibilityState={{ selected: false }}>
              <X size={14} color={styles.clearLabel.color} />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  )
})
