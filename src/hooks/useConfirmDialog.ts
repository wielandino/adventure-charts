import { useCallback, useRef, useState } from 'react'

export function useConfirmDialog() {
  const [confirmRequest, setConfirmRequest] = useState<{ title: string; message: string } | null>(null)
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null)

  const requestConfirm = useCallback(
    (title: string, message: string) =>
      new Promise<boolean>((resolve) => {
        confirmResolveRef.current = resolve
        setConfirmRequest({ title, message })
      }),
    [],
  )

  const resolveConfirm = useCallback((result: boolean) => {
    setConfirmRequest(null)
    confirmResolveRef.current?.(result)
    confirmResolveRef.current = null
  }, [])

  return { confirmRequest, requestConfirm, resolveConfirm }
}
