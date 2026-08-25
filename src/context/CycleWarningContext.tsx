import { createContext } from 'react'

export const CycleWarningContext = createContext<Set<string>>(new Set())
