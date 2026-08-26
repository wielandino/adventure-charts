import { createContext } from 'react'
import type { TypeConfig } from '../types'

export const TypeConfigContext = createContext<TypeConfig | null>(null)
