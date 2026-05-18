import { Text, View } from 'react-native'
import { ConnectionStatus } from './ConnectionStatus'

interface OrderHeaderProps {
  tableName: string
  totalAmount: string
  isConnected: boolean
  reconnecting?: boolean
}

export function OrderHeader({ tableName, totalAmount, isConnected, reconnecting }: OrderHeaderProps) {
  return (
    <View className="px-4 py-4 bg-card border-b border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-card-foreground">{tableName}</Text>
        <ConnectionStatus isConnected={isConnected} reconnecting={reconnecting} />
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">Total</Text>
        <Text className="text-xl font-bold text-card-foreground">${totalAmount}</Text>
      </View>
    </View>
  )
}
