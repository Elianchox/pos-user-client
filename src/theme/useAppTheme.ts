import { useColorScheme } from "react-native"
import { lightTheme, darkTheme } from "./colors"
import type { AppTheme } from "./types"

export function useAppTheme(): { theme: AppTheme; isDark: boolean } {
  const scheme = useColorScheme()
  const isDark = scheme === "dark"
  const theme = isDark ? darkTheme : lightTheme
  return { theme, isDark }
}
