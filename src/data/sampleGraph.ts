import type { Edge } from '@xyflow/react'
import type { PuzzleFlowNode } from '../types'

export const initialNodes: PuzzleFlowNode[] = [
  {
    id: 'loc-attic',
    type: 'puzzleNode',
    position: { x: 0, y: 0 },
    data: { label: 'Dachboden', kind: 'location', description: 'Startbereich' },
  },
  {
    id: 'item-key',
    type: 'puzzleNode',
    position: { x: -200, y: 160 },
    data: { label: 'Rostiger Schlüssel', kind: 'item' },
  },
  {
    id: 'puzzle-lock',
    type: 'puzzleNode',
    position: { x: 0, y: 320 },
    data: { label: 'Verschlossene Truhe öffnen', kind: 'puzzle', description: 'Braucht Schlüssel' },
  },
  {
    id: 'item-map',
    type: 'puzzleNode',
    position: { x: 0, y: 480 },
    data: { label: 'Alte Schatzkarte', kind: 'item' },
  },
  {
    id: 'loc-cellar',
    type: 'puzzleNode',
    position: { x: 250, y: 640 },
    data: { label: 'Keller', kind: 'location' },
  },
]

export const initialEdges: Edge[] = [
  { id: 'e1', source: 'loc-attic', target: 'item-key', label: 'finden', type: 'smoothstep' },
  { id: 'e2', source: 'item-key', target: 'puzzle-lock', label: 'benötigt', type: 'smoothstep' },
  { id: 'e3', source: 'puzzle-lock', target: 'item-map', label: 'gibt', type: 'smoothstep' },
  { id: 'e4', source: 'item-map', target: 'loc-cellar', label: 'schaltet frei', type: 'smoothstep' },
]
