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
