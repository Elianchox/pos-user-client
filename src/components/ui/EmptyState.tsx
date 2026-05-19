import { Text, View } from 'react-native'
import { Inbox } from 'lucide-react-native'
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
      <Inbox size={36} color={styles.message.color} style={{ marginBottom: 16 }} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}
