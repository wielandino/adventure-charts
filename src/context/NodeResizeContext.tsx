import { createContext } from 'react'

/**
 * Called once at the start of a node-resize gesture so the editor can snapshot
 * the pre-resize state into the undo history. Kept as a stable reference by the
 * provider so it does not defeat the `memo` on the node bodies.
 */
export const NodeResizeContext = createContext<() => void>(() => {})
