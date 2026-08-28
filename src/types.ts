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

/**
 * Persistence-facing shapes: only the fields the editor authors. React Flow's
 * transient runtime state (`measured`, `selected`, `dragging`, re-derived
 * styling, ...) is stripped before saving - see src/utils/serializeGraph.ts.
 */
export interface SerializedNode {
  id: string
  type?: string
  position: { x: number; y: number }
  data: Record<string, unknown>
  width?: number
  height?: number
  parentId?: string
  extent?: AnyPuzzleNode['extent']
  expandParent?: boolean
  hidden?: boolean
}

export interface SerializedEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type?: string
  label?: PuzzleFlowEdge['label']
  data?: Record<string, unknown>
}

export interface SerializedGraph {
  name: string
  nodes: SerializedNode[]
  edges: SerializedEdge[]
}

/** Incremental save payload - only what changed since the last persisted snapshot. */
export interface GraphPatch {
  name?: string
  upsertNodes?: SerializedNode[]
  removeNodeIds?: string[]
  upsertEdges?: SerializedEdge[]
  removeEdgeIds?: string[]
}

/** Slim server response for PUT/PATCH - the client only needs these to reconcile. */
export interface SaveAck {
  id: string
  updatedAt: string
  nodeCount: number
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
