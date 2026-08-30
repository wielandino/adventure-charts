import { memo, useContext, type CSSProperties } from 'react'
import { NodeResizer, type NodeProps } from '@xyflow/react'
import { GroupActionsContext } from '../context/GroupActionsContext'
import { NodeResizeContext } from '../context/NodeResizeContext'
import { EyeIcon, EyeOffIcon } from './icons'
import { GROUP_MIN_HEIGHT, GROUP_MIN_WIDTH } from '../utils/groupLayout'
import type { PuzzleGroupNode } from '../types'

const DEFAULT_GROUP_ACCENT = 'var(--border-strong)'

function GroupNodeImpl({ id, data, selected, width, height }: NodeProps<PuzzleGroupNode>) {
  const accent = data.color ?? DEFAULT_GROUP_ACCENT
  const isHidden = !!data.hidden
  const { onToggleVisibility, dropTargetGroupId } = useContext(GroupActionsContext)
  const isDropTarget = dropTargetGroupId === id
  const beginResize = useContext(NodeResizeContext)

  const classNames = [
    'group-node',
    selected && 'is-selected',
    isHidden && 'is-hidden',
    isDropTarget && 'is-drop-target',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} style={{ '--node-accent': accent, width, height } as CSSProperties}>
      <NodeResizer
        isVisible={selected}
        minWidth={GROUP_MIN_WIDTH}
        minHeight={GROUP_MIN_HEIGHT}
        color={accent}
        onResizeStart={beginResize}
      />
      <div className="group-node-header">
        <span className="group-node-label">{data.label || 'Neue Gruppe'}</span>
        <button
          type="button"
          className="group-node-visibility"
          onClick={(e) => {
            e.stopPropagation()
            onToggleVisibility(id)
          }}
          title={isHidden ? 'Gruppe einblenden' : 'Gruppe ausblenden'}
          aria-label={isHidden ? 'Gruppe einblenden' : 'Gruppe ausblenden'}
        >
          {isHidden ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
        </button>
      </div>
    </div>
  )
}

export const GroupNode = memo(GroupNodeImpl)
