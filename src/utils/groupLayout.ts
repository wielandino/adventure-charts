import type { PuzzleGroupNode } from '../types'

export const GROUP_PADDING = 40
export const NODE_DEFAULT_WIDTH = 168
export const NODE_DEFAULT_HEIGHT = 80
export const GROUP_MIN_WIDTH = 200
export const GROUP_MIN_HEIGHT = 140

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
