import { Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface OrderHeaderProps {
  tableName: string
  totalAmount: string
}

const useStyles = makeStyles((t) => ({
  container: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    backgroundColor: t.card,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: t.spacing[2],
  },
  tableName: {
    fontSize: 18,
    fontWeight: '700',
    color: t.cardForeground,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14,
    color: t.mutedForeground,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: t.cardForeground,
  },
}))

export function OrderHeader({ tableName, totalAmount }: OrderHeaderProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.tableName}>{tableName}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>${totalAmount}</Text>
      </View>
    </View>
  )
}
