import { useMemo } from 'react'
import { MarkerType } from '@xyflow/react'

import { findCycleMembership, findIsolatedNodeIds } from '../utils/graphValidation'
import { edgeKindColors, edgeKindHex, statusDangerHex } from '../utils/graphEditorVisuals'
import { isGroupNode, isPuzzleNode, type AnyPuzzleNode, type PuzzleFlowEdge } from '../types'

export function useGraphDerivedState(
  nodes: AnyPuzzleNode[],
  edges: PuzzleFlowEdge[],
  selectedNodeId: string | null,
  selectedEdgeId: string | null,
  selectedGroupId: string | null,
  resolvedTheme: 'light' | 'dark',
) {
  const selectedNode = useMemo(() => {
    const found = nodes.find((n) => n.id === selectedNodeId)
    return found && isPuzzleNode(found) ? found : null
  }, [nodes, selectedNodeId])

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  )

  const selectedGroup = useMemo(() => {
    const found = nodes.find((n) => n.id === selectedGroupId)
    return found && isGroupNode(found) ? found : null
  }, [nodes, selectedGroupId])

  const puzzleOnlyNodes = useMemo(() => nodes.filter(isPuzzleNode), [nodes])
  const groupNodes = useMemo(() => nodes.filter(isGroupNode), [nodes])
  const eligibleForGrouping = useMemo(() => puzzleOnlyNodes.filter((n) => n.selected), [puzzleOnlyNodes])
  const hiddenNodeIds = useMemo(() => new Set(nodes.filter((n) => n.hidden).map((n) => n.id)), [nodes])

  const { cycleNodeIds, cycleEdgeIds } = useMemo(
    () => findCycleMembership(puzzleOnlyNodes, edges),
    [puzzleOnlyNodes, edges],
  )

  const isolatedNodeIds = useMemo(
    () => findIsolatedNodeIds(puzzleOnlyNodes, edges),
    [puzzleOnlyNodes, edges],
  )

  const displayEdges = useMemo(
    () =>
      edges
        .filter((e) => !hiddenNodeIds.has(e.source) && !hiddenNodeIds.has(e.target))
        .map((edge) => {
          if (cycleEdgeIds.has(edge.id)) {
            return {
              ...edge,
              style: { stroke: 'var(--status-danger)', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: statusDangerHex[resolvedTheme] },
              animated: true,
            }
          }
          const kind = edge.data?.kind ?? 'requires'
          return {
            ...edge,
            style: { stroke: edgeKindColors[kind], strokeWidth: 1.75 },
            markerEnd: { type: MarkerType.ArrowClosed, color: edgeKindHex[resolvedTheme][kind] },
            labelBgPadding: [6, 4] as [number, number],
            labelBgBorderRadius: 6,
            labelStyle: { fill: '#1a1420', fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: edgeKindHex[resolvedTheme][kind], fillOpacity: 0.9 },
          }
        }),
    [edges, hiddenNodeIds, cycleEdgeIds, resolvedTheme],
  )

  return {
    selectedNode,
    selectedEdge,
    selectedGroup,
    puzzleOnlyNodes,
    groupNodes,
    eligibleForGrouping,
    hiddenNodeIds,
    cycleNodeIds,
    cycleEdgeIds,
    isolatedNodeIds,
    displayEdges,
  }
}
