import type {
  AnyPuzzleNode,
  PuzzleFlowEdge,
  SerializedEdge,
  SerializedGraph,
  SerializedNode,
} from '../types'

export type { SerializedEdge, SerializedGraph, SerializedNode }

/** Drop a key entirely when its value is undefined so stringify output stays minimal + stable. */
function defined<T extends object>(obj: T): T {
  const out = {} as T
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) out[key] = obj[key]
  }
  return out
}

export function serializeNode(node: AnyPuzzleNode): SerializedNode {
  return defined({
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    data: node.data as Record<string, unknown>,
    width: node.width,
    height: node.height,
    parentId: node.parentId,
    extent: node.extent,
    expandParent: node.expandParent,
    hidden: node.hidden,
  })
}

export function serializeEdge(edge: PuzzleFlowEdge): SerializedEdge {
  return defined({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
    type: edge.type,
    label: edge.label,
    data: edge.data as Record<string, unknown> | undefined,
  })
}

export function serializeGraph(
  name: string,
  nodes: AnyPuzzleNode[],
  edges: PuzzleFlowEdge[],
): SerializedGraph {
  return {
    name,
    nodes: nodes.map(serializeNode),
    edges: edges.map(serializeEdge),
  }
}

/**
 * Deterministic JSON with recursively sorted object keys. Used for the autosave
 * dirty-check and the per-entity delta diff so that a patch like
 * `{ ...data, ...patch }` (which can reorder keys) does not register as a change
 * when the effective content is identical.
 */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    const src = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(src).sort()) out[key] = sortKeys(src[key])
    return out
  }
  return value
}
