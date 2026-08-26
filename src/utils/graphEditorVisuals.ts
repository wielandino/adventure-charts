import { MarkerType } from '@xyflow/react'

import { PuzzleNode } from '../components/PuzzleNode'
import { GroupNode } from '../components/GroupNode'
import { PuzzleEdge } from '../components/PuzzleEdge'
import type { EdgeTypeDef, NodeTypeDef } from '../types'

export const nodeTypes = { puzzleNode: PuzzleNode, groupNode: GroupNode }
export const edgeTypes = { puzzleEdge: PuzzleEdge }

export const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
}

// Neutral fallback for a node/edge whose kind id no longer matches any defined type
// (e.g. the type was deleted from the Manage Types list).
export const UNKNOWN_TYPE_COLOR = 'var(--border-strong)'

export function findNodeType(nodeTypeDefs: NodeTypeDef[], id: string | undefined): NodeTypeDef | undefined {
  return nodeTypeDefs.find((t) => t.id === id)
}

export function findEdgeType(edgeTypeDefs: EdgeTypeDef[], id: string | undefined): EdgeTypeDef | undefined {
  return edgeTypeDefs.find((t) => t.id === id)
}

export const statusDangerHex: Record<'light' | 'dark', string> = {
  light: '#c9463f',
  dark: '#e2554f',
}

// React Flow builds each arrow marker's SVG id from this color string and references it via
// `url(#id)` — a CSS var() (which contains parentheses) breaks that reference, so the edge line
// color needs to be resolved to a literal hex per theme instead. Kept in sync with --edge-line
// in src/index.css.
export const edgeLineHex: Record<'light' | 'dark', string> = {
  light: '#607d86',
  dark: '#607d86',
}

export const edgeTextBgHex: Record<'light' | 'dark', string> = {
  light: '#F7F2E8',
  dark: '#607d86',
}
