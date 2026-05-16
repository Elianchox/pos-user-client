import { useState } from 'react'
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useJoinTable } from '@/hooks/api/useJoinTable'
import { useSession } from '@/context/SessionContext'
import { parseQrUrl } from '@/utils/qr'

export default function ScanScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const paramTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId
  const { token, saveTableId } = useSession()
  const joinTableMutation = useJoinTable()
  const [permission, requestPermission] = useCameraPermissions()
  const [scannedTableId, setScannedTableId] = useState<string | null>(paramTableId ?? null)
  const [customerName, setCustomerName] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-lg text-foreground text-center mb-4">
          Necesitamos permiso para acceder a la cámara y escanear el código QR.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-primary-foreground font-medium">Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedTableId || joinTableMutation.isPending) return

    const parsed = parseQrUrl(data)
    if (!parsed) {
      setScanError('Código QR no válido. Intenta con otro.')
      return
    }

    setScanError(null)

    if (token) {
      saveTableId(parsed.tableId)
      router.replace('/order')
    } else {
      setScannedTableId(parsed.tableId)
    }
  }

  const handleJoin = async () => {
    if (!scannedTableId) return

    const controller = new AbortController()
    joinTableMutation.mutate(
      { body: { tableId: scannedTableId, customerName: customerName || null }, signal: controller.signal },
      {
        onSuccess: () => {
          router.replace('/order')
        },
        onError: () => {
          setScanError('No se pudo unir a la mesa. Intenta de nuevo.')
        },
      },
    )
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Text className="text-2xl text-foreground">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">Escanear QR</Text>
      </View>

      {scanError && (
        <View className="mx-4 mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <Text className="text-sm text-destructive text-center">{scanError}</Text>
        </View>
      )}

      {!scannedTableId ? (
        <View className="flex-1 relative">
          <CameraView
            className="flex-1"
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View className="absolute inset-0 pointer-events-none items-center justify-center">
            <View className="w-64 h-64 border-2 border-white/50 rounded-xl" />
          </View>
          <Text className="absolute bottom-8 left-0 right-0 text-center text-white text-sm bg-black/40 py-2">
            Enfoca el código QR de tu mesa
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-6 py-8 items-center justify-center">
          <Text className="text-2xl mb-2">👋</Text>
          <Text className="text-lg font-semibold text-foreground mb-1">Bienvenido</Text>
          <Text className="text-muted-foreground text-center mb-6">
            Ingresa tu nombre para continuar (opcional)
          </Text>

          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Tu nombre"
            placeholderTextColor="#9ca3af"
            className="w-full max-w-sm bg-input text-foreground px-4 py-3 rounded-lg border border-border mb-4"
            autoCapitalize="words"
          />

          <TouchableOpacity
            onPress={handleJoin}
            disabled={joinTableMutation.isPending}
            className={`w-full max-w-sm py-3 rounded-lg items-center ${
              joinTableMutation.isPending ? 'bg-muted' : 'bg-primary'
            }`}
          >
            <Text className="text-primary-foreground font-medium">
              {joinTableMutation.isPending ? 'Uniendo...' : 'Unirse a la mesa'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScannedTableId(null)} className="mt-4">
            <Text className="text-muted-foreground">Escanear de nuevo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
