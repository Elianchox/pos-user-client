import { SessionProvider, useSession } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useDeepLink } from '@/hooks/useDeepLink'
import { setupForegroundNotificationHandler } from '@/services/notifications'
import { QueryClient, QueryClientProvider, focusManager, useQueryClient } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import * as WebBrowser from 'expo-web-browser'
import { Stack, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import type { AppStateStatus } from 'react-native'
import { Alert, AppState, Linking, Platform } from 'react-native'

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
  const queryClient = useQueryClient()
  const responseListenerRef = useRef<Notifications.EventSubscription>(null)

  useEffect(() => {
    setupForegroundNotificationHandler()

    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data

        if (data?.checkoutUrl && typeof data.checkoutUrl === 'string') {
          Alert.alert(
            'Pago online',
            '¿Cómo quieres abrir el enlace de pago?',
            [
              {
                text: 'En esta app',
                onPress: async () => {
                  const result = await WebBrowser.openAuthSessionAsync(data.checkoutUrl)
                  if (result.type === 'success') {
                    queryClient.invalidateQueries({ queryKey: ['orderDetail'] })
                  }
                },
              },
              {
                text: 'Navegador externo',
                onPress: () => {
                  Linking.openURL(data.checkoutUrl)
                },
              },
              { text: 'Cancelar', style: 'cancel' },
            ],
          )
        } else {
          router.replace('/order')
        }
      },
    )

    const lastResponse = Notifications.getLastNotificationResponse()
    if (lastResponse != null && token) {
      const data = lastResponse.notification.request.content.data
      if (data?.checkoutUrl && typeof data.checkoutUrl === 'string') {
        Alert.alert(
          'Pago online',
          '¿Cómo quieres abrir el enlace de pago?',
          [
            {
              text: 'En esta app',
              onPress: async () => {
                const result = await WebBrowser.openAuthSessionAsync(data.checkoutUrl)
                if (result.type === 'success') {
                  queryClient.invalidateQueries({ queryKey: ['orderDetail'] })
                }
              },
            },
            {
              text: 'Navegador externo',
              onPress: () => {
                Linking.openURL(data.checkoutUrl)
              },
            },
            { text: 'Cancelar', style: 'cancel' },
          ],
        )
      } else {
        router.replace('/order')
      }
    }

    return () => {
      if (responseListenerRef.current) {
        responseListenerRef.current.remove()
      }
    }
  }, [queryClient, router, token])

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
