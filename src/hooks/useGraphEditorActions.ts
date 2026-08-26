import { useCallback, useRef } from 'react'
import { addEdge, getNodesBounds, type Connection, type OnBeforeDelete, type ReactFlowInstance } from '@xyflow/react'

import { computeNearestHandlePair } from '../utils/edgeHandles'
import {
  GROUP_MIN_HEIGHT,
  GROUP_MIN_WIDTH,
  GROUP_PADDING,
  NODE_DEFAULT_HEIGHT,
  NODE_DEFAULT_WIDTH,
  paddedRect,
  unionRect,
  type Rect,
} from '../utils/groupLayout'
import {
  isGroupNode,
  isPuzzleNode,
  type AnyPuzzleNode,
  type NodeTypeDef,
  type PuzzleFlowEdge,
  type PuzzleFlowNode,
  type PuzzleGroupData,
  type PuzzleGroupNode,
  type PuzzleNodeData,
} from '../types'
import type { EdgeInspectorPatch } from '../components/EdgeInspector'

interface UseGraphEditorActionsArgs {
  nodes: AnyPuzzleNode[]
  edges: PuzzleFlowEdge[]
  nodeTypes: NodeTypeDef[]
  setNodes: (updater: AnyPuzzleNode[] | ((nds: AnyPuzzleNode[]) => AnyPuzzleNode[])) => void
  setEdges: (updater: PuzzleFlowEdge[] | ((eds: PuzzleFlowEdge[]) => PuzzleFlowEdge[])) => void
  commit: () => void
  commitDebounced: () => void
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  selectedEdgeId: string | null
  setSelectedEdgeId: (id: string | null) => void
  selectedGroupId: string | null
  setSelectedGroupId: (id: string | null) => void
  connectMode: boolean
  setConnectMode: (active: boolean) => void
  connectSourceId: string | null
  setConnectSourceId: (id: string | null) => void
  setIsPlacingNode: (active: boolean) => void
  setGhostScreenPos: (pos: { x: number; y: number } | null) => void
  setIsDescriptionDialogOpen: (open: boolean) => void
  requestConfirm: (title: string, message: string) => Promise<boolean>
  reactFlowInstanceRef: React.RefObject<ReactFlowInstance<AnyPuzzleNode, PuzzleFlowEdge> | null>
}

const NEW_NODE_DRAG_TYPE = 'application/adventurechart-node'

const transparentDragImage = (() => {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  // Chrome requires the drag image element to actually be in the document
  // (even off-screen) — an unattached canvas can abort the whole native
  // drag session instead of just falling back to the default thumbnail.
  canvas.style.position = 'fixed'
  canvas.style.top = '-9999px'
  canvas.style.left = '-9999px'
  canvas.style.pointerEvents = 'none'
  document.body.appendChild(canvas)
  return canvas
})()

