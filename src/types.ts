import type { Edge, Node } from '@xyflow/react'

export interface PuzzleNodeData extends Record<string, unknown> {
  label: string
  kind: string
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

export interface PuzzleEdgeData extends Record<string, unknown> {
  kind?: string
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

export interface NodeTypeDef {
  id: string
  label: string
  color: string
}

export interface EdgeTypeDef {
  id: string
  label: string
}

export interface TypeConfig {
  nodeTypes: NodeTypeDef[]
  edgeTypes: EdgeTypeDef[]
}
