import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface JoinTableFormProps {
  customerName: string
  onCustomerNameChange: (name: string) => void
  onJoin: () => void
  isPending: boolean
  onRetryScan: () => void
}

const useStyles = makeStyles((t) => ({
  flex: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: t.spacing[6],
    paddingVertical: t.spacing[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: t.spacing[2],
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: t.foreground,
    marginBottom: t.spacing[1],
  },
  subtitle: {
    color: t.mutedForeground,
    textAlign: 'center',
    marginBottom: t.spacing[6],
  },
  input: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: t.input,
    color: t.foreground,
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: t.border,
    marginBottom: t.spacing[4],
  },
  joinButton: {
    width: '100%',
    maxWidth: 384,
    paddingVertical: t.spacing[3],
    borderRadius: t.radii.lg,
    alignItems: 'center',
    backgroundColor: t.primary,
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: t.primaryForeground,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: t.spacing[4],
  },
  retryText: {
    color: t.mutedForeground,
  },
}))

export function JoinTableForm({
  customerName,
  onCustomerNameChange,
  onJoin,
  isPending,
  onRetryScan,
}: JoinTableFormProps) {
  const styles = useStyles()
  const isDisabled = isPending || !customerName.trim()

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.flex}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.innerContainer}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.subtitle}>
              Ingresa tu nombre para continuar
            </Text>

            <TextInput
              value={customerName}
              onChangeText={onCustomerNameChange}
              placeholder="Tu nombre"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={onJoin}
              disabled={isDisabled}
              style={[styles.joinButton, isDisabled && styles.joinButtonDisabled]}
            >
              <Text style={styles.joinButtonText}>
                {isPending ? 'Uniendo...' : 'Unirse a la mesa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onRetryScan} style={styles.retryButton}>
              <Text style={styles.retryText}>Escanear de nuevo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
