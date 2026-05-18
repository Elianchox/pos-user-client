import { createContext, useContext } from 'react'
import { View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useAppTheme } from '@/theme/useAppTheme'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme: themeObj, isDark } = useAppTheme()
  const theme: Theme = isDark ? 'dark' : 'light'

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <View style={{ flex: 1, backgroundColor: themeObj.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </View>
    </ThemeContext.Provider>
  )
}
