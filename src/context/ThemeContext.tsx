import { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'

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
  const systemScheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>(systemScheme ?? 'light')

  useEffect(() => {
    setTheme(systemScheme ?? 'light')
  }, [systemScheme])

  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      <View className={`flex-1 bg-background ${isDark ? 'dark' : ''}`}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        {children}
      </View>
    </ThemeContext.Provider>
  )
}
