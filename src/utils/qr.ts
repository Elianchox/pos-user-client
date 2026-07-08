import { QR_ALLOWED_HOSTS } from '@/constants/api'

const DEEPLINK_PATH = '/deeplink/table/'

export interface ParsedQrUrl {
  tableId: string
}

export function parseQrUrl(url: string): ParsedQrUrl | null {
  try {
    const parsed = new URL(url)

    if (!QR_ALLOWED_HOSTS.includes(parsed.host)) {
      return null
    }

    const path = parsed.pathname
    if (!path.startsWith(DEEPLINK_PATH)) {
      return null
    }

    const tableId = path.slice(DEEPLINK_PATH.length)
    if (!tableId || tableId.includes('/')) {
      return null
    }

    return { tableId }
  } catch {
    return null
  }
}
