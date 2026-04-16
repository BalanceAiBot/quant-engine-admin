import { useEffect, useRef, useState } from 'react'

export function FlashValue({
  value,
  children,
  upGood = true,
}: {
  value: string | number
  children: React.ReactNode
  upGood?: boolean
}) {
  const [cls, setCls] = useState('')
  const prev = useRef(value)

  useEffect(() => {
    const n = Number(value)
    const p = Number(prev.current)
    if (!isNaN(n) && !isNaN(p) && value !== prev.current) {
      const isUp = n > p
      setCls(isUp === upGood ? 'text-emerald-400' : 'text-rose-400')
      const t = setTimeout(() => setCls(''), 1200)
      prev.current = value
      return () => clearTimeout(t)
    }
    prev.current = value
  }, [value, upGood])

  return <span className={`transition-colors duration-300 font-mono ${cls}`}>{children}</span>
}
