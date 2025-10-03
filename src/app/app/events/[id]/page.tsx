'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '../../../../components/ToastProvider'
import { getEvent, deleteEvent, EventDTO } from '../../../../lib/eventsApi'
import { getCategoryLabel, getCategoryColor, formatEventDateTime } from '../../../../lib/dateUtils'

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const [event, setEvent] = useState<EventDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventData = await getEvent(params.id as string)
        setEvent(eventData)
      } catch (error) {
        console.error('Erro ao carregar evento:', error)
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
  }, [params.id, router, toast])

  async function handleDelete() {
    if (!event) return

    const confirmed = confirm(
      `Tem certeza que deseja excluir o evento "${event.title}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      await deleteEvent(event.id)
      toast.show({
        type: 'success',
        title: 'Evento excluído',
        message: 'O evento foi removido com sucesso'
      })
      router.push('/app/events')
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast.show({
        type: 'danger',
        title: 'Erro',
        message: 'Não foi possível excluir o evento'
      })
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="container py-4">
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="container py-4">
        <div className="text-center py-5">
          <h4>Evento não encontrado</h4>
          <p className="text-muted">O evento que você está procurando não existe ou foi removido.</p>
          <a href="/app/events" className="btn btn-primary">
            Voltar aos eventos
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <a href="/app/events" className="btn btn-sm btn-outline-light">
            ← Voltar
          </a>
          <span className="navbar-brand mb-0">Detalhes do Evento</span>
        </div>
        <div className="d-flex gap-2">
          <a 
            href={`/app/events/${event.id}/edit`}
            className="btn btn-sm btn-primary"
          >
            <i className="fas fa-edit me-1"></i>
            Editar
          </a>
          <button 
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                Excluindo...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Excluir
              </>
            )}
          </button>
        </div>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className={`card border-start border-4 border-${getCategoryColor(event.category)} shadow-sm`}>
            <div className="card-header bg-light">
              <div className="d-flex align-items-center justify-content-between">
                <h1 className="h4 mb-0">{event.title}</h1>
                <span className={`badge bg-${getCategoryColor(event.category)} rounded-pill`}>
                  {getCategoryLabel(event.category)}
                </span>
              </div>
            </div>
            
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-calendar-alt me-3 text-primary" style={{width: '20px'}}></i>
                    <div>
                      <h6 className="mb-0">Data de Início</h6>
                      <p className="text-muted mb-0">
                        {new Date(event.startsAt).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-clock me-3 text-success" style={{width: '20px'}}></i>
                    <div>
                      <h6 className="mb-0">Horário</h6>
                      <p className="text-muted mb-0">
                        {new Date(event.startsAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {' - '}
                        {new Date(event.endsAt).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <i className="fas fa-tag me-3 text-info" style={{width: '20px'}}></i>
                    <div>
                      <h6 className="mb-0">Categoria</h6>
                      <p className="text-muted mb-0">{getCategoryLabel(event.category)}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-align-left me-3 text-secondary mt-1" style={{width: '20px'}}></i>
                    <div className="w-100">
                      <h6 className="mb-2">Descrição</h6>
                      {event.description ? (
                        <p className="text-muted mb-0" style={{whiteSpace: 'pre-wrap'}}>
                          {event.description}
                        </p>
                      ) : (
                        <p className="text-muted fst-italic mb-0">
                          Nenhuma descrição fornecida
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {formatEventDateTime(event.startsAt, event.endsAt)}
                </small>
                <div className="d-flex gap-2">
                  <a 
                    href={`/app/events/${event.id}/edit`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="fas fa-edit me-1"></i>
                    Editar Evento
                  </a>
                  <a href="/app/events" className="btn btn-outline-secondary btn-sm">
                    Voltar à Lista
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
