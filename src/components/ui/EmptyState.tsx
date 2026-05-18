import { Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface EmptyStateProps {
  message?: string
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing[6],
  },
  icon: {
    fontSize: 36,
    marginBottom: t.spacing[4],
  },
  message: {
    fontSize: 18,
    color: t.mutedForeground,
    textAlign: 'center',
  },
}))

export function EmptyState({ message = 'No hay datos' }: EmptyStateProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📭</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}
