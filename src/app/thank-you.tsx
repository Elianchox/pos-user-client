import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ThankYouScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1">
      <View className='h-full items-center justify-center bg-background px-6'>
        <Text className="text-6xl mb-4">🙏</Text>
        <Text className="text-2xl font-bold text-foreground text-center mb-2">
          Gracias por tu visita
        </Text>
        <Text className="text-base text-muted-foreground text-center mb-8">
          Tu mesa ha sido cerrada. Esperamos verte pronto.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          className="bg-primary px-8 py-4 rounded-2xl w-full max-w-sm active:opacity-80"
        >
          <Text className="text-primary-foreground text-center text-lg font-semibold">
            Escanear otra mesa
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
