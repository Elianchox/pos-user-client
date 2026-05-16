import { Text, TouchableOpacity, View } from 'react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Algo salió mal', onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-4xl mb-4">⚠️</Text>
      <Text className="text-lg font-semibold text-foreground text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-6 bg-primary px-6 py-3 rounded-lg active:opacity-80"
        >
          <Text className="text-primary-foreground font-medium">Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
