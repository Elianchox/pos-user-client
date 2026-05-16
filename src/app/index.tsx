import { Text, View, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useSessionRestore } from '@/hooks/api/useSessionRestore'
import { LoadingState } from '@/components/ui/LoadingState'

export default function WelcomeScreen() {
  const router = useRouter()
  const { isRestoring } = useSessionRestore()

  if (isRestoring) {
    return <LoadingState fullScreen message="Restaurando sesión..." />
  }

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Text className="text-5xl mb-4">🍽️</Text>
      <Text className="text-3xl font-bold text-foreground text-center mb-2">
        Bienvenido
      </Text>
      <Text className="text-base text-muted-foreground text-center mb-8">
        Escanea el QR de tu mesa para ver tu orden en tiempo real.
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/scan')}
        className="bg-primary px-8 py-4 rounded-2xl w-full max-w-sm active:opacity-80"
      >
        <Text className="text-primary-foreground text-center text-lg font-semibold">
          Escanear QR
        </Text>
      </TouchableOpacity>
    </View>
  )
}
