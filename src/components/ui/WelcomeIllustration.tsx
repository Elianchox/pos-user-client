import WelcomeHeroDark from "@/assets/images/welcome-hero-dark.svg"
import WelcomeHeroLight from "@/assets/images/welcome-hero-light.svg"
import { StyleProp, useColorScheme, ViewStyle } from "react-native"

const ILLUSTRATION_HEIGHT = 220

export function WelcomeIllustration({ style }: { style?: StyleProp<ViewStyle> }) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const Illustration = isDark ? WelcomeHeroDark : WelcomeHeroLight

  return <Illustration width="100%" height={ILLUSTRATION_HEIGHT} style={style} />
}
