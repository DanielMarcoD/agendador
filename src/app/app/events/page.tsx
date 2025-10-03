'use client'

import { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/components/ToastProvider'
import { deleteEvent, listEvents, EventDTO } from '@/lib/eventsApi'
import { getCategoryLabel, getCategoryColor } from '@/lib/dateUtils'
import CategorySelect, { categories as categoryOptions } from '@/components/CategorySelect'

function defaultRanges() {
  // Retorna um período amplo para mostrar todos os eventos
  const now = new Date()
  const start = new Date(now.getFullYear() - 2, 0, 1) // 2 anos atrás
  const end = new Date(now.getFullYear() + 2, 11, 31, 23, 59, 59, 999) // 2 anos no futuro
  return { from: start.toISOString(), to: end.toISOString() }
}

export default function EventsPage() {
  const toast = useToast()
  const [events, setEvents] = useState<EventDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'custom' | 'today' | 'week' | 'month' | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState<{from:string; to:string; category?: EventDTO['category']}>(
    defaultRanges()
  )

  async function load() {
    setLoading(true)
    try {
      const res = await listEvents(filter)
      setEvents(res.events as EventDTO[])
    } catch {
      toast.show({ type: 'danger', title: 'Erro', message: 'Não foi possível carregar eventos' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter.from, filter.to, filter.category])

  function applyTodayFilter() {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    
    setSelectedPeriod('today')
    setFilter({ from: start.toISOString(), to: end.toISOString(), category: filter.category })
  }

  function applyWeekFilter() {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - (now.getDay() || 7) + 1)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    
    setSelectedPeriod('week')
    setFilter({ from: start.toISOString(), to: end.toISOString(), category: filter.category })
  }

  function applyMonthFilter() {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    setSelectedPeriod('month')
    setFilter({ from: start.toISOString(), to: end.toISOString(), category: filter.category })
  }

  function applyAllFilter() {
    const ranges = defaultRanges()
    setSelectedPeriod('all')
    setFilter({ from: ranges.from, to: ranges.to, category: filter.category })
  }

  function onDateFilterChange(from: string, to: string) {
    setSelectedPeriod('custom')
    setFilter(f => ({ ...f, from, to }))
  }

  async function onDelete(id: string) {
    try {
      console.log('Tentando excluir evento:', id)
      await deleteEvent(id)
      console.log('Evento excluído com sucesso')
      toast.show({ type: 'success', title: 'Excluído', message: 'Evento removido' })
      setEvents((prev) => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast.show({ type: 'danger', title: 'Erro', message: 'Falha ao excluir evento. Verifique sua conexão.' })
    }
  }

  const fromLocal = useMemo(() => new Date(filter.from).toISOString().slice(0,16), [filter.from])
  const toLocal = useMemo(() => new Date(filter.to).toISOString().slice(0,16), [filter.to])

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <a href="/app" className="btn btn-sm btn-outline-light">
            ← Dashboard
          </a>
          <span className="navbar-brand mb-0">Gerenciar Eventos</span>
        </div>
        <a href="/app/events/new" className="btn btn-sm btn-success">
          + Novo Evento
        </a>
      </nav>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="h4 m-0">Seus Eventos</h1>
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${selectedPeriod === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={applyAllFilter}
          >
            Todos
          </button>
          <button 
            className={`btn btn-sm ${selectedPeriod === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={applyTodayFilter}
          >
            Hoje
          </button>
          <button 
            className={`btn btn-sm ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={applyWeekFilter}
          >
            Semana
          </button>
          <button 
            className={`btn btn-sm ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={applyMonthFilter}
          >
            Mês
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h6 mb-0">Filtros Avançados</h2>
              {(selectedPeriod === 'custom' || filter.category) && (
                <span className="badge bg-primary rounded-pill">
                  {[selectedPeriod === 'custom' ? 'Data' : '', filter.category ? 'Categoria' : ''].filter(Boolean).length}
                </span>
              )}
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary"
              type="button" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className={`fas fa-${showFilters ? 'chevron-up' : 'filter'} me-1`}></i>
              {showFilters ? 'Ocultar' : 'Filtrar'}
            </button>
          </div>
        </div>
        {showFilters && (
        <div className="card-body" style={{ animation: 'fadeIn 0.3s ease-in' }}>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <label className="form-label">De</label>
              <input 
                type="date" 
                value={fromLocal.split('T')[0]} 
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  selectedDate.setHours(0, 0, 0, 0)
                  onDateFilterChange(selectedDate.toISOString(), filter.to)
                }} 
                className="form-control" 
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5.5 3V1m5 2V1M3 6h10M3 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\'/%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              />
              <small className="text-muted">Clique para abrir calendário</small>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Até</label>
              <input 
                type="date" 
                value={toLocal.split('T')[0]} 
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value)
                  selectedDate.setHours(23, 59, 59, 999)
                  onDateFilterChange(filter.from, selectedDate.toISOString())
                }} 
                className="form-control"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M5.5 3V1m5 2V1M3 6h10M3 3h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z\'/%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1rem'
                }}
              />
              <small className="text-muted">Clique para abrir calendário</small>
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">Categoria</label>
              <select 
                className="form-select" 
                value={filter.category ?? ''} 
                onChange={(e) => setFilter(f => ({...f, category: e.target.value as any || undefined}))}
              >
                <option value="">Todas as categorias</option>
                {categoryOptions.map(c => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        )}
      </div>

      {!loading && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <small className="text-muted">
            {events.length > 0 ? (
              selectedPeriod === 'all' 
                ? `${events.length} evento${events.length !== 1 ? 's' : ''} no total`
                : `${events.length} evento${events.length !== 1 ? 's' : ''} encontrado${events.length !== 1 ? 's' : ''}`
            ) : (
              selectedPeriod === 'all'
                ? 'Você ainda não tem eventos cadastrados'
                : 'Nenhum evento encontrado no período selecionado'
            )}
          </small>
          <div className="btn-group btn-group-sm">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => window.location.reload()}
              title="Atualizar"
            >
              <i className="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
      )}

      <div className="events-list">
        {loading && (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        )}
        
        {!loading && events.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="fas fa-calendar-times fa-3x text-muted"></i>
            </div>
            <h5 className="text-muted">
              {selectedPeriod === 'all' ? 'Nenhum evento cadastrado' : 'Nenhum evento encontrado'}
            </h5>
            <p className="text-muted mb-3">
              {selectedPeriod === 'all' 
                ? 'Que tal criar seu primeiro evento?' 
                : 'Não há eventos no período selecionado. Tente ajustar os filtros ou criar um novo evento.'
              }
            </p>
            <a href="/app/events/new" className="btn btn-primary">
              <i className="fas fa-plus me-2"></i>
              {selectedPeriod === 'all' ? 'Criar Primeiro Evento' : 'Criar Novo Evento'}
            </a>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="row">
            {events.map(ev => (
              <div key={ev.id} className="col-12 mb-3">
                <div className={`card border-start border-4 border-${getCategoryColor(ev.category)} shadow-sm`}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h5 className="card-title mb-0">{ev.title}</h5>
                          <span className={`badge bg-${getCategoryColor(ev.category)} rounded-pill`}>
                            {getCategoryLabel(ev.category)}
                          </span>
                        </div>
                        
                        <div className="row text-muted small mb-2">
                          <div className="col-sm-6">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            {new Date(ev.startsAt).toLocaleDateString('pt-BR', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </div>
                          <div className="col-sm-6">
                            <i className="fas fa-clock me-2 text-success"></i>
                            {new Date(ev.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(ev.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {ev.description && (
                          <p className="card-text text-muted mb-0" style={{fontSize: '0.9rem'}}>
                            {ev.description.length > 120 ? 
                              `${ev.description.substring(0, 120)}...` : 
                              ev.description
                            }
                          </p>
                        )}
                      </div>
                      
                      <div className="col-md-4 text-md-end mt-3 mt-md-0">
                        <div className="d-flex gap-2 justify-content-md-end">
                          <a 
                            href={`/app/events/${ev.id}/edit`}
                            className="btn btn-sm btn-warning d-flex align-items-center"
                            title="Editar evento"
                          >
                            <i className="fas fa-edit me-1"></i>
                            <span className="d-none d-md-inline">Editar</span>
                          </a>
                          <button 
                            className="btn btn-sm btn-danger d-flex align-items-center"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir o evento "${ev.title}"?\n\nEsta ação não pode ser desfeita.`)) {
                                onDelete(ev.id)
                              }
                            }}
                            title="Excluir evento"
                          >
                            <i className="fas fa-trash me-1"></i>
                            <span className="d-none d-md-inline">Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
