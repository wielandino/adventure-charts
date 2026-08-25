import { createContext } from 'react'

export const IsolatedNodeContext = createContext<Set<string>>(new Set())
