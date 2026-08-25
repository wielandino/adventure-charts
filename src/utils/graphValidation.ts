import type { PuzzleFlowEdge, PuzzleFlowNode } from '../types'

interface CycleMembership {
  cycleNodeIds: Set<string>
  cycleEdgeIds: Set<string>
}

interface AdjacencyEntry {
  edgeId: string
  target: string
}

export function findCycleMembership(nodes: PuzzleFlowNode[], edges: PuzzleFlowEdge[]): CycleMembership {
  const adjacency = new Map<string, AdjacencyEntry[]>()
  for (const edge of edges) {
    const list = adjacency.get(edge.source) ?? []
    list.push({ edgeId: edge.id, target: edge.target })
    adjacency.set(edge.source, list)
  }

  const color = new Map<string, 'gray' | 'black'>()
  const stack: string[] = []
  const edgeIntoNode = new Map<string, string>()
  const cycleNodeIds = new Set<string>()
  const cycleEdgeIds = new Set<string>()

  function markCycle(startId: string, closingEdgeId: string) {
    const startIndex = stack.indexOf(startId)
    for (let i = startIndex; i < stack.length; i++) {
      cycleNodeIds.add(stack[i])
      if (i > startIndex) {
        const edgeId = edgeIntoNode.get(stack[i])
        if (edgeId) cycleEdgeIds.add(edgeId)
      }
    }
    cycleEdgeIds.add(closingEdgeId)
  }

  function dfs(nodeId: string) {
    color.set(nodeId, 'gray')
    stack.push(nodeId)
    for (const { edgeId, target } of adjacency.get(nodeId) ?? []) {
      const targetColor = color.get(target)
      if (targetColor === 'gray') {
        markCycle(target, edgeId)
      } else if (!targetColor) {
        edgeIntoNode.set(target, edgeId)
        dfs(target)
      }
    }
    stack.pop()
    color.set(nodeId, 'black')
  }

  for (const node of nodes) {
    if (!color.has(node.id)) dfs(node.id)
  }

  return { cycleNodeIds, cycleEdgeIds }
}

export function findIsolatedNodeIds(nodes: PuzzleFlowNode[], edges: PuzzleFlowEdge[]): Set<string> {
  const connected = new Set<string>()
  for (const edge of edges) {
    connected.add(edge.source)
    connected.add(edge.target)
  }
  return new Set(nodes.filter((node) => !connected.has(node.id)).map((node) => node.id))
}
