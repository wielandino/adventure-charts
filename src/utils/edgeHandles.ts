import type { AnyPuzzleNode } from '../types'
import { NODE_DEFAULT_HEIGHT, NODE_DEFAULT_WIDTH } from './groupLayout'

export type HandleSide = 'top' | 'left' | 'bottom' | 'right'

const SIDES: HandleSide[] = ['top', 'left', 'bottom', 'right']

function resolveAbsoluteRect(node: AnyPuzzleNode, nodeById: Map<string, AnyPuzzleNode>) {
  const width = node.measured?.width ?? node.width ?? NODE_DEFAULT_WIDTH
  const height = node.measured?.height ?? node.height ?? NODE_DEFAULT_HEIGHT
  let x = node.position.x
  let y = node.position.y
  if (node.parentId) {
    const parent = nodeById.get(node.parentId)
    if (parent) {
      x += parent.position.x
      y += parent.position.y
    }
  }
  return { x, y, width, height }
}

function sideMidpoint(rect: { x: number; y: number; width: number; height: number }, side: HandleSide) {
  switch (side) {
    case 'top':
      return { x: rect.x + rect.width / 2, y: rect.y }
    case 'bottom':
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    case 'left':
      return { x: rect.x, y: rect.y + rect.height / 2 }
    case 'right':
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
  }
}

export function computeNearestHandlePair(
  sourceNode: AnyPuzzleNode,
  targetNode: AnyPuzzleNode,
  nodeById: Map<string, AnyPuzzleNode>,
): { sourceHandle: HandleSide; targetHandle: HandleSide } {
  const sourceRect = resolveAbsoluteRect(sourceNode, nodeById)
  const targetRect = resolveAbsoluteRect(targetNode, nodeById)

  let bestSource: HandleSide = 'bottom'
  let bestTarget: HandleSide = 'top'
  let bestDistSq = Infinity

  for (const s of SIDES) {
    const sp = sideMidpoint(sourceRect, s)
    for (const t of SIDES) {
      const tp = sideMidpoint(targetRect, t)
      const dx = sp.x - tp.x
      const dy = sp.y - tp.y
      const distSq = dx * dx + dy * dy
      if (distSq < bestDistSq) {
        bestDistSq = distSq
        bestSource = s
        bestTarget = t
      }
    }
  }
  return { sourceHandle: bestSource, targetHandle: bestTarget }
}
