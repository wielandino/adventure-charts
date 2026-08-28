import { createContext } from 'react'

export interface GroupActions {
  onToggleVisibility: (groupId: string) => void
  dropTargetGroupId: string | null
}

export const GroupActionsContext = createContext<GroupActions>({
  onToggleVisibility: () => {},
  dropTargetGroupId: null,
})
