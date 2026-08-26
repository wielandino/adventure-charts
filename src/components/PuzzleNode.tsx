import { useContext, type CSSProperties } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ConnectModeContext } from '../context/ConnectModeContext'
import { CycleWarningContext } from '../context/CycleWarningContext'
import { IsolatedNodeContext } from '../context/IsolatedNodeContext'
import { TypeConfigContext } from '../context/TypeConfigContext'
import { findNodeType, UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import { UnlinkIcon, WarningIcon } from './icons'
import type { PuzzleFlowNode } from '../types'

export function PuzzleNode({ id, data, selected }: NodeProps<PuzzleFlowNode>) {
  const typeConfig = useContext(TypeConfigContext)
  const nodeType = typeConfig && findNodeType(typeConfig.nodeTypes, data.kind)
  const accent = data.color ?? nodeType?.color ?? UNKNOWN_TYPE_COLOR
  const kindLabel = nodeType?.label ?? 'Kein Typ'
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
      {/* Each side carries both a source and a target handle stacked on the same spot, so a
          connection can be dragged from or to any side — the drag direction (not the side)
          decides which node ends up as source vs. target. The non-interactive twin only
          participates in React Flow's drop-target proximity check. */}
      <Handle type="target" position={Position.Top} id="top" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left} id="left" />
      <div className="puzzle-node-kind">{kindLabel}</div>
      <div className="puzzle-node-label">{data.label}</div>
      {data.description && <div className="puzzle-node-description">{data.description}</div>}
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Right} id="right" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  )
}
