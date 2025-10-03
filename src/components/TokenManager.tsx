'use client'

import { useEffect, useState } from 'react'
import { getToken, isCompletelyLoggedOut } from '@/lib/token'
import { usePathname } from 'next/navigation'
import { startTokenManager } from '@/lib/tokenManager'

export function TokenManager({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const pathname = usePathname()

  // Páginas que não precisam de autenticação
  const publicPages = ['/login', '/register']
  const isPublicPage = publicPages.includes(pathname)

  useEffect(() => {
    // Para páginas públicas, liberar imediatamente
    if (isPublicPage) {
      setIsReady(true)
      return
    }

    // Para páginas privadas, verificar se o usuário está completamente deslogado
    if (isCompletelyLoggedOut()) {
      console.log('TokenManager: Usuário completamente deslogado, redirecionando para login')
      window.location.href = '/login'
      return
    }
    
    const token = getToken()
    
    if (!token) {
      // Se não tem token mas não está completamente deslogado, tentar renovar
      console.log('TokenManager: Token não encontrado, tentando renovar...')
      import('@/lib/token').then(({ refreshAccessToken }) => {
        refreshAccessToken().then(result => {
          if (!result) {
            console.log('TokenManager: Falha no refresh, redirecionando para login')
            window.location.href = '/login'
          } else {
            console.log('TokenManager: Token renovado com sucesso')
            setIsReady(true)
          }
        })
      })
      return
    }

    // Se tem token, iniciar o gerenciador automático
    console.log('TokenManager: Iniciando gerenciador automático de tokens')
    const stopTokenManager = startTokenManager()
    
    // Se tem token, liberar o carregamento
    setIsReady(true)

    // Cleanup function
    return () => {
      console.log('TokenManager: Parando gerenciador de tokens')
      stopTokenManager()
    }
  }, [pathname, isPublicPage])

  // Se ainda não está pronto, mostrar spinner
  if (!isReady) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
