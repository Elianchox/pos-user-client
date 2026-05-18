import { CameraPermissionGate } from '@/components/CameraPermissionGate'
import { JoinTableForm } from '@/components/JoinTableForm'
import { QrScanner } from '@/components/QrScanner'
import { useSession } from '@/context/SessionContext'
import { useJoinTable } from '@/hooks/api/useJoinTable'
import { parseQrUrl } from '@/utils/qr'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ScanScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const paramTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId
  const { token, saveToken, saveTableId, customerName: savedName, saveCustomerName } = useSession()
  const joinTableMutation = useJoinTable()
  const [scannedTableId, setScannedTableId] = useState<string | null>(paramTableId ?? null)
  const [customerName, setCustomerName] = useState(savedName ?? '')
  const [scanError, setScanError] = useState<string | null>(null)

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
    try {
      const result = await joinTableMutation.mutateAsync(
        { body: { tableId: scannedTableId, customerName: customerName || null }, signal: controller.signal },
      )
      await saveToken(result.data.token)
      saveCustomerName(customerName)
      router.replace('/order')
    } catch (error) {
      setScanError(`No se pudo unir a la mesa: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  return (
    <CameraPermissionGate>
      <SafeAreaView className="flex-1 bg-background">
        <View className="h-full">
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
            <QrScanner onBarcodeScanned={handleBarcodeScanned} />
          ) : (
            <JoinTableForm
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              onJoin={handleJoin}
              isPending={joinTableMutation.isPending}
              onRetryScan={() => setScannedTableId(null)}
            />
          )}
        </View>
      </SafeAreaView>
    </CameraPermissionGate>
  )
}
