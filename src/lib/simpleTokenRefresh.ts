import { useEffect } from 'react'
import { refreshAccessToken, getToken } from './token'

// Hook simplificado para refresh token apenas quando necessário
export function useTokenRefresh() {
  useEffect(() => {
    let interval: NodeJS.Timeout

    const setupRefresh = () => {
      // Verifica se há token
      const token = getToken()
      if (!token) return

      // Função que faz o refresh quando necessário
      const doRefreshIfNeeded = async () => {
        try {
          const currentToken = getToken()
          if (!currentToken) {
            window.location.href = '/login'
            return
          }

          // Tenta fazer refresh
          const result = await refreshAccessToken()
          if (!result) {
            console.log('Refresh token falhou, redirecionando para login')
            window.location.href = '/login'
          }
        } catch (error) {
          console.error('Erro no refresh token:', error)
          // Não redirecionar imediatamente em caso de erro, apenas logar
        }
      }

      // Executa refresh a cada 5 minutos (bem menos agressivo)
      interval = setInterval(doRefreshIfNeeded, 5 * 60 * 1000)
    }

    setupRefresh()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])
}

// Função utilitária para refresh manual
export async function manualRefresh(): Promise<boolean> {
  try {
    const result = await refreshAccessToken()
    return result !== null
  } catch (error) {
    console.error('Erro no refresh manual:', error)
    return false
  }
}
