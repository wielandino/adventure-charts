import type { Edge, Node } from '@xyflow/react'

export type PuzzleNodeKind = 'puzzle' | 'item' | 'location'

export interface PuzzleNodeData extends Record<string, unknown> {
  label: string
  kind: PuzzleNodeKind
  color?: string
  description?: string
  notes?: string
}

export type PuzzleFlowNode = Node<PuzzleNodeData, 'puzzleNode'>

export interface PuzzleGroupData extends Record<string, unknown> {
  label: string
  color?: string
  hidden?: boolean
}

export type PuzzleGroupNode = Node<PuzzleGroupData, 'groupNode'>

export type AnyPuzzleNode = PuzzleFlowNode | PuzzleGroupNode

export function isPuzzleNode(node: AnyPuzzleNode): node is PuzzleFlowNode {
  return node.type === 'puzzleNode'
}

export function isGroupNode(node: AnyPuzzleNode): node is PuzzleGroupNode {
  return node.type === 'groupNode'
}

export type PuzzleEdgeKind = 'requires' | 'unlocks' | 'gives'

export interface PuzzleEdgeData extends Record<string, unknown> {
  kind?: PuzzleEdgeKind
  internalNote?: string
}

export type PuzzleFlowEdge = Edge<PuzzleEdgeData>

export interface GraphMeta {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodeCount: number
}

export interface GraphFile extends GraphMeta {
  nodes: AnyPuzzleNode[]
  edges: PuzzleFlowEdge[]
}
