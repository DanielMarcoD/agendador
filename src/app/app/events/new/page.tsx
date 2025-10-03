'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'
import { createEvent, getCategories, RecurrenceType, ParticipantRole, User } from '@/lib/eventsApi'
import DateTimePicker from '@/components/DateTimePicker'
import CategorySelect from '@/components/CategorySelect'
import RecurrenceSelect from '@/components/RecurrenceSelect'
import UserSelect from '@/components/UserSelect'

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  startsAt: z.date(),
  endsAt: z.date(),
  recurrence: z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional()
}).refine((d) => d.endsAt.getTime() > d.startsAt.getTime(), { 
  message: 'A data de fim deve ser posterior à data de início', 
  path: ['endsAt'] 
})

type FormData = z.infer<typeof formSchema>

export default function NewEventPage() {
  const [categories, setCategories] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<Array<{ user: User; role: ParticipantRole }>>([])
  const toast = useToast()
  const router = useRouter()

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({ 
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Definir horários padrão (próxima hora cheia)
      startsAt: (() => {
        const now = new Date()
        now.setMinutes(0, 0, 0)
        now.setHours(now.getHours() + 1)
        return now
      })(),
      endsAt: (() => {
        const now = new Date()
        now.setMinutes(0, 0, 0)
        now.setHours(now.getHours() + 2)
        return now
      })(),
      recurrence: 'NONE'
    }
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories()
        setCategories(res.categories)
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
        toast.show({ type: 'danger', title: 'Erro', message: 'Não foi possível carregar as categorias' })
        // Fallback para categorias em português
        setCategories(['alerta', 'estudo', 'lembrete', 'reuniao', 'tarefa'])
      } finally {
        setLoadingCategories(false)
      }
    }
    
    loadCategories()
  }, [toast])

  const handleUserAdd = (user: User, role: ParticipantRole) => {
    setSelectedUsers(prev => [...prev, { user, role }])
  }

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(item => item.user.id !== userId))
  }

  const handleRoleChange = (userId: string, role: ParticipantRole) => {
    setSelectedUsers(prev => 
      prev.map(item => 
        item.user.id === userId 
          ? { ...item, role }
          : item
      )
    )
  }

  async function onCreate(data: FormData) {
    try {
      await createEvent({
        title: data.title,
        description: data.description,
        category: data.category as any,
        startsAt: data.startsAt.toISOString(),
        endsAt: data.endsAt.toISOString(),
        recurrence: data.recurrence || 'NONE',
        participants: selectedUsers.map(({ user, role }) => ({
          userId: user.id,
          role
        }))
      })
      
      toast.show({ 
        type: 'success', 
        title: 'Evento criado!', 
        message: 'Seu evento foi adicionado com sucesso' 
      })
      
      // Redirecionar de volta para o dashboard após 2 segundos
      setTimeout(() => {
        router.push('/app')
      }, 2000)
      
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      toast.show({ 
        type: 'danger', 
        title: 'Erro ao criar evento', 
        message: 'Não foi possível criar o evento. Tente novamente.' 
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      alert: 'Alerta',
      study: 'Estudo',
      reminder: 'Lembrete',
      meeting: 'Reunião',
      task: 'Tarefa',
      alerta: 'Alerta',
      estudo: 'Estudo',
      lembrete: 'Lembrete',
      reuniao: 'Reunião',
      tarefa: 'Tarefa'
    }
    return labels[category.toLowerCase() as keyof typeof labels] || category
  }

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <a href="/app" className="btn btn-sm btn-outline-light">
            ← Voltar
          </a>
          <span className="navbar-brand mb-0">Novo Evento</span>
        </div>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card p-4">
            <h2 className="h5 mb-4">Criar novo evento</h2>
            
            <form onSubmit={handleSubmit(onCreate)} className="vstack gap-3">
              <div>
                <label className="form-label">Título *</label>
                <input 
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  placeholder="Ex: Reunião com equipe"
                  {...register('title')} 
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title.message}</div>
                )}
              </div>

              <div>
                <label className="form-label">Categoria *</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value || ''}
                      onChange={field.onChange}
                      loading={loadingCategories}
                      error={errors.category?.message}
                      required
                    />
                  )}
                />
                {errors.category && (
                  <div className="invalid-feedback d-block">{errors.category.message}</div>
                )}
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Data e hora de início *</label>
                  <Controller
                    name="startsAt"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        selected={field.value}
                        onChange={field.onChange}
                        placeholderText="Selecione data e hora de início"
                        className={`form-control ${errors.startsAt ? 'is-invalid' : ''}`}
                        minDate={new Date()}
                      />
                    )}
                  />
                  {errors.startsAt && (
                    <div className="invalid-feedback d-block">{errors.startsAt.message}</div>
                  )}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">Data e hora de fim *</label>
                  <Controller
                    name="endsAt"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        selected={field.value}
                        onChange={field.onChange}
                        placeholderText="Selecione data e hora de fim"
                        className={`form-control ${errors.endsAt ? 'is-invalid' : ''}`}
                        minDate={new Date()}
                      />
                    )}
                  />
                  {errors.endsAt && (
                    <div className="invalid-feedback d-block">{errors.endsAt.message}</div>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">Descrição (opcional)</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Adicione detalhes sobre o evento..."
                  {...register('description')} 
                />
              </div>

              <div>
                <label className="form-label">Repetição</label>
                <Controller
                  name="recurrence"
                  control={control}
                  render={({ field }) => (
                    <RecurrenceSelect
                      value={field.value || 'NONE'}
                      onChange={field.onChange}
                      error={errors.recurrence?.message}
                    />
                  )}
                />
              </div>

              <UserSelect
                selectedUsers={selectedUsers}
                onUserAdd={handleUserAdd}
                onUserRemove={handleUserRemove}
                onRoleChange={handleRoleChange}
              />

              <div className="d-flex gap-2 pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || loadingCategories} 
                  className="btn btn-primary flex-grow-1"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Salvando...
                    </>
                  ) : (
                    'Criar Evento'
                  )}
                </button>
                <a href="/app" className="btn btn-outline-secondary">
                  Cancelar
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
