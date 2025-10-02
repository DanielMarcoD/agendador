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
}
