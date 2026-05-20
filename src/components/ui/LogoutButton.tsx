import { useSession } from '@/context/SessionContext'
import { logout } from '@/services/api/endpoints'
import { makeStyles } from '@/theme/makeStyles'
import { useRouter } from 'expo-router'
import { LogOut } from 'lucide-react-native'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

const useStyles = makeStyles((t) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: t.radii.md,
    backgroundColor: t.destructive,
  },
  buttonText: {
    color: t.destructiveForeground,
    fontSize: 14,
    fontWeight: '600',
  },
}))

interface LogoutButtonProps {
  onLogout?: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
  const router = useRouter()
  const { clearSessionExceptName } = useSession()
  const styles = useStyles()

  const handleLogout = () => {
    Alert.alert(
      'Salir',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout()
            } catch {
              // Ignore logout errors, still clear session
            }
            await clearSessionExceptName()
            if (onLogout) {
              onLogout()
            } else {
              router.replace('/')
            }
          },
        },
      ],
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <LogOut size={16} color={styles.buttonText.color} />
        <Text style={styles.buttonText}>Salir</Text>
      </TouchableOpacity>
    </View>
  )
}
