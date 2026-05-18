import { CameraView } from 'expo-camera'
import { Text, View } from 'react-native'
import { makeStyles } from '@/theme/makeStyles'

interface QrScannerProps {
  onBarcodeScanned: ({ data }: { data: string }) => void
}

const useStyles = makeStyles((t) => ({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 256,
    height: 256,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: t.radii.xl,
  },
  bottomLabel: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: t.spacing[2],
  },
}))

export function QrScanner({ onBarcodeScanned }: QrScannerProps) {
  const styles = useStyles()

  return (
    <View style={styles.container}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scannerFrame} />
      </View>
      <Text style={styles.bottomLabel}>
        Enfoca el código QR de tu mesa
      </Text>
    </View>
  )
}
