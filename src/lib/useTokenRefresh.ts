import { useEffect } from 'react'
import { refreshAccessToken, getToken } from './token'

// Hook para gerenciar refresh automático do token
export function useTokenRefresh() {
  useEffect(() => {
    // Função que faz o refresh
    const doRefresh = async () => {
      const token = getToken()
      if (!token) {
        // Se não tem token, redirecionar para login
        window.location.href = '/login'
        return
      }

      try {
        console.log('Executando refresh automático do token...')
        const result = await refreshAccessToken()
        if (!result) {
          // Se falhou, redireciona para login
          console.log('Token refresh falhou, redirecionando para login')
          window.location.href = '/login'
        } else {
          console.log('Token refresh realizado com sucesso às', new Date().toLocaleTimeString())
        }
      } catch (error) {
        console.error('Erro no refresh automático:', error)
        window.location.href = '/login'
      }
    }

    // Verifica se há um token válido antes de iniciar
    const token = getToken()
    if (!token) {
      console.log('Nenhum token encontrado, redirecionando para login')
      window.location.href = '/login'
      return
    }

    // Executa depois de 5 segundos para dar tempo do componente carregar
    console.log('Iniciando sistema de refresh automático de token')
    setTimeout(doRefresh, 5000)

    // Configura refresh a cada 2 minutos (menos agressivo)
    const interval = setInterval(doRefresh, 2 * 60 * 1000)

    // Cleanup
    return () => {
      console.log('Parando sistema de refresh automático')
      clearInterval(interval)
    }
  }, [])
}

// Função para fazer refresh manual quando necessário
export async function ensureValidToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false

  try {
    const result = await refreshAccessToken()
    return result !== null
  } catch (error) {
    console.error('Erro ao garantir token válido:', error)
    return false
  }
}
