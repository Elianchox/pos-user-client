import { CameraPermissionGate } from '@/components/CameraPermissionGate'
import { JoinTableForm } from '@/components/JoinTableForm'
import { QrScanner } from '@/components/QrScanner'
import { useSession } from '@/context/SessionContext'
import { useJoinTable } from '@/hooks/api/useJoinTable'
import { makeStyles } from '@/theme/makeStyles'
import { parseQrUrl } from '@/utils/qr'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const useStyles = makeStyles((t) => ({
  safeArea: {
    flex: 1,
    backgroundColor: t.background,
  },
  container: {
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  backButton: {
    marginRight: t.spacing[3],
  },
  backText: {
    fontSize: 24,
    color: t.foreground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: t.foreground,
  },
  errorContainer: {
    marginHorizontal: t.spacing[4],
    marginTop: t.spacing[3],
    padding: t.spacing[3],
    borderRadius: t.radii.lg,
    borderWidth: 1,
    borderColor: t.destructive,
  },
  errorText: {
    fontSize: 14,
    color: t.destructive,
    textAlign: 'center',
  },
}))

export default function ScanScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const paramTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId
  const { token, saveToken, saveTableId, customerName: savedName, saveCustomerName } = useSession()
  const joinTableMutation = useJoinTable()
  const [scannedTableId, setScannedTableId] = useState<string | null>(paramTableId ?? null)
  const [customerName, setCustomerName] = useState(savedName ?? '')
  const [scanError, setScanError] = useState<string | null>(null)
  const styles = useStyles()

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Escanear QR</Text>
          </View>

          {scanError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{scanError}</Text>
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
