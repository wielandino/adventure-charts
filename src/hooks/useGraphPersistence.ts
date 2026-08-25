import { useCallback, useEffect, useRef, useState } from 'react'

import { getGraph, saveGraph } from '../api/graphs'
import type { AnyPuzzleNode, PuzzleFlowEdge } from '../types'

export type LoadState = 'loading' | 'ready' | 'not-found'

export function useGraphPersistence(
  id: string | undefined,
  nodes: AnyPuzzleNode[],
  edges: PuzzleFlowEdge[],
  setNodes: (nodes: AnyPuzzleNode[]) => void,
  setEdges: (edges: PuzzleFlowEdge[]) => void,
) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [name, setName] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const skipNextSave = useRef(true)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoadState('loading')
    getGraph(id)
      .then((graph) => {
        if (cancelled) return
        setName(graph.name)
        setNodes(graph.nodes)
        // Edges saved before PuzzleNode had left/right handles have no handle id (null/undefined).
        // With multiple handles of the same type per node, React Flow can no longer resolve an
        // unset handle id and silently drops the edge — default those to the old top/bottom pair.
        setEdges(
          graph.edges.map((edge) => ({
            ...edge,
            sourceHandle: edge.sourceHandle ?? 'bottom',
            targetHandle: edge.targetHandle ?? 'top',
          })),
        )
        skipNextSave.current = true
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('not-found')
      })
    return () => {
      cancelled = true
    }
  }, [id, setNodes, setEdges])

  const persistGraph = useCallback(
    (nextName: string, nextNodes: AnyPuzzleNode[], nextEdges: PuzzleFlowEdge[]) => {
      if (!id) return
      setSaveStatus('saving')
      return saveGraph(id, { name: nextName, nodes: nextNodes, edges: nextEdges }).then(() => {
        setSaveStatus('saved')
      })
    },
    [id],
  )

  const scheduleSave = useCallback(
    (nextName: string, nextNodes: AnyPuzzleNode[], nextEdges: PuzzleFlowEdge[]) => {
      if (!id) return
      if (skipNextSave.current) {
        skipNextSave.current = false
        return
      }
      clearTimeout(saveTimeout.current)
      saveTimeout.current = setTimeout(() => {
        persistGraph(nextName, nextNodes, nextEdges)
      }, 800)
    },
    [id, persistGraph],
  )

  useEffect(() => {
    if (loadState !== 'ready') return
    scheduleSave(name, nodes, edges)
  }, [name, nodes, edges, loadState, scheduleSave])

  const handleSaveClick = useCallback(() => {
    clearTimeout(saveTimeout.current)
    persistGraph(name, nodes, edges)
  }, [name, nodes, edges, persistGraph])

  return { loadState, name, setName, saveStatus, handleSaveClick }
}
