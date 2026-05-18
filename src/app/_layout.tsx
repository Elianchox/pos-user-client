import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { useDeepLink } from '@/hooks/useDeepLink'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'

const queryClient = new QueryClient()

function DeepLinkHandler() {
  useDeepLink()
  return null
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <DeepLinkHandler />
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
