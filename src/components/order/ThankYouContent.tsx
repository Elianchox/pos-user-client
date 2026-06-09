import { ThankYouIllustration } from '@/components/ui/ThankYouIllustration'
import { makeStyles } from '@/theme/makeStyles'
import { router } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'

interface ThankYouContentProps {
  status: 'PAID' | 'CANCELLED'
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing[6],
    gap: t.spacing[4],
  },
  illustrationWrapper: {
    width: '100%',
    maxWidth: 280,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: t.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: t.mutedForeground,
    textAlign: 'center',
    lineHeight: 24,
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

export function ThankYouContent({ status }: ThankYouContentProps) {
  const styles = useStyles()

  const isPaid = status === 'PAID'
  const title = isPaid ? 'Cuenta pagada' : 'Orden cancelada'
  const subtitle = isPaid
    ? 'Tu pago fue procesado exitosamente.\nEsperando nueva orden.'
    : 'Lo sentimos, tu orden fue cancelada.\nPuedes solicitar una nueva con el mesero.'

  return (
    <View style={styles.container}>
      <View style={styles.illustrationWrapper}>
        <ThankYouIllustration />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <TouchableOpacity
        onPress={() => router.replace('/')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Salir</Text>
      </TouchableOpacity>
    </View>
  )
}
