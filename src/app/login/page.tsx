'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { API_URL, api, ApiError } from '@/lib/api'
import { encryptLoginData } from '@/lib/crypto'
import { setTokens } from '@/lib/token'
import { useToast } from '@/components/ToastProvider'
import { getErrorInfo, SUCCESS_MESSAGES } from '@/lib/errors'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToast()

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      const { emailEnc, passwordEnc, kid } = await encryptLoginData(API_URL, data.email, data.password)
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ emailEnc, passwordEnc, kid }) })
      setTokens(res.accessToken, res.refreshToken)
      
      const successMessage = SUCCESS_MESSAGES.LOGIN(res.user?.name)
      toast.show({ type: 'success', ...successMessage })
      router.push('/app')
    } catch (error: any) {
      console.error('Erro no login:', error)
      
      let errorInfo
      if (error instanceof ApiError) {
        // Log detalhado para debug
        console.log('Status:', error.status)
        console.log('Data:', error.data)
        console.log('Message:', error.message)
        
        if (error.status === 500) {
          errorInfo = {
            title: 'Erro no servidor',
            message: 'Problema temporário no servidor. Tente novamente em alguns minutos.'
          }
        } else if (error.status === 400 && error.data?.message?.includes('processar dados')) {
          errorInfo = {
            title: 'Erro nos dados',
            message: 'Houve um problema ao processar seus dados. Tente novamente.'
          }
        } else {
          errorInfo = getErrorInfo(error, 'Erro no login', 'Não foi possível fazer login')
        }
      } else {
        errorInfo = getErrorInfo(error, 'Erro no login', 'Não foi possível fazer login')
      }
      
      setError(errorInfo.message)
      toast.show({ type: 'danger', title: errorInfo.title, message: errorInfo.message })
    }
  }

  return (
    <main className="container auth-min-h d-flex align-items-center justify-content-center">
      <div className="card shadow-sm p-4 w-100 auth-card">
        <h1 className="h4 mb-3">Entrar</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
          <div>
            <label className="form-label">E-mail</label>
            <input className="form-control" placeholder="email@exemplo.com" {...register('email')} />
            {errors.email && <div className="form-text text-danger">{errors.email.message}</div>}
          </div>
          <div>
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" placeholder="Sua senha" {...register('password')} />
            {errors.password && <div className="form-text text-danger">{errors.password.message}</div>}
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button disabled={isSubmitting} className="btn btn-primary w-100">{isSubmitting ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="mt-3 mb-0 text-secondary">Não tem conta? <a className="link-light" href="/register">Cadastre-se</a></p>
      </div>
    </main>
  )
}
