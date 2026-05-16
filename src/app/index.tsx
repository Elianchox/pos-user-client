import { LoadingState } from '@/components/ui/LoadingState'
import { useSessionRestore } from '@/hooks/api/useSessionRestore'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  const router = useRouter()
  const { isRestoring } = useSessionRestore()

  if (isRestoring) {
    return <LoadingState fullScreen message="Restaurando sesión..." />
  }

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className="h-full px-6">
        <View className='flex-1 items-center justify-center '>
          <Text className="text-5xl mb-4">🍽️</Text>
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Bienvenido
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-8">
            Escanea el QR de tu mesa para ver tu orden en tiempo real.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          className="bg-primary px-8 my-4 py-4 w-full max-w-sm active:opacity-80"
          style={{borderRadius: 8}}
        >
          <Text className="text-primary-foreground text-center text-lg font-semibold">
            Escanear QR
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
