import { useColorScheme } from "react-native"
import CameraPermissionDark from "@/assets/images/camera-permission-dark.svg"
import CameraPermissionLight from "@/assets/images/camera-permission-light.svg"

const ILLUSTRATION_HEIGHT = 200

export function CameraPermissionIllustration() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const Illustration = isDark ? CameraPermissionDark : CameraPermissionLight

  return <Illustration width="100%" height={ILLUSTRATION_HEIGHT} />
}