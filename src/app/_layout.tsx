import '../global.css'

import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from '@/context/SessionContext'
import { ThemeProvider } from '@/context/ThemeContext'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
