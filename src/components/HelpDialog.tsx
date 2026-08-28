import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CloseIcon, MouseClickIcon } from './icons'

interface HelpDialogProps {
  onClose: () => void
}

function Kbd({ children }: { children: string }) {
  return <kbd className="kbd">{children}</kbd>
}

function Click() {
  return (
    <span className="kbd kbd-icon" title="Linksklick">
      <MouseClickIcon size={13} />
    </span>
  )
}

interface ShortcutRow {
  label: string
  keys: React.ReactNode
  description: string
}

const shortcuts: ShortcutRow[] = [
  {
    label: 'Knoten hinzufügen',
    keys: (
      <>
        <Click /> Drag & Drop
        <span className="help-or">oder</span>
        <Kbd>Alt</Kbd>
        <span className="help-plus">+</span>
        <Kbd>N</Kbd>
      </>
    ),
    description: 'Aus der Toolbar ziehen, per Shortcut in den Platzierungsmodus wechseln, oder den Button anklicken - Position bestätigen mit Linksklick.',
  },
  {
    label: 'Verbinden-Modus',
    keys: (
      <>
        <Kbd>Alt</Kbd>
        <span className="help-plus">+</span>
        <Click /> auf Node
      </>
    ),
    description: 'Startet eine Verbindung ausgehend vom gewählten Knoten.',
  },
  {
    label: 'Bereich auswählen',
    keys: (
      <>
        <Kbd>Shift</Kbd>
        <span className="help-plus">+</span>
        <Click /> gedrückt halten
      </>
    ),
    description: 'Zieht ein Auswahlrechteck über mehrere Knoten.',
  },
  {
    label: 'Mehrfachauswahl',
    keys: (
      <>
        <Kbd>Shift</Kbd>
        <span className="help-plus">+</span>
        <Click /> auf Nodes
      </>
    ),
    description: 'Fügt einzelne Knoten der Auswahl hinzu oder entfernt sie.',
  },
  {
    label: 'Rückgängig',
    keys: (
      <>
        <Kbd>Strg</Kbd>
        <span className="help-plus">+</span>
        <Kbd>Z</Kbd>
      </>
    ),
    description: 'Macht die letzte Änderung rückgängig.',
  },
  {
    label: 'Kopieren',
    keys: (
      <>
        <Kbd>Strg</Kbd>
        <span className="help-plus">+</span>
        <Kbd>C</Kbd>
      </>
    ),
    description: 'Kopiert die ausgewählten Knoten (ohne Verbindungen).',
  },
  {
    label: 'Einfügen',
    keys: (
      <>
        <Kbd>Strg</Kbd>
        <span className="help-plus">+</span>
        <Kbd>V</Kbd>
      </>
    ),
    description: 'Fügt die kopierten Knoten an der aktuellen Mausposition ein.',
  },
  {
    label: 'Löschen',
    keys: <Kbd>Entf</Kbd>,
    description: 'Löscht die ausgewählten Knoten oder Verbindungen.',
  },
  {
    label: 'Abbrechen',
    keys: <Kbd>Esc</Kbd>,
    description: 'Bricht den Platzierungs- oder Verbinden-Modus ab.',
  },
]

export function HelpDialog({ onClose }: HelpDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div className="confirm-dialog-backdrop" onClick={onClose}>
      <div
        className="help-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Hilfe"
      >
        <div className="confirm-dialog-header">
          <h2>Hilfe &amp; Tastenkombinationen</h2>
          <button className="node-inspector-close" onClick={onClose} title="Schließen" aria-label="Schließen">
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="help-shortcut-list">
          {shortcuts.map((row) => (
            <div className="help-shortcut-row" key={row.label}>
              <span className="help-shortcut-label">{row.label}</span>
              <span className="help-shortcut-keys">{row.keys}</span>
              <span className="help-shortcut-description">{row.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
