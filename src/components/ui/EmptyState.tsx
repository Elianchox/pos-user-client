import { Text, View } from 'react-native'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No hay datos' }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-4xl mb-4">📭</Text>
      <Text className="text-lg text-muted-foreground text-center">{message}</Text>
    </View>
  )
}
