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

export function JoinTableForm({
  customerName,
  onCustomerNameChange,
  onJoin,
  isPending,
  onRetryScan,
}: JoinTableFormProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-1 px-6 py-8 items-center justify-center">
            <Text className="text-2xl mb-2">👋</Text>
            <Text className="text-lg font-semibold text-foreground mb-1">Bienvenido</Text>
            <Text className="text-muted-foreground text-center mb-6">
              Ingresa tu nombre para continuar
            </Text>

            <TextInput
              value={customerName}
              onChangeText={onCustomerNameChange}
              placeholder="Tu nombre"
              placeholderTextColor="#9ca3af"
              className="w-full max-w-sm bg-input text-foreground px-4 py-3 rounded-lg border border-border mb-4"
              autoCapitalize="words"
            />

            <TouchableOpacity
              onPress={onJoin}
              disabled={isPending || !customerName.trim()}
              className={`w-full max-w-sm py-3 rounded-lg items-center ${
                isPending || !customerName.trim() ? 'bg-primary/60' : 'bg-primary'
              }`}
            >
              <Text className="text-primary-foreground font-medium">
                {isPending ? 'Uniendo...' : 'Unirse a la mesa'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onRetryScan} className="mt-4">
              <Text className="text-muted-foreground">Escanear de nuevo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
