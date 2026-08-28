import { useCallback, useEffect, useRef, useState } from 'react'

import { getGraph, patchGraph } from '../api/graphs'
import type { AnyPuzzleNode, GraphPatch, PuzzleFlowEdge, SerializedEdge, SerializedNode } from '../types'
import { serializeEdge, serializeNode, stableStringify } from '../utils/serializeGraph'

export type LoadState = 'loading' | 'ready' | 'not-found'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

const SAVE_DEBOUNCE_MS = 500
// A long uninterrupted editing session (e.g. dragging, or typing without a >500ms
// pause) still flushes at least this often.
const SAVE_MAX_WAIT_MS = 2500

type EntityMap = Map<string, string>

function indexById<T extends { id: string }>(items: T[], serialize: (item: T) => unknown): EntityMap {
  const map: EntityMap = new Map()
  for (const item of items) map.set(item.id, stableStringify(serialize(item)))
  return map
}

export function useGraphPersistence(
  id: string | undefined,
  nodes: AnyPuzzleNode[],
  edges: PuzzleFlowEdge[],
  setNodes: (nodes: AnyPuzzleNode[]) => void,
  setEdges: (edges: PuzzleFlowEdge[]) => void,
) {
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [name, setName] = useState('')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  // Latest editor state, readable from debounce/unload callbacks that fire later.
  // Kept in sync from an effect (see below) rather than during render.
  const latest = useRef({ name, nodes, edges })

  // Last successfully persisted snapshot, keyed by entity id -> stable JSON.
  const lastNodes = useRef<EntityMap>(new Map())
  const lastEdges = useRef<EntityMap>(new Map())
  const lastName = useRef('')

  const inFlight = useRef(false)
  const pending = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const revision = useRef(0)

  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const maxWaitTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const maxWaitArmed = useRef(false)

  function clearTimers() {
    clearTimeout(debounceTimer.current)
    clearTimeout(maxWaitTimer.current)
    maxWaitArmed.current = false
  }

  /**
   * Diff current editor state against the last persisted snapshot. Returns null
   * when nothing that gets persisted has changed - this is what makes selection,
   * hover and node-measurement churn (all stripped by serializeNode/Edge) free.
   */
  function computePatch() {
    const { name: curName, nodes: curNodes, edges: curEdges } = latest.current

    const nextNodes = indexById(curNodes, serializeNode)
    const upsertNodes: SerializedNode[] = []
    for (const node of curNodes) {
      const json = nextNodes.get(node.id)!
      if (lastNodes.current.get(node.id) !== json) upsertNodes.push(serializeNode(node))
    }
    const removeNodeIds = [...lastNodes.current.keys()].filter((nid) => !nextNodes.has(nid))

    const nextEdges = indexById(curEdges, serializeEdge)
    const upsertEdges: SerializedEdge[] = []
    for (const edge of curEdges) {
      const json = nextEdges.get(edge.id)!
      if (lastEdges.current.get(edge.id) !== json) upsertEdges.push(serializeEdge(edge))
    }
    const removeEdgeIds = [...lastEdges.current.keys()].filter((eid) => !nextEdges.has(eid))

    const nameChanged = curName !== lastName.current

    if (
      !nameChanged &&
      upsertNodes.length === 0 &&
      removeNodeIds.length === 0 &&
      upsertEdges.length === 0 &&
      removeEdgeIds.length === 0
    ) {
      return null
    }

    const patch: GraphPatch = {}
    if (nameChanged) patch.name = curName
    if (upsertNodes.length) patch.upsertNodes = upsertNodes
    if (removeNodeIds.length) patch.removeNodeIds = removeNodeIds
    if (upsertEdges.length) patch.upsertEdges = upsertEdges
    if (removeEdgeIds.length) patch.removeEdgeIds = removeEdgeIds

    return { patch, nextNodes, nextEdges, nextName: curName }
  }

  // All callers (debounce/maxWait timers, pagehide, manual save) go through this.
  // Stable per graph id; reads live state from refs.
  const flushNow = useCallback(
    (opts?: { keepalive?: boolean }) => {
      if (!id) return
      clearTimers()

      if (inFlight.current && !opts?.keepalive) {
        pending.current = true
        return
      }

      const result = computePatch()
      if (!result) {
        setSaveStatus((s) => (s === 'saving' ? 'saved' : s))
        return
      }
      const { patch, nextNodes, nextEdges, nextName } = result

      if (!opts?.keepalive) abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const rev = ++revision.current
      inFlight.current = true
      setSaveStatus('saving')

      patchGraph(id, patch, { signal: controller.signal, keepalive: opts?.keepalive })
        .then(() => {
          if (rev !== revision.current) return
          lastNodes.current = nextNodes
          lastEdges.current = nextEdges
          lastName.current = nextName
          setSaveStatus('saved')
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted) return
          console.warn('Graph-Speicherung fehlgeschlagen:', err)
          setSaveStatus('error')
        })
        .finally(() => {
          inFlight.current = false
          if (pending.current) {
            pending.current = false
            flushNow()
          }
        })
    },
    // computePatch/clearTimers are stable closures over refs; only `id` matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  )

  const scheduleSave = useCallback(() => {
    if (!id) return
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => flushNow(), SAVE_DEBOUNCE_MS)
    if (!maxWaitArmed.current) {
      maxWaitArmed.current = true
      maxWaitTimer.current = setTimeout(() => flushNow(), SAVE_MAX_WAIT_MS)
    }
  }, [id, flushNow])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoadState('loading')
    getGraph(id)
      .then((graph) => {
        if (cancelled) return
        // Edges saved before PuzzleNode had left/right handles have no handle id
        // (null/undefined). With multiple handles of the same type per node,
        // React Flow can no longer resolve an unset handle id and silently drops
        // the edge - default those to the old top/bottom pair.
        const loadedEdges: PuzzleFlowEdge[] = graph.edges.map((edge) => ({
          ...edge,
          type: 'puzzleEdge',
          sourceHandle: edge.sourceHandle ?? 'bottom',
          targetHandle: edge.targetHandle ?? 'top',
        }))
        setName(graph.name)
        setNodes(graph.nodes)
        setEdges(loadedEdges)
        // Seed the "last persisted" snapshot so the first autosave tick (and the
        // node-measurement churn right after mount) diffs clean.
        lastName.current = graph.name
        lastNodes.current = indexById(graph.nodes, serializeNode)
        lastEdges.current = indexById(loadedEdges, serializeEdge)
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('not-found')
      })
    return () => {
      cancelled = true
    }
  }, [id, setNodes, setEdges])

  useEffect(() => {
    latest.current = { name, nodes, edges }
    if (loadState !== 'ready') return
    scheduleSave()
  }, [name, nodes, edges, loadState, scheduleSave])

  // Flush the pending save when the tab is being hidden/closed. `keepalive` lets
  // the request outlive the page.
  useEffect(() => {
    const flushOnHide = () => flushNow({ keepalive: true })
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flushOnHide()
    }
    window.addEventListener('pagehide', flushOnHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('pagehide', flushOnHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [flushNow])

  useEffect(
    () => () => {
      clearTimers()
      abortRef.current?.abort()
    },
    [],
  )

  const handleSaveClick = useCallback(() => flushNow(), [flushNow])

  return { loadState, name, setName, saveStatus, handleSaveClick, flush: flushNow }
}
