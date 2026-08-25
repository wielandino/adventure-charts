import { useState } from 'react'
import { kindStyles } from './PuzzleNode'
import { ColorPicker } from './ColorPicker'
import { FormField } from './FormField'
import { DescriptionDialog } from './DescriptionDialog'
import { CloseIcon, TrashIcon } from './icons'
import type { PuzzleFlowNode, PuzzleGroupNode, PuzzleNodeData, PuzzleNodeKind } from '../types'

interface NodeInspectorProps {
  node: PuzzleFlowNode
  groups: PuzzleGroupNode[]
  onChange: (patch: Partial<PuzzleNodeData>) => void
  onAssignGroup: (groupId: string | null) => void
  onDelete: () => void
  onClose: () => void
}

const kindOptions: PuzzleNodeKind[] = ['puzzle', 'item', 'location']

export function NodeInspector({ node, groups, onChange, onAssignGroup, onDelete, onClose }: NodeInspectorProps) {
  const { data } = node
  const color = data.color ?? kindStyles[data.kind].border
  const [isNotesOpen, setIsNotesOpen] = useState(false)

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
        <select value={data.kind} onChange={(e) => onChange({ kind: e.target.value as PuzzleNodeKind })}>
          {kindOptions.map((kind) => (
            <option key={kind} value={kind}>
              {kindStyles[kind].label}
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
          onClick={() => setIsNotesOpen(true)}
        >
          {data.notes ? 'Beschreibung bearbeiten' : 'Beschreibung hinzufügen'}
        </button>
      </FormField>

      <button className="node-inspector-delete" onClick={onDelete}>
        <TrashIcon size={16} />
        Knoten löschen
      </button>

      {isNotesOpen && (
        <DescriptionDialog node={node} onChange={onChange} onClose={() => setIsNotesOpen(false)} />
      )}
    </aside>
  )
}
