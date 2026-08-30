import { memo, useContext, type CSSProperties } from 'react'
import { Handle, NodeResizer, Position, type NodeProps } from '@xyflow/react'
import { ConnectModeContext } from '../context/ConnectModeContext'
import { CycleWarningContext } from '../context/CycleWarningContext'
import { IsolatedNodeContext } from '../context/IsolatedNodeContext'
import { NodeResizeContext } from '../context/NodeResizeContext'
import { TypeConfigContext } from '../context/TypeConfigContext'
import { findNodeType, UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import {
  DESC_LINE_HEIGHT,
  NODE_DEFAULT_HEIGHT,
  NODE_MIN_HEIGHT,
  NODE_MIN_WIDTH,
  NODE_ONELINE_HEIGHT,
} from '../utils/groupLayout'
import { hasDescriptionContent } from '../utils/nodeDescription'
import { NotesIcon, UnlinkIcon, WarningIcon } from './icons'
import type { PuzzleFlowNode } from '../types'

function PuzzleNodeImpl({ id, data, selected, width, height }: NodeProps<PuzzleFlowNode>) {
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
  const beginResize = useContext(NodeResizeContext)

  const hasDescription = !!data.description?.trim()
  // How many lines of the Kurzbeschreibung to show: one at the default height,
  // one more per line-height of extra node height. A pure function of the height
  // prop - no measuring, no effects, so a resize can't spiral into a re-render
  // loop. The rest of the text is clamped with an ellipsis.
  const descLines = Math.max(
    1,
    Math.floor(((height ?? NODE_ONELINE_HEIGHT) - NODE_DEFAULT_HEIGHT) / DESC_LINE_HEIGHT),
  )
  // node.height is applied as a MINIMUM, not a fixed height: the card is a flex
  // column with `height: auto`, so a node whose name wraps to two lines simply
  // grows to fit it. The description stays clamped to `descLines`.

  const classNames = [
    'puzzle-node',
    selected && 'is-selected',
    isConnectPending && 'is-connect-pending',
    isInCycle && 'is-cycle',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classNames}
      style={{ '--node-accent': accent, width, minHeight: height } as CSSProperties}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={NODE_MIN_WIDTH}
        // A node with a Kurzbeschreibung can't be shrunk past the point where its
        // single line would show.
        minHeight={hasDescription ? NODE_ONELINE_HEIGHT : NODE_MIN_HEIGHT}
        color={accent}
        onResizeStart={beginResize}
      />
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
      {hasDescriptionContent(data.notes) && (
        <span className="node-notes-badge" title="Beschreibung hinterlegt">
          <NotesIcon size={12} />
        </span>
      )}
      {/* Each side carries both a source and a target handle stacked on the same spot, so a
          connection can be dragged from or to any side - the drag direction (not the side)
          decides which node ends up as source vs. target. The non-interactive twin only
          participates in React Flow's drop-target proximity check. */}
      <Handle type="target" position={Position.Top} id="top" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left} id="left" />
      <div className="puzzle-node-content">
        <div className="puzzle-node-kind">{kindLabel}</div>
        <div className="puzzle-node-label">{data.label}</div>
        {data.description && (
          <div
            className="puzzle-node-description"
            style={{ WebkitLineClamp: descLines } as CSSProperties}
          >
            {data.description}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Bottom} id="bottom" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Right} id="right" style={{ pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  )
}

// React Flow gives unchanged nodes a stable object identity across setNodes, so
// memo lets a single-node edit / drag skip re-rendering every other node body
// (and its per-node hasDescriptionContent call). Context changes still re-render.
export const PuzzleNode = memo(PuzzleNodeImpl)
