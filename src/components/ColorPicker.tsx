import { useEffect, useRef, useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'
import { clampByte, hexToRgb, rgbToHex } from '../utils/color'

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const rgb = hexToRgb(value) ?? { r: 0, g: 0, b: 0 }

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleRgbChange = (channel: keyof typeof rgb, raw: string) => {
    const next = { ...rgb, [channel]: clampByte(Number(raw)) }
    onChange(rgbToHex(next.r, next.g, next.b))
  }

  return (
    <div className="color-picker" ref={containerRef}>
      <button
        type="button"
        className="color-picker-swatch"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        <span className="color-picker-swatch-preview" style={{ background: value }} />
        <span>{value.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="color-picker-popover">
          <HexColorPicker color={value} onChange={onChange} />

          <div className="color-picker-field">
            <span>Hex</span>
            <HexColorInput color={value} onChange={onChange} prefixed />
          </div>

          <div className="color-picker-rgb-row">
            <label className="color-picker-field">
              <span>R</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
              />
            </label>
            <label className="color-picker-field">
              <span>G</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
              />
            </label>
            <label className="color-picker-field">
              <span>B</span>
              <input
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
