'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type Toast = { id: string; type: 'success'|'danger'|'info'|'warning'; title?: string; message: string; timeout?: number }
type Ctx = { show: (t: Omit<Toast,'id'>) => void }
const ToastCtx = createContext<Ctx>({ show: () => {} })

export function useToast() { return useContext(ToastCtx) }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((t: Omit<Toast,'id'>) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, timeout: 4000, ...t }
    setToasts(s => [...s, toast])
    const ttl = toast.timeout ?? 4000
    setTimeout(() => setToasts(s => s.filter(x => x.id !== id)), ttl)
  }, [])
  const ctx = useMemo(() => ({ show }), [show])
  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div style={{ position:'fixed', top:16, right:16, zIndex:1055 }} className="d-flex flex-column gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`alert alert-${t.type} shadow-sm`} role="alert" style={{ minWidth: 260, maxWidth: 360 }}>
            {t.title && <div className="fw-semibold mb-1">{t.title}</div>}
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
