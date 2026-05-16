import { ActivityIndicator, Text, View } from 'react-native'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Cargando...', fullScreen = false }: LoadingStateProps) {
  const containerClass = fullScreen ? 'flex-1 items-center justify-center' : 'py-8 items-center'

  return (
    <View className={containerClass}>
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="mt-4 text-base text-muted-foreground">{message}</Text>
    </View>
  )
}
