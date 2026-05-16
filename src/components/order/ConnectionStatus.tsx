import { Text, View } from 'react-native'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`}
      />
      <Text className="text-xs text-muted-foreground">
        {isConnected ? 'En vivo' : 'Desconectado'}
      </Text>
    </View>
  )
}
