import { getDeviceId, setDeviceId as persistDeviceId } from '@/services/session'
import { randomUUID } from 'expo-crypto'
import { useEffect, useState } from 'react'

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    getDeviceId().then((id) => {
      if (id) {
        setDeviceId(id)
      } else {
        const newId = randomUUID()
        persistDeviceId(newId)
        setDeviceId(newId)
      }
    })
  }, [])

  return deviceId
}
