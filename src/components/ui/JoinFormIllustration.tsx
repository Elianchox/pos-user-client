import { useColorScheme } from "react-native"
import JoinFormDark from "@/assets/images/join-form-dark.svg"
import JoinFormLight from "@/assets/images/join-form-light.svg"

const ILLUSTRATION_HEIGHT = 160

export function JoinFormIllustration() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const Illustration = isDark ? JoinFormDark : JoinFormLight

  return <Illustration width="100%" height={ILLUSTRATION_HEIGHT} />
}
