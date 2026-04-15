import { useEffect, useRef } from 'react'

export function usePolling(callback: () => void | Promise<void>, intervalMs: number, deps: unknown[] = []) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    let mounted = true
    const tick = async () => {
      if (!mounted) return
      try {
        await savedCallback.current()
      } catch {
        // ignore
      }
    }
    tick()
    const id = setInterval(tick, intervalMs)
    return () => {
      mounted = false
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, ...deps])
}
