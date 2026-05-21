import { LoadingState } from '@/components/ui/LoadingState'
import { WelcomeIllustration } from '@/components/ui/WelcomeIllustration'
import { useSessionRestore } from '@/hooks/api/useSessionRestore'
import { makeStyles } from '@/theme/makeStyles'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const useStyles = makeStyles((t) => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  container: {
    height: '100%',
    paddingHorizontal: t.spacing[6],
  },
  hero: {
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

export default function WelcomeScreen() {
  const router = useRouter()
  const { isRestoring } = useSessionRestore()
  const styles = useStyles()

  if (isRestoring) {
    return <LoadingState fullScreen message="Restaurando sesión..." />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.title}>
            Bienvenido
          </Text>
          <WelcomeIllustration />
          <Text style={styles.subtitle}>
            Escanea el QR de tu mesa para ver tu orden en tiempo real.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Escanear QR
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
