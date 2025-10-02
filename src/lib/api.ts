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

export async function api(path: string, init: RequestInit = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
      ...init
    })
    
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
    
    return res.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Erros de rede ou outros erros não relacionados à API
    throw new ApiError(0, { message: 'Erro de conexão' }, 'Não foi possível conectar ao servidor')
  }
}
