export type ServerKey = { kid: string; pem: string; alg: string }

let cache: { key: CryptoKey; kid: string } | null = null

function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, '')
  const bin = atob(b64)
  const buf = new ArrayBuffer(bin.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i)
  return buf
}

export async function getEncryptor(apiUrl: string) {
  if (cache) return cache
  const res = await fetch(`${apiUrl}/auth/pubkey`).then(r => r.json() as Promise<ServerKey>)
  const keyData = pemToArrayBuffer(res.pem)
  const key = await crypto.subtle.importKey(
    'spki',
    keyData,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt']
  )
  cache = { key, kid: res.kid }
  return cache
}

export async function encryptPassword(apiUrl: string, plain: string) {
  const { key, kid } = await getEncryptor(apiUrl)
  const enc = new TextEncoder().encode(plain)
  const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, enc)
  const b64 = btoa(String.fromCharCode(...new Uint8Array(ct)))
  return { passwordEnc: b64, kid }
}

export async function encryptData(apiUrl: string, data: string) {
  const { key, kid } = await getEncryptor(apiUrl)
  const enc = new TextEncoder().encode(data)
  const ct = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, enc)
  const b64 = btoa(String.fromCharCode(...new Uint8Array(ct)))
  return { encrypted: b64, kid }
}

export async function encryptLoginData(apiUrl: string, email: string, password: string) {
  const { key, kid } = await getEncryptor(apiUrl)
  
  // Criptografa o email
  const emailEnc = new TextEncoder().encode(email)
  const emailCt = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, emailEnc)
  const emailB64 = btoa(String.fromCharCode(...new Uint8Array(emailCt)))
  
  // Criptografa a senha
  const passwordEnc = new TextEncoder().encode(password)
  const passwordCt = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, passwordEnc)
  const passwordB64 = btoa(String.fromCharCode(...new Uint8Array(passwordCt)))
  
  return {
    emailEnc: emailB64,
    passwordEnc: passwordB64,
    kid
  }
}

export async function encryptRegisterData(apiUrl: string, name: string, email: string, password: string) {
  const { key, kid } = await getEncryptor(apiUrl)
  
  // Criptografa o nome
  const nameEnc = new TextEncoder().encode(name)
  const nameCt = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, nameEnc)
  const nameB64 = btoa(String.fromCharCode(...new Uint8Array(nameCt)))
  
  // Criptografa o email
  const emailEnc = new TextEncoder().encode(email)
  const emailCt = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, emailEnc)
  const emailB64 = btoa(String.fromCharCode(...new Uint8Array(emailCt)))
  
  // Criptografa a senha
  const passwordEnc = new TextEncoder().encode(password)
  const passwordCt = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, passwordEnc)
  const passwordB64 = btoa(String.fromCharCode(...new Uint8Array(passwordCt)))
  
  return {
    nameEnc: nameB64,
    emailEnc: emailB64,
    passwordEnc: passwordB64,
    kid
  }
}
