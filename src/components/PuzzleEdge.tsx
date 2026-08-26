import {
  BaseEdge,
  getSmoothStepPath,
  useEdges,
  useInternalNode,
  useStore,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react'
import { pointOnSide, type HandleSide } from '../utils/edgeHandles'
import { NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH } from '../utils/groupLayout'
import type { AnyPuzzleNode, PuzzleFlowEdge } from '../types'

function rectOf(node: InternalNode<AnyPuzzleNode>) {
  return {
    x: node.internals.positionAbsolute.x,
    y: node.internals.positionAbsolute.y,
    width: node.measured?.width ?? NODE_DEFAULT_WIDTH,
    height: node.measured?.height ?? NODE_DEFAULT_HEIGHT,
  }
}

function crossAxisValue(rect: ReturnType<typeof rectOf>, side: HandleSide) {
  return side === 'top' || side === 'bottom' ? rect.x + rect.width / 2 : rect.y + rect.height / 2
}

// Multiple edges can resolve to the same (node, side) — e.g. an edge ending on a node's
// right side and another edge starting from that same right side. Spread them evenly along
// the side instead of letting them stack on the exact same pixel. A lone edge on a side still
// gets t=0.5 (today's exact center), so this is a no-op for the common single-edge case.
function computeSlotT(
  nodeId: string,
  side: HandleSide,
  edgeId: string,
  allEdges: PuzzleFlowEdge[],
  nodeLookup: Map<string, InternalNode<AnyPuzzleNode>>,
): number {
  const siblings = allEdges.filter(
    (e) => (e.source === nodeId && e.sourceHandle === side) || (e.target === nodeId && e.targetHandle === side),
  )
  const withKey = siblings.map((e) => {
    const otherId = e.source === nodeId ? e.target : e.source
    const otherNode = nodeLookup.get(otherId)
    return { id: e.id, key: otherNode ? crossAxisValue(rectOf(otherNode), side) : 0 }
  })
  withKey.sort((a, b) => a.key - b.key || a.id.localeCompare(b.id))
  const index = withKey.findIndex((s) => s.id === edgeId)
  return (index + 1) / (withKey.length + 1)
}

export function PuzzleEdge({
  id,
  source,
  target,
  sourceHandleId,
  targetHandleId,
  sourcePosition,
  targetPosition,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
  style,
  markerEnd,
  markerStart,
}: EdgeProps<PuzzleFlowEdge>) {
  const sourceInternal = useInternalNode<AnyPuzzleNode>(source)
  const targetInternal = useInternalNode<AnyPuzzleNode>(target)
  const edges = useEdges<PuzzleFlowEdge>()
  const nodeLookup = useStore((s) => s.nodeLookup) as Map<string, InternalNode<AnyPuzzleNode>>

  if (!sourceInternal || !targetInternal || !sourceHandleId || !targetHandleId) return null

  const sourceSide = sourceHandleId as HandleSide
  const targetSide = targetHandleId as HandleSide
  const sourceT = computeSlotT(source, sourceSide, id, edges, nodeLookup)
  const targetT = computeSlotT(target, targetSide, id, edges, nodeLookup)
  const { x: sourceX, y: sourceY } = pointOnSide(rectOf(sourceInternal), sourceSide, sourceT)
  const { x: targetX, y: targetY } = pointOnSide(rectOf(targetInternal), targetSide, targetT)

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={path}
      labelX={labelX}
      labelY={labelY}
      label={label}
      labelStyle={labelStyle}
      labelShowBg={labelShowBg}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
      style={style}
      markerEnd={markerEnd}
      markerStart={markerStart}
    />
  )
}
