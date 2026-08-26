import type { TypeConfig } from '../types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export function getTypeConfig(): Promise<TypeConfig> {
  return request('/api/types')
}

export function saveTypeConfig(config: TypeConfig): Promise<TypeConfig> {
  return request('/api/types', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
}
