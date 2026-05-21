import { useColorScheme } from "react-native"
import ThankYouDark from "@/assets/images/thank-you-dark.svg"
import ThankYouLight from "@/assets/images/thank-you-light.svg"

const ILLUSTRATION_HEIGHT = 180

export function ThankYouIllustration() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const Illustration = isDark ? ThankYouDark : ThankYouLight

  return <Illustration width="100%" height={ILLUSTRATION_HEIGHT} />
}
