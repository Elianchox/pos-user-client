const DEEPLINK_PATH = '/deeplink/table/'
const ALLOWED_HOSTS = ['pos.eliancho.dev', '172.20.10.4:3000']

export interface ParsedQrUrl {
  tableId: string
}

export function parseQrUrl(url: string): ParsedQrUrl | null {
  try {
    const parsed = new URL(url)

    if (!ALLOWED_HOSTS.includes(parsed.host)) {
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
