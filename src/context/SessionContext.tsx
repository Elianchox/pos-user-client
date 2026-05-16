import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getToken, setToken, clearAll, setTableId, getTableId } from '@/services/session'

interface SessionContextType {
  token: string | null
  tableId: string | null
  isLoading: boolean
  saveToken: (token: string) => Promise<void>
  removeToken: () => Promise<void>
  saveTableId: (id: string) => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [tableId, setTableIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getToken(), getTableId()]).then(([t, tid]) => {
      setTokenState(t)
      setTableIdState(tid)
      setIsLoading(false)
    })
  }, [])

  const saveToken = useCallback(async (newToken: string) => {
    await setToken(newToken)
    setTokenState(newToken)
  }, [])

  const removeToken = useCallback(async () => {
    await clearAll()
    setTokenState(null)
    setTableIdState(null)
  }, [])

  const saveTableId = useCallback(async (id: string) => {
    await setTableId(id)
    setTableIdState(id)
  }, [])

  return (
    <SessionContext.Provider value={{ token, tableId, isLoading, saveToken, removeToken, saveTableId }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
