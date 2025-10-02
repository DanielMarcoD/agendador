'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { API_URL, api } from '@/lib/api'
import { encryptRegisterData } from '@/lib/crypto'
import { useToast } from '@/components/ToastProvider'

const schema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6) })
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToast()

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      // Versão completa com todos os dados criptografados (descomente se quiser criptografar o nome também)
      // const { nameEnc, emailEnc, passwordEnc, kid } = await encryptRegisterData(API_URL, data.name, data.email, data.password)
      // await api('/auth/register', { method: 'POST', body: JSON.stringify({ nameEnc, emailEnc, passwordEnc, kid }) })
      
      // Versão atual com email e senha criptografados
      const { emailEnc, passwordEnc, kid } = await encryptRegisterData(API_URL, data.name, data.email, data.password)
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ name: data.name, emailEnc, passwordEnc, kid }) })
      
      toast.show({ type: 'success', title: 'Conta criada', message: 'Faça login para continuar' })
      router.push('/login')
    } catch {
      setError('Falha no cadastro')
      toast.show({ type: 'danger', title: 'Erro', message: 'Não foi possível criar sua conta' })
    }
  }

  return (
    <main className="container auth-min-h d-flex align-items-center justify-content-center">
      <div className="card shadow-sm p-4 w-100 auth-card">
        <h1 className="h4 mb-3">Criar conta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
          <div>
            <label className="form-label">Nome</label>
            <input className="form-control" placeholder="Seu nome" {...register('name')} />
            {errors.name && <div className="form-text text-danger">{errors.name.message}</div>}
          </div>
          <div>
            <label className="form-label">E-mail</label>
            <input className="form-control" placeholder="email@exemplo.com" {...register('email')} />
            {errors.email && <div className="form-text text-danger">{errors.email.message}</div>}
          </div>
          <div>
            <label className="form-label">Senha</label>
            <input type="password" className="form-control" placeholder="Mínimo 6 caracteres" {...register('password')} />
            {errors.password && <div className="form-text text-danger">{errors.password.message}</div>}
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button disabled={isSubmitting} className="btn btn-primary w-100">{isSubmitting ? 'Criando...' : 'Criar conta'}</button>
        </form>
        <p className="mt-3 mb-0 text-secondary">Já tem conta? <a className="link-light" href="/login">Entrar</a></p>
      </div>
    </main>
  )
}
