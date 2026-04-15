import { useEffect, useState } from 'react'

let toastId = 0
const listeners = new Set<(toasts: ToastItem[]) => void>()

interface ToastItem {
  id: number
  message: string
  type: 'info' | 'success' | 'error'
}

function notify(toasts: ToastItem[]) {
  listeners.forEach((fn) => fn(toasts))
}

export function showToast(message: string, type: ToastItem['type'] = 'info') {
  const id = ++toastId
  const toast = { id, message, type }
  const current = getToasts()
  const next = [...current, toast]
  notify(next)
  setTimeout(() => {
    notify(getToasts().filter((t) => t.id !== id))
  }, 3000)
}

let toasts: ToastItem[] = []

function getToasts() {
  return toasts
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (next: ToastItem[]) => {
      toasts = next
      setItems(next)
    }
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded shadow text-sm transition-opacity duration-300 ${
            t.type === 'error'
              ? 'bg-rose-600 text-white'
              : t.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-700 text-slate-100'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
