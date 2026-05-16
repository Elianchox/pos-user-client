import { API_BASE_URL } from '@/constants/api'
import { getToken } from '@/services/session'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API Error ${status}`)
    this.name = 'ApiError'
  }
}

type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: Record<string, unknown> | null
}

export async function apiFetch<T>(
  path: string,
  config: RequestConfig = {},
  signal?: AbortSignal,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const token = await getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(config.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...config,
    headers,
    body: config.body ? JSON.stringify(config.body) : undefined,
    signal,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new ApiError(response.status, error)
  }

  return response.json() as Promise<T>
}
