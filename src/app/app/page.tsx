'use client'

import { useEffect, useState } from 'react'
import { getToken, clearToken } from '@/lib/token'
import { useRouter } from 'next/navigation'

export default function AppPage() {
  const [user, setUser] = useState<{id:string,name:string,email:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const t = getToken()
    if (!t) { router.replace('/login'); return }
    ;(async () => {
      try {
        const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${t}` }
        }).then(r => r.json())
        setUser(me.user ?? null)
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  if (loading) return <main className="container py-5">Carregando…</main>

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <span className="navbar-brand">Agendador</span>
        <div className="d-flex align-items-center gap-3">
          <span className="text-secondary small">{user?.email}</span>
          <button className="btn btn-sm btn-outline-light" onClick={() => { clearToken(); router.replace('/login') }}>
            Sair
          </button>
        </div>
      </nav>
      <div className="row g-3">
        <div className="col-12">
          <div className="card p-4">
            <h2 className="h5 mb-1">Dashboard</h2>
            <p className="text-secondary mb-0">Próximo passo: Eventos</p>
          </div>
        </div>
      </div>
    </main>
  )
}
