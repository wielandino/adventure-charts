import { useContext, type CSSProperties } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ConnectModeContext } from '../context/ConnectModeContext'
import { CycleWarningContext } from '../context/CycleWarningContext'
import { IsolatedNodeContext } from '../context/IsolatedNodeContext'
import { UnlinkIcon, WarningIcon } from './icons'
import type { PuzzleFlowNode, PuzzleNodeData } from '../types'

export const kindStyles: Record<PuzzleNodeData['kind'], { border: string; label: string }> = {
  puzzle: { border: 'var(--kind-puzzle)', label: 'Puzzle' },
  item: { border: 'var(--kind-item)', label: 'Item' },
  location: { border: 'var(--kind-location)', label: 'Location' },
}

export function PuzzleNode({ id, data, selected }: NodeProps<PuzzleFlowNode>) {
  const style = kindStyles[data.kind]
  const accent = data.color ?? style.border
  const connectSourceId = useContext(ConnectModeContext)
  const isConnectPending = connectSourceId === id
  const cycleNodeIds = useContext(CycleWarningContext)
  const isInCycle = cycleNodeIds.has(id)
  const isolatedNodeIds = useContext(IsolatedNodeContext)
  const isIsolated = isolatedNodeIds.has(id)

  const classNames = [
    'puzzle-node',
    selected && 'is-selected',
    isConnectPending && 'is-connect-pending',
    isInCycle && 'is-cycle',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} style={{ '--node-accent': accent } as CSSProperties}>
      {isInCycle && (
        <span className="node-cycle-badge" title="Teil eines Abhängigkeitszyklus">
          <WarningIcon size={12} />
        </span>
      )}
      {isIsolated && (
        <span className="node-isolated-badge" title="Keine Verbindung zu anderen Knoten">
          <UnlinkIcon size={12} />
        </span>
      )}
      <Handle type="target" position={Position.Top} />
      <div className="puzzle-node-kind">{style.label}</div>
      <div className="puzzle-node-label">{data.label}</div>
      {data.description && <div className="puzzle-node-description">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
