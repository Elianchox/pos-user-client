import { Text, View } from 'react-native'

interface ConnectionStatusProps {
  isConnected: boolean
  reconnecting?: boolean
}

export function ConnectionStatus({ isConnected, reconnecting }: ConnectionStatusProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className={`w-2 h-2 rounded-full ${
          reconnecting ? 'bg-yellow-500' : isConnected ? 'bg-success' : 'bg-destructive'
        }`}
      />
      <Text className="text-xs text-muted-foreground">
        {reconnecting ? 'Reconectando...' : isConnected ? 'En vivo' : 'Desconectado'}
      </Text>
    </View>
  )
}
