import { useEffect, useMemo, useRef, useState } from 'react'
import { CompassIcon, EyeOffIcon } from './icons'
import { UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import type { PuzzleGroupNode } from '../types'

interface GroupNavMenuProps {
  groups: PuzzleGroupNode[]
  groupMemberCounts: Map<string, number>
  onSelectGroup: (groupId: string) => void
}

export function GroupNavMenu({ groups, groupMemberCounts, onSelectGroup }: GroupNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const sortedGroups = useMemo(
    () =>
      [...groups].sort((a, b) =>
        (a.data.label || 'Neue Gruppe').localeCompare(b.data.label || 'Neue Gruppe', 'de', {
          sensitivity: 'base',
        }),
      ),
    [groups],
  )

  return (
    <div className="group-nav-menu" ref={containerRef}>
      <button
        type="button"
        className="group-nav-button"
        disabled={groups.length === 0}
        title={groups.length === 0 ? 'Keine Gruppen im Graph' : 'Zu Gruppe springen'}
        aria-label="Zu Gruppe springen"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <CompassIcon size={18} />
      </button>

      {isOpen && (
        <div className="group-nav-popover" role="menu">
          <ul className="group-nav-list">
            {sortedGroups.map((group) => {
              const label = group.data.label || 'Neue Gruppe'
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    role="menuitem"
                    className="group-nav-item"
                    title={label}
                    onClick={() => {
                      onSelectGroup(group.id)
                      setIsOpen(false)
                    }}
                  >
                    <span
                      className="group-nav-item-swatch"
                      style={{ background: group.data.color ?? UNKNOWN_TYPE_COLOR }}
                    />
                    <span className="group-nav-item-label">{label}</span>
                    {group.data.hidden && (
                      <span className="group-nav-item-hidden-icon" title="Gruppe ausgeblendet">
                        <EyeOffIcon size={13} />
                      </span>
                    )}
                    <span className="group-nav-item-count">{groupMemberCounts.get(group.id) ?? 0}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
