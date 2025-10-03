import { getToken, refreshAccessToken } from './token'

// Decodifica o JWT para obter informações de expiração
function decodeJWT(token: string) {
  try {
    const base64Payload = token.split('.')[1]
    const payload = JSON.parse(atob(base64Payload))
    return payload
  } catch (error) {
    return null
  }
}

// Verifica se o token expira nos próximos X minutos
function tokenExpiresInMinutes(token: string, minutes: number = 5): boolean {
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  
  const expirationTime = payload.exp * 1000 // Converter para milliseconds
  const currentTime = Date.now()
  const timeUntilExpiration = expirationTime - currentTime
  const minutesUntilExpiration = timeUntilExpiration / (1000 * 60)
  
  return minutesUntilExpiration <= minutes
}

// Função que garante que sempre temos um token válido
export async function ensureValidToken(): Promise<boolean> {
  try {
    const token = getToken()
    if (!token) {
      console.log('Nenhum token encontrado')
      return false
    }

    // Se o token expira em 5 minutos ou menos, renovar
    if (tokenExpiresInMinutes(token, 5)) {
      console.log('Token expira em breve, renovando...')
      const result = await refreshAccessToken()
      if (!result) {
        console.log('Falha ao renovar token')
        return false
      }
      console.log('Token renovado com sucesso')
    }

    return true
  } catch (error) {
    console.error('Erro ao validar token:', error)
    return false
  }
}

// Sistema de renovação automática mais inteligente
export function startTokenManager() {
  // Verifica a cada 1 minuto
  const interval = setInterval(async () => {
    const token = getToken()
    if (!token) {
      clearInterval(interval)
      return
    }

    try {
      if (tokenExpiresInMinutes(token, 2)) {
        console.log('Token manager: renovando token preventivamente...')
        const result = await refreshAccessToken()
        if (!result) {
          console.log('Token manager: falha na renovação, limpando interval')
          clearInterval(interval)
          window.location.href = '/login'
        }
      }
    } catch (error) {
      console.error('Token manager: erro na renovação automática:', error)
    }
  }, 60 * 1000) // A cada 1 minuto

  return () => clearInterval(interval)
}
