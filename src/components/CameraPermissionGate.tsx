import { CameraPermissionIllustration } from '@/components/ui/CameraPermissionIllustration'
import { makeStyles } from '@/theme/makeStyles'
import { useCameraPermissions } from 'expo-camera'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  container: {
    height: '100%',
    paddingHorizontal: t.spacing[6],
    alignItems: 'center',
  },
  hero: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[12],
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: t.foreground,
    textAlign: 'center',
    marginBottom: t.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: t.mutedForeground,
    textAlign: 'center',
    marginBottom: t.spacing[8],
  },
  button: {
    backgroundColor: t.primary,
    paddingHorizontal: t.spacing[8],
    marginVertical: t.spacing[4],
    paddingVertical: t.spacing[4],
    width: '100%',
    maxWidth: 384,
    borderRadius: t.radii.md,
  },
  buttonText: {
    color: t.primaryForeground,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <Text style={styles.title}>Permiso de cámara</Text>
            <CameraPermissionIllustration />
            <Text style={styles.subtitle}>
              Necesitamos permiso para acceder a la cámara y escanear el código QR.
            </Text>
          </View>
          <TouchableOpacity
            onPress={requestPermission}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Conceder permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return <>{children}</>
}
