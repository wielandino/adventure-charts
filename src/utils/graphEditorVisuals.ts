import { MarkerType } from '@xyflow/react'

import { PuzzleNode } from '../components/PuzzleNode'
import { GroupNode } from '../components/GroupNode'
import type { PuzzleEdgeKind, PuzzleNodeKind } from '../types'

export const nodeTypes = { puzzleNode: PuzzleNode, groupNode: GroupNode }

export const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
}

export const edgeKindColors: Record<PuzzleEdgeKind, string> = {
  requires: 'var(--edge-requires)',
  unlocks: 'var(--edge-unlocks)',
  gives: 'var(--edge-gives)',
}

export const nodeKindColors: Record<PuzzleNodeKind, string> = {
  puzzle: 'var(--kind-puzzle)',
  item: 'var(--kind-item)',
  location: 'var(--kind-location)',
}

// React Flow builds each arrow marker's SVG id from this color string and references it via
// `url(#id)` — a CSS var() (which contains parentheses) breaks that reference, so marker colors
// need to be resolved to literal hex per theme instead. Kept in sync with the --edge-*/--status-danger
// tokens in src/index.css.
export const edgeKindHex: Record<'light' | 'dark', Record<PuzzleEdgeKind, string>> = {
  light: { requires: '#c1543f', unlocks: '#b3792e', gives: '#1f8fa0' },
  dark: { requires: '#d9645a', unlocks: '#e0a458', gives: '#4fb8c4' },
}

export const statusDangerHex: Record<'light' | 'dark', string> = {
  light: '#c9463f',
  dark: '#e2554f',
}
