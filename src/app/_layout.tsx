import { SessionProvider, useSession } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useDeepLink } from '@/hooks/useDeepLink'
import { setupForegroundNotificationHandler } from '@/services/notifications'
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import type { AppStateStatus } from 'react-native'
import { AppState, Platform } from 'react-native'

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

function NotificationHandler() {
  const router = useRouter()
  const { token } = useSession() 
  const responseListenerRef = useRef<Notifications.EventSubscription>(null)

  useEffect(() => {
    setupForegroundNotificationHandler()

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        router.replace('/order')
      },
    )

    const response = Notifications.getLastNotificationResponse()
    if (response != null && token) {
      router.replace('/order')
    }

    return () => {
      if (responseListenerRef.current) {
        responseListenerRef.current.remove()
      }
    }
  }, [router, token])

  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateHandler />
      <SessionProvider>
        <ThemeProvider>
          <DeepLinkHandler />
          <NotificationHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
