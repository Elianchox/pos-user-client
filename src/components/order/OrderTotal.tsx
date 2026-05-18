import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { makeStyles } from '@/theme/makeStyles'

interface OrderTotalProps {
  total: string
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    backgroundColor: t.card,
    borderTopWidth: 1,
    borderTopColor: t.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: t.mutedForeground,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: t.foreground,
  },
}))

export function OrderTotal({ total }: OrderTotalProps) {
  const styles = useStyles()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <Text style={styles.label}>Total</Text>
      <Text style={styles.amount}>${total}</Text>
    </View>
  )
}
