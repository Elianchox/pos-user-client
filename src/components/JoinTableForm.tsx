import { JoinFormIllustration } from '@/components/ui/JoinFormIllustration'
import { makeStyles } from '@/theme/makeStyles'
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
    paddingTop: t.spacing[6],
    paddingBottom: t.spacing[8],
    alignItems: 'center',
    gap: t.spacing[4],
  },
  illustrationWrapper: {
    width: '100%',
    maxWidth: 240,
    marginBottom: t.spacing[8],
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: t.foreground,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: t.mutedForeground,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 384,
  },
  input: {
    width: '100%',
    backgroundColor: t.input,
    color: t.foreground,
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: t.border,
    fontSize: 16,
  },
  joinButton: {
    width: '100%',
    maxWidth: 384,
    paddingVertical: t.spacing[4],
    borderRadius: t.radii.lg,
    alignItems: 'center',
    backgroundColor: t.primary,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    color: t.primaryForeground,
    fontWeight: '600',
    fontSize: 16,
  },
  retryButton: {
    marginTop: t.spacing[2],
  },
  retryText: {
    color: t.mutedForeground,
    fontSize: 14,
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
            <View style={styles.illustrationWrapper}>
              <JoinFormIllustration />
            </View>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.subtitle}>
              Ingresa tu nombre para continuar
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                value={customerName}
                onChangeText={onCustomerNameChange}
                placeholder="Tu nombre"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

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
