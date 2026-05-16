import { Text, View } from 'react-native'
import { getStatusLabel, getStatusColor } from '@/utils/status'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = getStatusLabel(status)
  const colors = getStatusColor(status)

  return (
    <View className={`${colors.bg} px-2.5 py-1 rounded-full`}>
      <Text className={`${colors.text} text-xs font-medium`}>{label}</Text>
    </View>
  )
}
