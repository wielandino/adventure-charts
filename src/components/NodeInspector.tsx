import { useEffect, useRef, useState } from 'react'

import { ColorPicker } from './ColorPicker'
import { FormField } from './FormField'
import { DescriptionDialog } from './DescriptionDialog'
import { CloseIcon, TrashIcon } from './icons'
import { findNodeType, UNKNOWN_TYPE_COLOR } from '../utils/graphEditorVisuals'
import { hasDescriptionContent } from '../utils/nodeDescription'
import type { NodeTypeDef, PuzzleFlowNode, PuzzleGroupNode, PuzzleNodeData } from '../types'

const FIELD_DEBOUNCE_MS = 300

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

  // Free-text fields are edited against a local draft and pushed to graph state
  // debounced, so a keystroke does not spawn a new nodes array (and a full canvas
  // re-render + autosave tick) on every character. onBlur flushes immediately,
  // which also covers clicking away or onto another node (blur fires first).
  const [labelDraft, setLabelDraft] = useState(data.label)
  const [descriptionDraft, setDescriptionDraft] = useState(data.description ?? '')
  const labelTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const descriptionTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    // Switched to a different node: drop any pending debounce and re-sync drafts.
    clearTimeout(labelTimer.current)
    clearTimeout(descriptionTimer.current)
    setLabelDraft(data.label)
    setDescriptionDraft(data.description ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id])

  const pushLabel = (value: string) => {
    setLabelDraft(value)
    clearTimeout(labelTimer.current)
    labelTimer.current = setTimeout(() => onChange({ label: value }), FIELD_DEBOUNCE_MS)
  }
  const flushLabel = () => {
    clearTimeout(labelTimer.current)
    if (labelDraft !== data.label) onChange({ label: labelDraft })
  }
  const pushDescription = (value: string) => {
    setDescriptionDraft(value)
    clearTimeout(descriptionTimer.current)
    descriptionTimer.current = setTimeout(() => onChange({ description: value }), FIELD_DEBOUNCE_MS)
  }
  const flushDescription = () => {
    clearTimeout(descriptionTimer.current)
    if (descriptionDraft !== (data.description ?? '')) onChange({ description: descriptionDraft })
  }

  return (
    <aside className="node-inspector">
      <div className="node-inspector-header">
        <h2>Knoten bearbeiten</h2>
        <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
          <CloseIcon size={16} />
        </button>
      </div>

      <FormField label="Name">
        <input
          type="text"
          value={labelDraft}
          onChange={(e) => pushLabel(e.target.value)}
          onBlur={flushLabel}
        />
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
          value={descriptionDraft}
          onChange={(e) => pushDescription(e.target.value)}
          onBlur={flushDescription}
        />
      </FormField>

      <FormField label="Beschreibung">
        <button
          type="button"
          className="node-inspector-notes-button"
          onClick={onOpenDescriptionDialog}
        >
          {hasDescriptionContent(data.notes) ? 'Beschreibung bearbeiten' : 'Beschreibung hinzufügen'}
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
