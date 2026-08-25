import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon } from './icons'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return createPortal(
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
        <div className="confirm-dialog-header">
          <h2>{title}</h2>
          <button className="node-inspector-close" onClick={onCancel} title="Schließen" aria-label="Schließen">
            <CloseIcon size={16} />
          </button>
        </div>
        <p className="confirm-dialog-message">{message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="confirm-dialog-cancel" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="button" className="confirm-dialog-confirm" onClick={onConfirm}>
            Bestätigen
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
