import { useCallback, useEffect, useRef, useState } from 'react'

import { getTypeConfig, saveTypeConfig as apiSaveTypeConfig } from '../api/types'
import type { TypeConfig } from '../types'

export function useTypeConfig() {
  const [typeConfig, setTypeConfig] = useState<TypeConfig | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false
    getTypeConfig().then((config) => {
      if (!cancelled) setTypeConfig(config)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const saveTypeConfig = useCallback((next: TypeConfig) => {
    setTypeConfig(next)
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      apiSaveTypeConfig(next)
    }, 800)
  }, [])

  return { typeConfig, saveTypeConfig }
}
