import { Link } from 'react-router-dom'

import { ThemeToggle } from './ThemeToggle'
import { ArrowLeftIcon, SaveIcon, UnlinkIcon, WarningIcon } from './icons'

interface EditorHeaderProps {
  name: string
  onNameChange: (value: string) => void
  cycleCount: number
  isolatedCount: number
  saveStatus: 'idle' | 'saving' | 'saved'
  onSaveClick: () => void
}

export function EditorHeader({
  name,
  onNameChange,
  cycleCount,
  isolatedCount,
  saveStatus,
  onSaveClick,
}: EditorHeaderProps) {
  return (
    <header className="editor-header">
      <Link to="/" className="back-link" title="Zurück zum Dashboard">
        <ArrowLeftIcon />
      </Link>
      <input
        className="graph-name-input"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        aria-label="Graph-Name"
      />
      {cycleCount > 0 && (
        <span className="cycle-warning-badge" title="Zyklische Abhängigkeit im Graph gefunden">
          <WarningIcon size={14} /> Zyklus erkannt ({cycleCount} Knoten betroffen)
        </span>
      )}
      {isolatedCount > 0 && (
        <span className="isolated-warning-badge" title="Knoten ohne jede Verbindung">
          <UnlinkIcon size={14} /> {isolatedCount} Knoten ohne Verbindung
        </span>
      )}
      <span className="save-status">
        {saveStatus === 'saving' ? 'Speichert …' : saveStatus === 'saved' ? 'Gespeichert' : ''}
      </span>
      <button className="save-button" onClick={onSaveClick}>
        <SaveIcon size={16} />
        Speichern
      </button>
      <ThemeToggle />
    </header>
  )
}
