export function isTokenExpired(token: string): boolean {
  if (!token) return true
  
  try {
    // Decodifica o JWT payload (parte do meio)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    
    // Verifica se o token expira em menos de 30 segundos (renovar preventivamente)
    return payload.exp < (currentTime + 30)
  } catch (error) {
    console.error('Erro ao verificar expiração do token:', error)
    return true
  }
}

export function getTokenExpirationTime(token: string): Date | null {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return new Date(payload.exp * 1000)
  } catch (error) {
    console.error('Erro ao obter tempo de expiração do token:', error)
    return null
  }
}
