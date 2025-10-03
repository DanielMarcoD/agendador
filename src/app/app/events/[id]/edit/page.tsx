'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '../../../../../components/ToastProvider'
import { getEvent, updateEvent, EventDTO } from '../../../../../lib/eventsApi'
import { getCategoryLabel } from '../../../../../lib/dateUtils'

const formSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  startsAt: z.date(),
  endsAt: z.date(),
  description: z.string().optional()
}).refine((data) => data.endsAt.getTime() > data.startsAt.getTime(), {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['endsAt']
})

type FormData = z.infer<typeof formSchema>

export default function EditEventPage() {
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true)
        const event = await getEvent(params.id as string)
        
        // Converter datas para o formato datetime-local
        const startDate = new Date(event.startsAt)
        const endDate = new Date(event.endsAt)
        
        reset({
          title: event.title,
          category: event.category,
          startsAt: startDate,
          endsAt: endDate,
          description: event.description || ''
        })
      } catch (error) {
        toast.show({ 
          type: 'danger', 
          title: 'Erro', 
          message: 'Não foi possível carregar o evento' 
        })
        router.push('/app/events')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadEvent()
    }
  }, [params.id, reset, toast, router])

  async function onSubmit(data: FormData) {
    try {
      await updateEvent(params.id as string, {
        title: data.title,
        description: data.description,
        category: data.category as any,
        startsAt: data.startsAt.toISOString(),
        endsAt: data.endsAt.toISOString()
      })
      
      toast.show({ 
        type: 'success', 
        title: 'Sucesso', 
        message: 'Evento atualizado com sucesso' 
      })
      
      router.push('/app/events')
    } catch (error) {
      toast.show({ 
        type: 'danger', 
        title: 'Erro', 
        message: 'Não foi possível atualizar o evento' 
      })
    }
  }

  if (loading) {
    return (
      <main className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </main>
    )
  }

  // Definir as categorias em português
  const categories = ['alerta', 'estudo', 'lembrete', 'reuniao', 'tarefa'] as const

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="btn btn-sm btn-outline-light"
          >
            <i className="fas fa-arrow-left me-1"></i>Voltar
          </button>
          <span className="navbar-brand mb-0">Editar Evento</span>
        </div>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-edit"></i>
                <h1 className="h5 mb-0">Editar Evento</h1>
              </div>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="vstack gap-3">
                <div>
                  <label className="form-label">Título *</label>
                  <input 
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    {...register('title')}
                    placeholder="Digite o título do evento"
                  />
                  {errors.title && (
                    <div className="invalid-feedback">{errors.title.message}</div>
                  )}
                  <small className="text-muted">Escolha um título claro e descritivo</small>
                </div>

                <div>
                  <label className="form-label">Categoria *</label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select 
                        className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">Selecione uma categoria</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {getCategoryLabel(category)}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.category && (
                    <div className="invalid-feedback">{errors.category.message}</div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Data e hora de início *</label>
                    <Controller
                      name="startsAt"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.startsAt ? 'is-invalid' : ''}`}
                          value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          style={{
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5.5 3V1m5 2V1M3 6h10M3 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\'/%3e%3c/svg%3e")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem'
                          }}
                        />
                      )}
                    />
                    {errors.startsAt && (
                      <div className="invalid-feedback d-block">{errors.startsAt.message}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Data e hora de fim *</label>
                    <Controller
                      name="endsAt"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="datetime-local"
                          className={`form-control ${errors.endsAt ? 'is-invalid' : ''}`}
                          value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                          style={{
                            backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5.5 3V1m5 2V1M3 6h10M3 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\'/%3e%3c/svg%3e")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 0.75rem center',
                            backgroundSize: '1rem'
                          }}
                        />
                      )}
                    />
                    {errors.endsAt && (
                      <div className="invalid-feedback d-block">{errors.endsAt.message}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Descrição</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    {...register('description')}
                    placeholder="Adicione uma descrição opcional para o evento"
                  />
                  <small className="text-muted">Detalhes adicionais sobre o evento (opcional)</small>
                </div>

                <div className="d-flex gap-2 justify-content-end pt-3 mt-3 border-top">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-times me-1"></i>
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-success"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
