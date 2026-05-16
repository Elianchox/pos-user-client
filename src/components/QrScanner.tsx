import { CameraView } from 'expo-camera'
import { Text, View } from 'react-native'

interface QrScannerProps {
  onBarcodeScanned: ({ data }: { data: string }) => void
}

export function QrScanner({ onBarcodeScanned }: QrScannerProps) {
  return (
    <View className="flex-1 relative">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={onBarcodeScanned}
      />
      <View className="absolute inset-0 pointer-events-none items-center justify-center">
        <View className="w-64 h-64 border-2 border-white/50 rounded-xl" />
      </View>
      <Text className="absolute bottom-8 left-0 right-0 text-center text-white text-sm bg-black/40 py-2">
        Enfoca el código QR de tu mesa
      </Text>
    </View>
  )
}
