import { FormField } from './FormField'
import { ColorPicker } from './ColorPicker'
import { CloseIcon, TrashIcon, EyeIcon, EyeOffIcon } from './icons'
import type { PuzzleGroupNode, PuzzleGroupData } from '../types'

interface GroupInspectorProps {
  group: PuzzleGroupNode
  onChange: (patch: Partial<PuzzleGroupData>) => void
  onDelete: () => void
  onToggleVisibility: () => void
  onClose: () => void
}

const DEFAULT_GROUP_COLOR = '#8a7f66'

export function GroupInspector({ group, onChange, onDelete, onToggleVisibility, onClose }: GroupInspectorProps) {
  const { data } = group
  const color = data.color ?? DEFAULT_GROUP_COLOR

  return (
    <aside className="node-inspector">
      <div className="node-inspector-header">
        <h2>Gruppe bearbeiten</h2>
        <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
          <CloseIcon size={16} />
        </button>
      </div>

      <FormField label="Name">
        <input type="text" value={data.label} onChange={(e) => onChange({ label: e.target.value })} />
      </FormField>

      <FormField label="Farbe" as="div">
        <ColorPicker value={color} onChange={(hex) => onChange({ color: hex })} />
      </FormField>

      <button type="button" className="node-inspector-notes-button" onClick={onToggleVisibility}>
        {data.hidden ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        {data.hidden ? 'Gruppe einblenden' : 'Gruppe ausblenden'}
      </button>

      <button className="node-inspector-delete" onClick={onDelete}>
        <TrashIcon size={16} />
        Gruppe löschen
      </button>
    </aside>
  )
}
