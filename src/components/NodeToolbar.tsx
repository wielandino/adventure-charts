import { GroupIcon, LinkIcon, PlusIcon } from './icons'

interface NodeToolbarProps {
  isPlacingNode: boolean
  onStartPlacingNode: () => void
  connectMode: boolean
  connectSourceId: string | null
  onToggleConnectMode: () => void
  eligibleCount: number
  onGroupSelectedNodes: () => void
}

export function NodeToolbar({
  isPlacingNode,
  onStartPlacingNode,
  connectMode,
  connectSourceId,
  onToggleConnectMode,
  eligibleCount,
  onGroupSelectedNodes,
}: NodeToolbarProps) {
  return (
    <nav className="node-toolbar" aria-label="Node hinzufügen">
      <button
        className="node-toolbar-button"
        aria-pressed={isPlacingNode}
        onClick={onStartPlacingNode}
        title="Knoten hinzufügen"
      >
        <span className="node-toolbar-icon">
          <PlusIcon size={16} />
        </span>
        <span>Knoten hinzufügen</span>
      </button>
      <button
        className="node-toolbar-button"
        aria-pressed={connectMode}
        onClick={onToggleConnectMode}
        title="Verbinden"
      >
        <span className="node-toolbar-icon">
          <LinkIcon size={16} />
        </span>
        <span>Verbinden</span>
      </button>
      <button
        className="node-toolbar-button"
        disabled={eligibleCount < 2}
        onClick={onGroupSelectedNodes}
        title="Gruppieren"
      >
        <span className="node-toolbar-icon">
          <GroupIcon size={16} />
        </span>
        <span>Gruppieren</span>
      </button>
      {connectMode && (
        <span className="node-toolbar-hint">
          {connectSourceId ? 'Wähle den zweiten Knoten' : 'Wähle den ersten Knoten'}
        </span>
      )}
      {isPlacingNode && <span className="node-toolbar-hint">Position wählen und klicken</span>}
      {!connectMode && !isPlacingNode && eligibleCount < 2 && (
        <span className="node-toolbar-hint">Wähle mindestens 2 Knoten (Shift+Klick)</span>
      )}
    </nav>
  )
}
