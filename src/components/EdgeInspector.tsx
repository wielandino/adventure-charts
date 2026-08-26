import { FormField } from './FormField'
import { CloseIcon, TrashIcon } from './icons'
import { findEdgeType } from '../utils/graphEditorVisuals'
import type { EdgeTypeDef, PuzzleFlowEdge } from '../types'

export interface EdgeInspectorPatch {
  label?: string
  kind?: string
  internalNote?: string
}

interface EdgeInspectorProps {
  edge: PuzzleFlowEdge
  edgeTypes: EdgeTypeDef[]
  onChange: (patch: EdgeInspectorPatch) => void
  onDelete: () => void
  onClose: () => void
}

export function EdgeInspector({ edge, edgeTypes, onChange, onDelete, onClose }: EdgeInspectorProps) {
  const label = typeof edge.label === 'string' ? edge.label : ''
  const kind = edge.data?.kind ?? edgeTypes[0]?.id
  const currentType = findEdgeType(edgeTypes, kind)

  return (
    <aside className="node-inspector">
      <div className="node-inspector-header">
        <h2>Verbindung bearbeiten</h2>
        <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
          <CloseIcon size={16} />
        </button>
      </div>

      <FormField label="Beschriftung">
        <input type="text" value={label} onChange={(e) => onChange({ label: e.target.value })} />
      </FormField>

      <FormField label="Typ">
        <select value={kind ?? ''} onChange={(e) => onChange({ kind: e.target.value })}>
          {!currentType && (
            <option value={kind ?? ''} disabled hidden>
              Unbekannter Typ
            </option>
          )}
          {edgeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Interne Beschreibung">
        <textarea
          rows={4}
          value={edge.data?.internalNote ?? ''}
          onChange={(e) => onChange({ internalNote: e.target.value })}
        />
      </FormField>

      <button className="node-inspector-delete" onClick={onDelete}>
        <TrashIcon size={16} />
        Verbindung löschen
      </button>
    </aside>
  )
}
