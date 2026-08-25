import { useEffect } from 'react'

function isInputElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function useUndoRedoKeyboard(
  connectMode: boolean,
  isPlacingNode: boolean,
  setConnectMode: (active: boolean) => void,
  setConnectSourceId: (id: string | null) => void,
  setIsPlacingNode: (active: boolean) => void,
  setGhostScreenPos: (pos: { x: number; y: number } | null) => void,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (connectMode) {
          setConnectMode(false)
          setConnectSourceId(null)
        }
        if (isPlacingNode) {
          setIsPlacingNode(false)
          setGhostScreenPos(null)
        }
        return
      }
      if (isInputElement(event.target)) return
      const ctrlOrCmd = event.ctrlKey || event.metaKey
      if (!ctrlOrCmd) return
      const key = event.key.toLowerCase()
      if (key === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (key === 'z') {
        event.preventDefault()
        undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [connectMode, isPlacingNode, setConnectMode, setConnectSourceId, setIsPlacingNode, setGhostScreenPos, undo, redo])
}
