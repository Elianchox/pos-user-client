import { Text, View } from 'react-native'
import { getStatusLabel, getStatusColor } from '@/utils/status'
import { makeStyles } from '@/theme/makeStyles'

interface StatusBadgeProps {
  status: string
}

const useStyles = makeStyles(() => ({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
}))

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles = useStyles()
  const label = getStatusLabel(status)
  const colors = getStatusColor(status)

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  )
}
