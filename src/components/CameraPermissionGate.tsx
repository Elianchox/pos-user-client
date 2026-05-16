import { useCameraPermissions } from 'expo-camera'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface CameraPermissionGateProps {
  children: React.ReactNode
}

export function CameraPermissionGate({ children }: CameraPermissionGateProps) {
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg text-foreground text-center mb-4">
          Necesitamos permiso para acceder a la cámara y escanear el código QR.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-primary-foreground font-medium">Conceder permiso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return <>{children}</>
}
