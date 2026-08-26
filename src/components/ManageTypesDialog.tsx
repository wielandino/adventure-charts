import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { ColorPicker } from './ColorPicker'
import { CloseIcon, PlusIcon, TrashIcon } from './icons'
import type { EdgeTypeDef, NodeTypeDef, TypeConfig } from '../types'

interface ManageTypesDialogProps {
  typeConfig: TypeConfig
  onSave: (next: TypeConfig) => void
  onClose: () => void
}

const NEW_TYPE_COLOR = '#8a8a94'

export function ManageTypesDialog({ typeConfig, onSave, onClose }: ManageTypesDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const updateNodeType = (id: string, patch: Partial<NodeTypeDef>) => {
    onSave({
      ...typeConfig,
      nodeTypes: typeConfig.nodeTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  }

  const updateEdgeType = (id: string, patch: Partial<EdgeTypeDef>) => {
    onSave({
      ...typeConfig,
      edgeTypes: typeConfig.edgeTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })
  }

  const addNodeType = () => {
    onSave({
      ...typeConfig,
      nodeTypes: [...typeConfig.nodeTypes, { id: crypto.randomUUID(), label: 'Neuer Typ', color: NEW_TYPE_COLOR }],
    })
  }

  const addEdgeType = () => {
    onSave({
      ...typeConfig,
      edgeTypes: [...typeConfig.edgeTypes, { id: crypto.randomUUID(), label: 'Neuer Typ' }],
    })
  }

  const removeNodeType = (id: string) => {
    onSave({ ...typeConfig, nodeTypes: typeConfig.nodeTypes.filter((t) => t.id !== id) })
  }

  const removeEdgeType = (id: string) => {
    onSave({ ...typeConfig, edgeTypes: typeConfig.edgeTypes.filter((t) => t.id !== id) })
  }

  return createPortal(
    <div className="confirm-dialog-backdrop" onClick={onClose}>
      <div
        className="manage-types-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Typen verwalten"
      >
        <div className="confirm-dialog-header">
          <h2>Typen verwalten</h2>
          <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
            <CloseIcon size={16} />
          </button>
        </div>

        <section className="manage-types-section">
          <h3>Knotentypen</h3>
          <div className="manage-types-list">
            {typeConfig.nodeTypes.map((type) => (
              <div className="manage-types-row" key={type.id}>
                <ColorPicker value={type.color} onChange={(hex) => updateNodeType(type.id, { color: hex })} />
                <input
                  type="text"
                  value={type.label}
                  onChange={(e) => updateNodeType(type.id, { label: e.target.value })}
                />
                <button
                  type="button"
                  className="manage-types-row-delete"
                  onClick={() => removeNodeType(type.id)}
                  title="Typ löschen"
                  aria-label="Typ löschen"
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="manage-types-add-button" onClick={addNodeType}>
            <PlusIcon size={14} />
            Knotentyp hinzufügen
          </button>
        </section>

        <section className="manage-types-section">
          <h3>Verbindungstypen</h3>
          <div className="manage-types-list">
            {typeConfig.edgeTypes.map((type) => (
              <div className="manage-types-row" key={type.id}>
                <input
                  type="text"
                  value={type.label}
                  onChange={(e) => updateEdgeType(type.id, { label: e.target.value })}
                />
                <button
                  type="button"
                  className="manage-types-row-delete"
                  onClick={() => removeEdgeType(type.id)}
                  title="Typ löschen"
                  aria-label="Typ löschen"
                >
                  <TrashIcon size={15} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="manage-types-add-button" onClick={addEdgeType}>
            <PlusIcon size={14} />
            Verbindungstyp hinzufügen
          </button>
        </section>
      </div>
    </div>,
    document.body,
  )
}
