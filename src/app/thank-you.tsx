import { makeStyles } from '@/theme/makeStyles'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const useStyles = makeStyles((t) => ({
  safeArea: {
    flex: 1,
  },
  container: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.background,
    paddingHorizontal: t.spacing[6],
  },
  emoji: {
    fontSize: 60,
    marginBottom: t.spacing[4],
  },
  title: {
    fontSize: 24,
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
    paddingVertical: t.spacing[4],
    borderRadius: t.radii['2xl'],
    width: '100%',
    maxWidth: 384,
  },
  buttonText: {
    color: t.primaryForeground,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
}))

export default function ThankYouScreen() {
  const router = useRouter()
  const styles = useStyles()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🙏</Text>
        <Text style={styles.title}>
          Gracias por tu visita
        </Text>
        <Text style={styles.subtitle}>
          Tu mesa ha sido cerrada. Esperamos verte pronto.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            Escanear otra mesa
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
