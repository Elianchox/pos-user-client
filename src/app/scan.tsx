import { CameraPermissionGate } from '@/components/CameraPermissionGate'
import { JoinTableForm } from '@/components/JoinTableForm'
import { QrScanner } from '@/components/QrScanner'
import { useSession } from '@/context/SessionContext'
import { useDeviceId } from '@/hooks/api/useDeviceId'
import { useJoinTable } from '@/hooks/api/useJoinTable'
import { getExpoPushToken } from '@/services/notifications'
import { makeStyles } from '@/theme/makeStyles'
import { parseQrUrl } from '@/utils/qr'
import { useQueryClient } from '@tanstack/react-query'
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
    marginVertical: t.spacing[3],
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
  const queryClient = useQueryClient()
  const params = useLocalSearchParams()
  const paramTableId = Array.isArray(params.tableId) ? params.tableId[0] : params.tableId
  const { token, saveToken, saveTableId, customerName: savedName, saveCustomerName } = useSession()
  const joinTableMutation = useJoinTable()
  const [scannedTableId, setScannedTableId] = useState<string | null>(paramTableId ?? null)
  const [customerName, setCustomerName] = useState(savedName ?? '')
  const [scanError, setScanError] = useState<string | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const deviceId = useDeviceId()
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
      queryClient.removeQueries({ queryKey: ['orderDetail'] })
      router.replace('/order')
    } else {
      setScannedTableId(parsed.tableId)
    }
  }

  const handleJoin = async () => {
    if (!scannedTableId || isJoining) return
    setIsJoining(true)

    const controller = new AbortController()
    try {
      const pushToken = await getExpoPushToken()
      const result = await joinTableMutation.mutateAsync(
        {
          body: { tableId: scannedTableId, customerName: customerName || null, pushToken, deviceId: deviceId! },
          signal: controller.signal,
        },
      )
      await saveToken(result.data.token)
      saveCustomerName(customerName)
      await queryClient.removeQueries({ queryKey: ['orderDetail'] })
      router.replace('/order')
    } catch (error) {
      setScanError(`No se pudo unir a la mesa: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsJoining(false)
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
              isPending={isJoining || joinTableMutation.isPending}
              onRetryScan={() => setScannedTableId(null)}
            />
          )}
        </View>
      </SafeAreaView>
    </CameraPermissionGate>
  )
}
