import type { PuzzleGroupNode } from '../types'

export const GROUP_PADDING = 40
export const NODE_DEFAULT_WIDTH = 200
// Kind + label rows + card chrome; no room for a description line.
export const NODE_DEFAULT_HEIGHT = 84
// Rendered line-height of `.puzzle-node-description`. Used to work out how many
// description lines fit in a given node height (see PuzzleNode).
export const DESC_LINE_HEIGHT = 26
// One description line on top of NODE_DEFAULT_HEIGHT, so a node with a
// Kurzbeschreibung shows it on a single line by default (the rest is clamped
// with an ellipsis until the node is dragged taller).
export const NODE_ONELINE_HEIGHT = NODE_DEFAULT_HEIGHT + DESC_LINE_HEIGHT + 2
export const NODE_MIN_WIDTH = 160
// Enough that the node name is never cut off when dragged to the minimum.
export const NODE_MIN_HEIGHT = 84
export const GROUP_MIN_WIDTH = 200
export const GROUP_MIN_HEIGHT = 140

/**
 * Starting height for a puzzle node created now or migrated from a graph saved
 * before nodes had explicit heights. Just tall enough for one description line;
 * the user drags the node taller to reveal more of the text.
 */
export function initialNodeHeight(description?: string | null): number {
  return description && description.trim() ? NODE_ONELINE_HEIGHT : NODE_DEFAULT_HEIGHT
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x)
  const y = Math.min(a.y, b.y)
  const right = Math.max(a.x + a.width, b.x + b.width)
  const bottom = Math.max(a.y + a.height, b.y + b.height)
  return { x, y, width: right - x, height: bottom - y }
}

export function paddedRect(x: number, y: number, width: number, height: number, padding: number): Rect {
  return { x: x - padding, y: y - padding, width: width + padding * 2, height: height + padding * 2 }
}

export function groupRectOf(group: PuzzleGroupNode): Rect {
  return {
    x: group.position.x,
    y: group.position.y,
    width: group.width ?? GROUP_MIN_WIDTH,
    height: group.height ?? GROUP_MIN_HEIGHT,
  }
}

export function findGroupAtPoint(
  groups: PuzzleGroupNode[],
  point: { x: number; y: number },
): PuzzleGroupNode | undefined {
  return groups.find((group) => {
    const rect = groupRectOf(group)
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    )
  })
}
