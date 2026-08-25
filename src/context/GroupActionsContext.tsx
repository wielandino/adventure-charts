import { createContext } from 'react'

export interface GroupActions {
  onToggleVisibility: (groupId: string) => void
}

export const GroupActionsContext = createContext<GroupActions>({ onToggleVisibility: () => {} })
