'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '../../../../../components/ToastProvider'
import { getEvent, updateEvent, EventDTO } from '../../../../../lib/eventsApi'
import DateTimePicker from '../../../../../components/DateTimePicker'
import CategorySelect from '../../../../../components/CategorySelect'
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

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="btn btn-sm btn-outline-light"
          >
            ← Voltar
          </button>
          <span className="navbar-brand mb-0">Editar Evento</span>
        </div>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h1 className="h5 mb-0">Editar Evento</h1>
            </div>
            <div className="card-body">
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
                  <div className="col-md-6">
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
                  <div className="col-md-6">
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
                  <label className="form-label">Descrição</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    {...register('description')}
                    placeholder="Adicione uma descrição opcional para o evento"
                  />
                </div>

                <div className="d-flex gap-2 justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => router.back()}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn btn-primary"
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
