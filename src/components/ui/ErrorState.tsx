import { makeStyles } from '@/theme/makeStyles'
import { AlertTriangle } from 'lucide-react-native'
import { Text, TouchableOpacity, View } from 'react-native'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing[6],
    backgroundColor: t.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: t.foreground,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: t.spacing[6],
    backgroundColor: t.primary,
    paddingHorizontal: t.spacing[6],
    paddingVertical: t.spacing[3],
    borderRadius: t.radii.lg,
  },
  retryText: {
    color: t.primaryForeground,
    fontWeight: '500',
  },
}))

export function ErrorState({ message = 'Algo salió mal', onRetry }: ErrorStateProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <AlertTriangle size={36} color={styles.title.color} style={{ marginBottom: 16 }} />
      <Text style={styles.title}>{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
