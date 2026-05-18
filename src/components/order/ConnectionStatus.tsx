import { Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface ConnectionStatusProps {
  isConnected: boolean
  reconnecting?: boolean
}

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  dotConnected: {
    backgroundColor: t.success,
  },
  dotDisconnected: {
    backgroundColor: t.destructive,
  },
  label: {
    fontSize: 12,
    color: t.mutedForeground,
  },
}))

const RECONNECTING_COLOR = 'oklch(0.795 0.184 86.047)'

export function ConnectionStatus({ isConnected, reconnecting }: ConnectionStatusProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          reconnecting
            ? { backgroundColor: RECONNECTING_COLOR }
            : isConnected
              ? styles.dotConnected
              : styles.dotDisconnected,
        ]}
      />
      <Text style={styles.label}>
        {reconnecting ? 'Reconectando...' : isConnected ? 'En vivo' : 'Desconectado'}
      </Text>
    </View>
  )
}
