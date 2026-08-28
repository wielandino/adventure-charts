import { Link } from 'react-router-dom'

import { ThemeToggle } from './ThemeToggle'
import { GroupNavMenu } from './GroupNavMenu'
import { ArrowLeftIcon, HelpIcon, SaveIcon, TagIcon, UnlinkIcon, WarningIcon } from './icons'
import type { PuzzleGroupNode } from '../types'
import type { SaveStatus } from '../hooks/useGraphPersistence'

interface EditorHeaderProps {
  name: string
  onNameChange: (value: string) => void
  cycleCount: number
  isolatedCount: number
  saveStatus: SaveStatus
  onSaveClick: () => void
  onOpenManageTypes: () => void
  onOpenHelp: () => void
  groups: PuzzleGroupNode[]
  groupMemberCounts: Map<string, number>
  onSelectGroup: (groupId: string) => void
}

export function EditorHeader({
  name,
  onNameChange,
  cycleCount,
  isolatedCount,
  saveStatus,
  onSaveClick,
  onOpenManageTypes,
  onOpenHelp,
  groups,
  groupMemberCounts,
  onSelectGroup,
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
      <span className={saveStatus === 'error' ? 'save-status save-status-error' : 'save-status'}>
        {saveStatus === 'saving'
          ? 'Speichert …'
          : saveStatus === 'saved'
            ? 'Gespeichert'
            : saveStatus === 'error'
              ? 'Nicht gespeichert - erneut versuchen'
              : ''}
      </span>
      <button className="save-button" onClick={onSaveClick}>
        <SaveIcon size={16} />
        Speichern
      </button>
      <button
        className="manage-types-button"
        onClick={onOpenManageTypes}
        title="Typen verwalten"
        aria-label="Typen verwalten"
      >
        <TagIcon size={18} />
      </button>
      <GroupNavMenu groups={groups} groupMemberCounts={groupMemberCounts} onSelectGroup={onSelectGroup} />
      <button className="help-button" onClick={onOpenHelp} title="Hilfe" aria-label="Hilfe">
        <HelpIcon size={18} />
      </button>
      <ThemeToggle />
    </header>
  )
}
