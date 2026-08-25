import { FormField } from './FormField'
import { CloseIcon, TrashIcon } from './icons'
import type { PuzzleEdgeKind, PuzzleFlowEdge } from '../types'

export interface EdgeInspectorPatch {
  label?: string
  kind?: PuzzleEdgeKind
  internalNote?: string
}

interface EdgeInspectorProps {
  edge: PuzzleFlowEdge
  onChange: (patch: EdgeInspectorPatch) => void
  onDelete: () => void
  onClose: () => void
}

const edgeKindLabels: Record<PuzzleEdgeKind, string> = {
  requires: 'Benötigt',
  unlocks: 'Schaltet frei',
  gives: 'Gibt',
}

const edgeKindOptions: PuzzleEdgeKind[] = ['requires', 'unlocks', 'gives']

export function EdgeInspector({ edge, onChange, onDelete, onClose }: EdgeInspectorProps) {
  const label = typeof edge.label === 'string' ? edge.label : ''
  const kind = edge.data?.kind ?? 'requires'

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
        <select value={kind} onChange={(e) => onChange({ kind: e.target.value as PuzzleEdgeKind })}>
          {edgeKindOptions.map((option) => (
            <option key={option} value={option}>
              {edgeKindLabels[option]}
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
        Kante löschen
      </button>
    </aside>
  )
}