export function useGraphEditorActions({
  nodes,
  nodeTypes,
  setNodes,
  setEdges,
  commit,
  commitDebounced,
  selectedNodeId,
  setSelectedNodeId,
  selectedEdgeId,
  setSelectedEdgeId,
  selectedGroupId,
  setSelectedGroupId,
  connectMode,
  setConnectMode,
  connectSourceId,
  setConnectSourceId,
  setIsPlacingNode,
  setGhostScreenPos,
  setIsDescriptionDialogOpen,
  requestConfirm,
  reactFlowInstanceRef,
}: UseGraphEditorActionsArgs) {
  const isDraggingNewNodeRef = useRef(false)

  const onConnect = useCallback(
    (connection: Connection) => {
      commit()
      const newEdgeId = crypto.randomUUID()
      setEdges((eds) => addEdge<PuzzleFlowEdge>({ ...connection, id: newEdgeId, type: 'smoothstep' }, eds))
      setSelectedNodeId(null)
      setSelectedEdgeId(newEdgeId)
    },
    [commit, setEdges, setSelectedNodeId, setSelectedEdgeId],
  )

  const handleStartPlacingNode = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setConnectMode(false)
    setConnectSourceId(null)
    setGhostScreenPos(null)
    setIsPlacingNode(true)
  }, [setSelectedNodeId, setSelectedEdgeId, setConnectMode, setConnectSourceId, setGhostScreenPos, setIsPlacingNode])

  const handlePlacementMouseMove = useCallback(
    (event: React.MouseEvent) => {
      setGhostScreenPos({ x: event.clientX, y: event.clientY })
    },
    [setGhostScreenPos],
  )

  const createNodeAtScreenPos = useCallback(
    (clientX: number, clientY: number) => {
      const instance = reactFlowInstanceRef.current
      if (!instance) return
      commit()
      const flowPos = instance.screenToFlowPosition({ x: clientX, y: clientY })
      const newNode: PuzzleFlowNode = {
        id: crypto.randomUUID(),
        type: 'puzzleNode',
        position: { x: flowPos.x - 80, y: flowPos.y - 30 },
        data: { label: 'Neuer Knoten', kind: nodeTypes[0]?.id ?? '' },
      }
      setNodes((nds) => [...nds, newNode])
      setSelectedEdgeId(null)
      setSelectedNodeId(newNode.id)
    },
    [commit, setNodes, reactFlowInstanceRef, setSelectedEdgeId, setSelectedNodeId, nodeTypes],
  )

  const handlePlacementClick = useCallback(
    (event: React.MouseEvent) => {
      createNodeAtScreenPos(event.clientX, event.clientY)
      setIsPlacingNode(false)
      setGhostScreenPos(null)
    },
    [createNodeAtScreenPos, setIsPlacingNode, setGhostScreenPos],
  )

  const handleNewNodeDragStart = useCallback(
    (event: React.DragEvent) => {
      event.dataTransfer.setData(NEW_NODE_DRAG_TYPE, 'puzzle')
      event.dataTransfer.effectAllowed = 'move'
      try {
        if (transparentDragImage) event.dataTransfer.setDragImage(transparentDragImage, 0, 0)
      } catch {
        // Cosmetic only: if the browser can't use our transparent drag image, it just
        // falls back to its default drag thumbnail. Placement must still proceed.
      }
      // Chromium silently cancels the drag session if the DOM mutates
      // synchronously while dragstart is still being dispatched (no
      // dragenter/dragover/drop ever fires). Defer the state update that
      // mounts the placement overlay until after the session is established.
      isDraggingNewNodeRef.current = true
      setTimeout(() => {
        if (isDraggingNewNodeRef.current) handleStartPlacingNode()
      }, 0)
    },
    [handleStartPlacingNode],
  )

  const handleNewNodeDragEnd = useCallback(
    (event: React.DragEvent) => {
      isDraggingNewNodeRef.current = false
      if (event.dataTransfer.dropEffect === 'none') {
        setIsPlacingNode(false)
        setGhostScreenPos(null)
      }
    },
    [setIsPlacingNode, setGhostScreenPos],
  )

  const handlePaneDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes(NEW_NODE_DRAG_TYPE)) return
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setGhostScreenPos({ x: event.clientX, y: event.clientY })
    },
    [setGhostScreenPos],
  )

  const handlePaneDrop = useCallback(
    (event: React.DragEvent) => {
      if (!event.dataTransfer.types.includes(NEW_NODE_DRAG_TYPE)) return
      event.preventDefault()
      createNodeAtScreenPos(event.clientX, event.clientY)
      setIsPlacingNode(false)
      setGhostScreenPos(null)
    },
    [createNodeAtScreenPos, setIsPlacingNode, setGhostScreenPos],
  )

  const handleNodeDataChange = useCallback(
    (patch: Partial<PuzzleNodeData>) => {
      if (!selectedNodeId) return
      commitDebounced()
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedNodeId && isPuzzleNode(n) ? { ...n, data: { ...n.data, ...patch } } : n)),
      )
    },
    [selectedNodeId, commitDebounced, setNodes],
  )

  const handleGroupDataChange = useCallback(
    (patch: Partial<PuzzleGroupData>) => {
      if (!selectedGroupId) return
      commitDebounced()
      setNodes((nds) =>
        nds.map((n) => (n.id === selectedGroupId && isGroupNode(n) ? { ...n, data: { ...n.data, ...patch } } : n)),
      )
    },
    [selectedGroupId, commitDebounced, setNodes],
  )

  const handleAssignGroup = useCallback(
    (groupId: string | null) => {
      if (!selectedNodeId) return
      commit()
      setNodes((nds) => {
        const node = nds.find((n) => n.id === selectedNodeId)
        if (!node || !isPuzzleNode(node)) return nds
        const oldParent = node.parentId ? nds.find((n) => n.id === node.parentId) : undefined
        const newParent = groupId ? nds.find((n) => n.id === groupId) : undefined
        const absolute = oldParent
          ? { x: node.position.x + oldParent.position.x, y: node.position.y + oldParent.position.y }
          : node.position

        if (!groupId || !newParent || !isGroupNode(newParent)) {
          return nds.map((n) =>
            n.id === selectedNodeId
              ? { ...n, parentId: undefined, extent: undefined, expandParent: undefined, position: absolute }
              : n,
          )
        }

        const groupRect: Rect = {
          x: newParent.position.x,
          y: newParent.position.y,
          width: newParent.width ?? GROUP_MIN_WIDTH,
          height: newParent.height ?? GROUP_MIN_HEIGHT,
        }
        const nodeWidth = node.measured?.width ?? node.width ?? NODE_DEFAULT_WIDTH
        const nodeHeight = node.measured?.height ?? node.height ?? NODE_DEFAULT_HEIGHT
        const childRect = paddedRect(absolute.x, absolute.y, nodeWidth, nodeHeight, GROUP_PADDING)
        const union = unionRect(groupRect, childRect)
        const originMoved = union.x !== groupRect.x || union.y !== groupRect.y

        return nds.map((n) => {
          if (n.id === groupId) {
            return { ...n, position: { x: union.x, y: union.y }, width: union.width, height: union.height }
          }
          if (n.id === selectedNodeId) {
            return {
              ...n,
              parentId: groupId,
              extent: 'parent' as const,
              expandParent: true,
              position: { x: absolute.x - union.x, y: absolute.y - union.y },
            }
          }
          if (originMoved && n.parentId === groupId) {
            const childAbsolute = { x: n.position.x + groupRect.x, y: n.position.y + groupRect.y }
            return { ...n, position: { x: childAbsolute.x - union.x, y: childAbsolute.y - union.y } }
          }
          return n
        })
      })
    },
    [selectedNodeId, commit, setNodes],
  )

  const handleJumpToGroup = useCallback(
    (groupId: string) => {
      const instance = reactFlowInstanceRef.current
      if (!instance) return
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
      setSelectedGroupId(groupId)
      instance.fitView({ nodes: [{ id: groupId }], padding: 0.3, duration: 450, maxZoom: 1.2 })
    },
    [reactFlowInstanceRef, setSelectedNodeId, setSelectedEdgeId, setSelectedGroupId],
  )

  const handleGroupSelectedNodes = useCallback(() => {
    const selected = nodes.filter((n): n is PuzzleFlowNode => isPuzzleNode(n) && !!n.selected)
    if (selected.length < 2) return
    commit()
    const bounds = getNodesBounds(selected)
    const groupId = crypto.randomUUID()
    const groupPosition = { x: bounds.x - GROUP_PADDING, y: bounds.y - GROUP_PADDING }
    const newGroup: PuzzleGroupNode = {
      id: groupId,
      type: 'groupNode',
      position: groupPosition,
      width: Math.max(bounds.width + GROUP_PADDING * 2, GROUP_MIN_WIDTH),
      height: Math.max(bounds.height + GROUP_PADDING * 2, GROUP_MIN_HEIGHT),
      data: { label: 'Neue Gruppe' },
    }
    const selectedIds = new Set(selected.map((n) => n.id))
    setNodes((nds) => [
      newGroup,
      ...nds.map((n) =>
        selectedIds.has(n.id)
          ? {
              ...n,
              parentId: groupId,
              extent: 'parent' as const,
              expandParent: true,
              position: { x: n.position.x - groupPosition.x, y: n.position.y - groupPosition.y },
              selected: false,
            }
          : n,
      ),
    ])
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setSelectedGroupId(groupId)
  }, [nodes, commit, setNodes, setSelectedNodeId, setSelectedEdgeId, setSelectedGroupId])

  const handleToggleGroupVisibility = useCallback(
    (groupId: string) => {
      commitDebounced()
      setNodes((nds) => {
        const group = nds.find((n) => n.id === groupId)
        if (!group || !isGroupNode(group)) return nds
        const nextHidden = !group.data.hidden
        return nds.map((n) => {
          if (n.id === groupId && isGroupNode(n)) return { ...n, data: { ...n.data, hidden: nextHidden } }
          if (n.parentId === groupId) return { ...n, hidden: nextHidden }
          return n
        })
      })
    },
    [commitDebounced, setNodes],
  )

  const performCascadeDeletion = useCallback(
    (explicitNodes: AnyPuzzleNode[], explicitEdges: PuzzleFlowEdge[], groupIds: string[]) => {
      commit()
      const groupIdSet = new Set(groupIds)
      const explicitIds = new Set(explicitNodes.map((n) => n.id))
      const childIds = nodes.filter((n) => n.parentId && groupIdSet.has(n.parentId)).map((n) => n.id)
      const removedIds = new Set([...explicitIds, ...groupIds, ...childIds])
      const removedEdgeIds = new Set(explicitEdges.map((e) => e.id))
      setNodes((nds) => nds.filter((n) => !removedIds.has(n.id)))
      setEdges((eds) => eds.filter((e) => !removedEdgeIds.has(e.id) && !removedIds.has(e.source) && !removedIds.has(e.target)))
      setSelectedGroupId(selectedGroupId && removedIds.has(selectedGroupId) ? null : selectedGroupId)
      setSelectedNodeId(selectedNodeId && removedIds.has(selectedNodeId) ? null : selectedNodeId)
    },
    [nodes, commit, setNodes, setEdges, selectedGroupId, setSelectedGroupId, selectedNodeId, setSelectedNodeId],
  )

  const handleGroupDelete = useCallback(async () => {
    if (!selectedGroupId) return
    const confirmed = await requestConfirm(
      'Gruppe löschen',
      'Die Gruppe und alle enthaltenen Knoten werden gelöscht. Dies kann nicht rückgängig gemacht werden.',
    )
    if (!confirmed) return
    performCascadeDeletion([], [], [selectedGroupId])
  }, [selectedGroupId, requestConfirm, performCascadeDeletion])

  const handleEdgeDataChange = useCallback(
    (patch: EdgeInspectorPatch) => {
      if (!selectedEdgeId) return
      commitDebounced()
      const { label, ...dataPatch } = patch
      setEdges((eds) =>
        eds.map((e) =>
          e.id === selectedEdgeId
            ? {
                ...e,
                ...(label !== undefined ? { label } : {}),
                data: { ...e.data, ...dataPatch },
              }
            : e,
        ),
      )
    },
    [selectedEdgeId, commitDebounced, setEdges],
  )

  const handleToggleConnectMode = useCallback(() => {
    setConnectMode(!connectMode)
    setConnectSourceId(null)
    setSelectedNodeId(null)
    setIsPlacingNode(false)
    setGhostScreenPos(null)
  }, [connectMode, setConnectMode, setConnectSourceId, setSelectedNodeId, setIsPlacingNode, setGhostScreenPos])

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: AnyPuzzleNode) => {
      if (isGroupNode(node)) {
        if (connectMode) return
        setSelectedNodeId(null)
        setSelectedEdgeId(null)
        setSelectedGroupId(node.id)
        return
      }
      if (!connectMode) {
        if (event.altKey) {
          setSelectedNodeId(null)
          setSelectedEdgeId(null)
          setConnectMode(true)
          setConnectSourceId(node.id)
          return
        }
        setSelectedEdgeId(null)
        setSelectedGroupId(null)
        setSelectedNodeId(node.id)
        return
      }
      if (!connectSourceId) {
        setConnectSourceId(node.id)
        return
      }
      if (node.id === connectSourceId) return
      commit()
      const sourceNode = nodes.find((n) => n.id === connectSourceId)
      const nodeById = new Map(nodes.map((n) => [n.id, n]))
      const handles = sourceNode
        ? computeNearestHandlePair(sourceNode, node, nodeById)
        : { sourceHandle: 'bottom' as const, targetHandle: 'top' as const }
      const newEdgeId = crypto.randomUUID()
      setEdges((eds) =>
        addEdge<PuzzleFlowEdge>(
          {
            id: newEdgeId,
            source: connectSourceId,
            target: node.id,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle,
            type: 'smoothstep',
          },
          eds,
        ),
      )
      setConnectMode(false)
      setConnectSourceId(null)
      setSelectedNodeId(null)
      setSelectedEdgeId(newEdgeId)
    },
    [
      connectMode,
      connectSourceId,
      nodes,
      commit,
      setEdges,
      setSelectedNodeId,
      setSelectedEdgeId,
      setSelectedGroupId,
      setConnectMode,
      setConnectSourceId,
    ],
  )

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: AnyPuzzleNode) => {
      if (isGroupNode(node) || connectMode) return
      setSelectedEdgeId(null)
      setSelectedGroupId(null)
      setSelectedNodeId(node.id)
      setIsDescriptionDialogOpen(true)
    },
    [connectMode, setSelectedNodeId, setSelectedEdgeId, setSelectedGroupId, setIsDescriptionDialogOpen],
  )

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: PuzzleFlowEdge) => {
      if (connectMode) return
      setSelectedNodeId(null)
      setSelectedEdgeId(edge.id)
    },
    [connectMode, setSelectedNodeId, setSelectedEdgeId],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
    setSelectedGroupId(null)
    if (connectMode) {
      setConnectMode(false)
      setConnectSourceId(null)
    }
  }, [connectMode, setSelectedNodeId, setSelectedEdgeId, setSelectedGroupId, setConnectMode, setConnectSourceId])

  const handleNodeDelete = useCallback(() => {
    if (!selectedNodeId) return
    commit()
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
    setSelectedNodeId(null)
  }, [selectedNodeId, commit, setNodes, setEdges, setSelectedNodeId])

  const handleEdgeDelete = useCallback(() => {
    if (!selectedEdgeId) return
    commit()
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId))
    setSelectedEdgeId(null)
  }, [selectedEdgeId, commit, setEdges, setSelectedEdgeId])

  const handleNodeDragStart = useCallback(() => {
    commit()
  }, [commit])

  const handleBeforeDelete = useCallback<OnBeforeDelete<AnyPuzzleNode, PuzzleFlowEdge>>(
    async ({ nodes: nodesToDelete, edges: edgesToDelete }) => {
      const groupIds = nodesToDelete.filter(isGroupNode).map((n) => n.id)
      if (groupIds.length === 0) {
        commit()
        return true
      }
      const confirmed = await requestConfirm(
        'Gruppe löschen',
        groupIds.length === 1
          ? 'Die Gruppe und alle enthaltenen Knoten werden gelöscht. Dies kann nicht rückgängig gemacht werden.'
          : `${groupIds.length} Gruppen und alle enthaltenen Knoten werden gelöscht.`,
      )
      if (!confirmed) return false
      performCascadeDeletion(nodesToDelete, edgesToDelete, groupIds)
      return false
    },
    [commit, requestConfirm, performCascadeDeletion],
  )

  return {
    onConnect,
    handleStartPlacingNode,
    handlePlacementMouseMove,
    handlePlacementClick,
    handleNewNodeDragStart,
    handleNewNodeDragEnd,
    handlePaneDragOver,
    handlePaneDrop,
    handleNodeDataChange,
    handleGroupDataChange,
    handleAssignGroup,
    handleGroupSelectedNodes,
    handleToggleGroupVisibility,
    handleJumpToGroup,
    performCascadeDeletion,
    handleGroupDelete,
    handleEdgeDataChange,
    handleToggleConnectMode,
    handleNodeClick,
    handleNodeDoubleClick,
    handleEdgeClick,
    handlePaneClick,
    handleNodeDelete,
    handleEdgeDelete,
    handleNodeDragStart,
    handleBeforeDelete,
  }
}
