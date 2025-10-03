import { getToken, getRefreshToken, setTokens, clearAllTokens, isCompletelyLoggedOut } from './token'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export class ApiError extends Error {
  status: number
  data?: any

  constructor(status: number, data?: any, message?: string) {
    super(message || `HTTP ${status}`)
    this.status = status
    this.data = data
    this.name = 'ApiError'
  }
}

// Flag para evitar múltiplas tentativas simultâneas de refresh
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function tryRefreshToken(): Promise<string | null> {
  if (isRefreshing) {
    // Se já está fazendo refresh, esperar o resultado
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return null

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      if (!response.ok) {
        // Refresh token inválido, limpar tudo
        clearAllTokens()
        return null
      }

      const data = await response.json()
      setTokens(data.accessToken, data.refreshToken)
      
      return data.accessToken
    } catch (error) {
      console.error('Erro no refresh token:', error)
      clearAllTokens()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function api(path: string, init: RequestInit = {}, retryCount = 0): Promise<any> {
  try {
    const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/refresh')

    // Preparar headers
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> || {})
    }
    
    // Só adicionar Content-Type se há body
    if (init.body && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Adicionar token se disponível (exceto para requisições de auth)
    if (!isAuthRequest && typeof window !== 'undefined') {
      const token = getToken()
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`
      }
    }

    const res = await fetch(`${API_URL}${path}`, {
      headers,
      ...init
    })
    
    // Se token expirou e temos refresh token, tentar renovar
    if (res.status === 401 && retryCount === 0 && typeof window !== 'undefined' && !isAuthRequest) {
      console.log('Token expirado, verificando se há refresh token...')
      
      if (!isCompletelyLoggedOut()) {
        console.log('Tentando refresh automático...')
        const newToken = await tryRefreshToken()
        
        if (newToken) {
          console.log('Token renovado com sucesso, tentando novamente...')
          // Tentar novamente com o novo token
          return api(path, init, 1)
        } else {
          console.log('Refresh token inválido ou expirado')
        }
      } else {
        console.log('Usuário completamente deslogado')
      }
      
      // Só redireciona se não conseguiu fazer refresh OU se usuário está completamente deslogado
      console.log('Redirecionando para login - não foi possível renovar token')
      window.location.href = '/login'
      return
    }
    
    if (!res.ok) {
      let errorData
      const contentType = res.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await res.json()
        throw new ApiError(res.status, errorData, errorData.message || `HTTP ${res.status}`)
      } else {
        const text = await res.text()
        throw new ApiError(res.status, { message: text }, text || `HTTP ${res.status}`)
      }
    }
    
    // Para status 204 (No Content), não tentar fazer parse do JSON
    if (res.status === 204) {
      return null
    }
    
    // Verificar se há conteúdo antes de fazer parse
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return res.json()
    } else {
      // Se não é JSON, retornar texto ou null se vazio
      const text = await res.text()
      return text || null
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Erros de rede ou outros erros não relacionados à API
    console.error('Erro de conexão com API:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(0, { message: 'Servidor indisponível' }, `Não foi possível conectar ao servidor em ${API_URL}`)
    }
    
    throw new ApiError(0, { message: 'Erro de conexão' }, 'Erro inesperado de conectividade')
  }
}
