import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useDeepLink } from '@/hooks/useDeepLink'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { AppState, Platform } from 'react-native'
import type { AppStateStatus } from 'react-native'

const queryClient = new QueryClient()

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active')
  }
}

function AppStateHandler() {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange)
    return () => subscription.remove()
  }, [])

  return null
}

function DeepLinkHandler() {
  useDeepLink()
  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateHandler />
      <SessionProvider>
        <ThemeProvider>
          <DeepLinkHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
