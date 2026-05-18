import { ActivityIndicator, Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

const useStyles = makeStyles((t) => ({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    paddingVertical: t.spacing[8],
    alignItems: 'center',
  },
  message: {
    marginTop: t.spacing[4],
    fontSize: 16,
    color: t.mutedForeground,
  },
}))

export function LoadingState({ message = 'Cargando...', fullScreen = false }: LoadingStateProps) {
  const styles = useStyles()

  return (
    <View style={fullScreen ? styles.fullScreen : styles.inline}>
      <ActivityIndicator size="large" color={styles.message.color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}
