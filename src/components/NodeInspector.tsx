import { ColorPicker } from './ColorPicker'
import { FormField } from './FormField'
import { DescriptionDialog } from './DescriptionDialog'
import { CloseIcon, TrashIcon } from './icons'
import { findNodeType, UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import type { NodeTypeDef, PuzzleFlowNode, PuzzleGroupNode, PuzzleNodeData } from '../types'

interface NodeInspectorProps {
  node: PuzzleFlowNode
  groups: PuzzleGroupNode[]
  nodeTypes: NodeTypeDef[]
  onChange: (patch: Partial<PuzzleNodeData>) => void
  onAssignGroup: (groupId: string | null) => void
  onDelete: () => void
  onClose: () => void
  isDescriptionDialogOpen: boolean
  onOpenDescriptionDialog: () => void
  onCloseDescriptionDialog: () => void
}

export function NodeInspector({
  node,
  groups,
  nodeTypes,
  onChange,
  onAssignGroup,
  onDelete,
  onClose,
  isDescriptionDialogOpen,
  onOpenDescriptionDialog,
  onCloseDescriptionDialog,
}: NodeInspectorProps) {
  const { data } = node
  const currentType = findNodeType(nodeTypes, data.kind)
  const color = data.color ?? currentType?.color ?? UNKNOWN_TYPE_COLOR

  return (
    <aside className="node-inspector">
      <div className="node-inspector-header">
        <h2>Knoten bearbeiten</h2>
        <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
          <CloseIcon size={16} />
        </button>
      </div>

      <FormField label="Name">
        <input type="text" value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </FormField>

      <FormField label="Typ">
        <select value={data.kind} onChange={(e) => onChange({ kind: e.target.value })}>
          {!currentType && (
            <option value={data.kind} disabled hidden>
              Unbekannter Typ
            </option>
          )}
          {nodeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Farbe" as="div">
        <ColorPicker value={color} onChange={(hex) => onChange({ color: hex })} />
      </FormField>

      <FormField label="Gruppe">
        <select value={node.parentId ?? ''} onChange={(e) => onAssignGroup(e.target.value || null)}>
          <option value="">Keine</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.data.label}
            </option>
          ))}
        </select>
      </FormField>

      {node.parentId && (
        <button type="button" className="node-inspector-notes-button" onClick={() => onAssignGroup(null)}>
          Aus Gruppe entfernen
        </button>
      )}

      <FormField label="Kurzbeschreibung">
        <textarea
          rows={4}
          value={data.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </FormField>

      <FormField label="Beschreibung">
        <button
          type="button"
          className="node-inspector-notes-button"
          onClick={onOpenDescriptionDialog}
        >
          {data.notes ? 'Beschreibung bearbeiten' : 'Beschreibung hinzufügen'}
        </button>
      </FormField>

      <button className="node-inspector-delete" onClick={onDelete}>
        <TrashIcon size={16} />
        Knoten löschen
      </button>

      {isDescriptionDialogOpen && (
        <DescriptionDialog node={node} onChange={onChange} onClose={onCloseDescriptionDialog} />
      )}
    </aside>
  )
}
