import { useCameraPermissions } from 'expo-camera'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { makeStyles } from '@/theme/makeStyles'

interface CameraPermissionGateProps {
  children: React.ReactNode
}

const useStyles = makeStyles((t) => ({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.background,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.background,
    paddingHorizontal: t.spacing[6],
  },
  permissionText: {
    fontSize: 18,
    color: t.foreground,
    textAlign: 'center',
    marginBottom: t.spacing[4],
  },
  permissionButton: {
    backgroundColor: t.primary,
    paddingHorizontal: t.spacing[6],
    paddingVertical: t.spacing[3],
    borderRadius: t.radii.lg,
  },
  permissionButtonText: {
    color: t.primaryForeground,
    fontWeight: '500',
  },
}))

export function CameraPermissionGate({ children }: CameraPermissionGateProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const styles = useStyles()

  if (!permission) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Necesitamos permiso para acceder a la cámara y escanear el código QR.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionButton}
        >
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return <>{children}</>
}
