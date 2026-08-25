import { useEffect, useState } from 'react'

import type { AnyPuzzleNode, PuzzleFlowEdge } from '../types'

export function useGraphSelection(nodes: AnyPuzzleNode[], edges: PuzzleFlowEdge[]) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null)
  const [isPlacingNode, setIsPlacingNode] = useState(false)
  const [ghostScreenPos, setGhostScreenPos] = useState<{ x: number; y: number } | null>(null)
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false)

  useEffect(() => {
    if (selectedNodeId && !nodes.some((n) => n.id === selectedNodeId)) {
      setSelectedNodeId(null)
    }
  }, [nodes, selectedNodeId])

  useEffect(() => {
    if (!selectedNodeId) {
      setIsDescriptionDialogOpen(false)
    }
  }, [selectedNodeId])

  useEffect(() => {
    if (selectedEdgeId && !edges.some((e) => e.id === selectedEdgeId)) {
      setSelectedEdgeId(null)
    }
  }, [edges, selectedEdgeId])

  useEffect(() => {
    if (selectedGroupId && !nodes.some((n) => n.id === selectedGroupId)) {
      setSelectedGroupId(null)
    }
  }, [nodes, selectedGroupId])

  return {
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
    isPlacingNode,
    setIsPlacingNode,
    ghostScreenPos,
    setGhostScreenPos,
    isDescriptionDialogOpen,
    setIsDescriptionDialogOpen,
  }
}
