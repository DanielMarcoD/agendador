export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken')
}

export function setToken(t: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', t)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

export function getRefreshToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(t: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('refreshToken', t)
}

export function setTokens(accessToken: string, refreshToken: string) {
  setToken(accessToken)
  setRefreshToken(refreshToken)
}

// Verifica se o usuário está completamente deslogado (sem nenhum token)
export function isCompletelyLoggedOut(): boolean {
  if (typeof window === 'undefined') return true
  
  const accessToken = getToken()
  const refreshToken = getRefreshToken()
  
  return !accessToken && !refreshToken
}

// Limpa todos os tokens (logout completo)
export function clearAllTokens(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

// Função para tentar fazer refresh do token
export async function refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    console.log('RefreshToken: Nenhum refresh token disponível')
    return null
  }

  console.log('RefreshToken: Tentando renovar token...')
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      console.log(`RefreshToken: Falha na renovação - Status ${response.status}`)
      if (response.status === 401) {
        console.log('RefreshToken: Refresh token expirado ou inválido')
      }
      clearToken()
      return null
    }

    const data = await response.json()
    console.log('RefreshToken: Token renovado com sucesso')
    setTokens(data.accessToken, data.refreshToken)
    
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    }
  } catch (error) {
    console.error('RefreshToken: Erro de rede ao renovar token:', error)
    // Não limpar tokens em caso de erro de rede, pode ser temporário
    return null
  }
}
