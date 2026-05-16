import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getToken, setToken, clearAll, setTableId, getTableId, getCustomerName, setCustomerName as persistCustomerName } from '@/services/session'

interface SessionContextType {
  token: string | null
  tableId: string | null
  customerName: string | null
  isLoading: boolean
  saveToken: (token: string) => Promise<void>
  removeToken: () => Promise<void>
  saveTableId: (id: string) => Promise<void>
  saveCustomerName: (name: string) => Promise<void>
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null)
  const [tableId, setTableIdState] = useState<string | null>(null)
  const [customerName, setCustomerNameState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getToken(), getTableId(), getCustomerName()]).then(([t, tid, name]) => {
      setTokenState(t)
      setTableIdState(tid)
      setCustomerNameState(name)
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
    setCustomerNameState(null)
  }, [])

  const saveTableId = useCallback(async (id: string) => {
    await setTableId(id)
    setTableIdState(id)
  }, [])

  const saveCustomerName = useCallback(async (name: string) => {
    await persistCustomerName(name)
    setCustomerNameState(name)
  }, [])

  return (
    <SessionContext.Provider value={{ token, tableId, customerName, isLoading, saveToken, removeToken, saveTableId, saveCustomerName }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
