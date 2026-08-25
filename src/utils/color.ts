export interface Rgb {
  r: number
  g: number
  b: number
}

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i

export function hexToRgb(hex: string): Rgb | null {
  const match = HEX_PATTERN.exec(hex)
  if (!match) return null
  const value = match[1]
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

export function clampByte(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(255, Math.max(0, Math.round(value)))
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (channel: number) => clampByte(channel).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
