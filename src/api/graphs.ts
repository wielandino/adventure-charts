import type { Edge } from '@xyflow/react'
import type { AnyPuzzleNode, GraphFile, GraphMeta, GraphPatch, SaveAck } from '../types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    throw new Error(`Request to ${url} failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function listGraphs(): Promise<GraphMeta[]> {
  return request('/api/graphs')
}

export function createGraph(): Promise<GraphFile> {
  return request('/api/graphs', { method: 'POST' })
}

export function getGraph(id: string): Promise<GraphFile> {
  return request(`/api/graphs/${id}`)
}

export function saveGraph(
  id: string,
  data: { name: string; nodes: AnyPuzzleNode[]; edges: Edge[] },
  opts?: { signal?: AbortSignal },
): Promise<SaveAck> {
  return request(`/api/graphs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal: opts?.signal,
  })
}

/**
 * Incremental save: only the entities that changed since the last persisted
 * snapshot. `keepalive` lets a final flush survive tab close (pagehide).
 */
export function patchGraph(
  id: string,
  patch: GraphPatch,
  opts?: { signal?: AbortSignal; keepalive?: boolean },
): Promise<SaveAck> {
  return request(`/api/graphs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
    signal: opts?.signal,
    keepalive: opts?.keepalive,
  })
}

export function deleteGraph(id: string): Promise<void> {
  return request(`/api/graphs/${id}`, { method: 'DELETE' })
}
