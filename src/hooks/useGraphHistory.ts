import { useCallback, useRef } from 'react'
import type { AnyPuzzleNode, PuzzleFlowEdge } from '../types'

interface Snapshot {
  nodes: AnyPuzzleNode[]
  edges: PuzzleFlowEdge[]
}

const MAX_HISTORY = 50
const DEBOUNCE_MS = 500

export function useGraphHistory(
  nodes: AnyPuzzleNode[],
  edges: PuzzleFlowEdge[],
  setNodes: (nodes: AnyPuzzleNode[]) => void,
  setEdges: (edges: PuzzleFlowEdge[]) => void,
) {
  const past = useRef<Snapshot[]>([])
  const future = useRef<Snapshot[]>([])
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const debouncePending = useRef(false)

  const commit = useCallback(() => {
    past.current.push({ nodes, edges })
    if (past.current.length > MAX_HISTORY) past.current.shift()
    future.current = []
  }, [nodes, edges])

  const commitDebounced = useCallback(() => {
    if (!debouncePending.current) {
      commit()
      debouncePending.current = true
    }
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      debouncePending.current = false
    }, DEBOUNCE_MS)
  }, [commit])

  const undo = useCallback(() => {
    const previous = past.current.pop()
    if (!previous) return
    future.current.push({ nodes, edges })
    setNodes(previous.nodes)
    setEdges(previous.edges)
  }, [nodes, edges, setNodes, setEdges])

  const redo = useCallback(() => {
    const next = future.current.pop()
    if (!next) return
    past.current.push({ nodes, edges })
    setNodes(next.nodes)
    setEdges(next.edges)
  }, [nodes, edges, setNodes, setEdges])

  return { commit, commitDebounced, undo, redo }
}
