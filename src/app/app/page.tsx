'use client'

import { useEffect, useState } from 'react'
import { getToken, clearToken } from '@/lib/token'
import { useRouter } from 'next/navigation'
import { listEvents, EventDTO } from '@/lib/eventsApi'
import { getDateRanges, formatEventDateTime, getCategoryLabel, getCategoryColor } from '@/lib/dateUtils'
import { useToast } from '@/components/ToastProvider'
import { canEditEvent, canDeleteEvent, getUserRoleInEvent } from '@/lib/eventPermissions'

// Funções para organizar eventos por dia
function getWeekDays(startDate: Date) {
  const days = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 7; i++) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

function getMonthWeeks(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  
  // Ajustar para começar na segunda-feira
  const dayOfWeek = startDate.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDate.setDate(startDate.getDate() + daysToMonday)
  
  const weeks = []
  const current = new Date(startDate)
  
  while (current <= lastDay || current.getMonth() === month) {
    const week = getWeekDays(current)
    weeks.push(week)
    current.setDate(current.getDate() + 7)
    
    // Parar se já passou do mês e completou a semana
    if (current.getMonth() !== month && week[6].getMonth() !== month) {
      break
    }
  }
  
  return weeks
}

function groupEventsByDate(events: EventDTO[]) {
  const groups: { [key: string]: EventDTO[] } = {}
  
  events.forEach(event => {
    const date = new Date(event.startsAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
  })
  
  return groups
}

type Period = 'today' | 'week' | 'month'

export default function AppPage() {
  const [user, setUser] = useState<{id:string,name:string,email:string}|null>(null)
  const [events, setEvents] = useState<EventDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('today')
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0) // Para navegar entre semanas
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0) // Para navegar entre meses
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    const t = getToken()
    if (!t) { router.replace('/login'); return }
    
    ;(async () => {
      try {
        const me = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `Bearer ${t}` }
        }).then(r => r.json())
        setUser(me.user ?? null)
      } finally {
        setLoading(false)
      }
    })()
  }, [router])

  // Função para obter ranges com offsets
  function getDateRangesWithOffset(period: Period, weekOffset: number, monthOffset: number) {
    const now = new Date()
    
    if (period === 'today') {
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date(now)
      todayEnd.setHours(23, 59, 59, 999)
      return { from: todayStart.toISOString(), to: todayEnd.toISOString() }
    }
    
    if (period === 'week') {
      const weekStart = new Date(now)
      const dayOfWeek = weekStart.getDay()
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      weekStart.setDate(weekStart.getDate() + daysToMonday + (weekOffset * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      return { from: weekStart.toISOString(), to: weekEnd.toISOString() }
    }
    
    if (period === 'month') {
      const targetMonth = now.getMonth() + monthOffset
      const targetYear = now.getFullYear() + Math.floor(targetMonth / 12)
      const normalizedMonth = ((targetMonth % 12) + 12) % 12
      
      const monthStart = new Date(targetYear, normalizedMonth, 1)
      monthStart.setHours(0, 0, 0, 0)
      const monthEnd = new Date(targetYear, normalizedMonth + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)
      
      return { from: monthStart.toISOString(), to: monthEnd.toISOString() }
    }
    
    return getDateRanges()[period]
  }

  async function loadEvents(period: Period) {
    setEventsLoading(true)
    try {
      const range = getDateRangesWithOffset(period, currentWeekOffset, currentMonthOffset)
      const res = await listEvents({ from: range.from, to: range.to })
      setEvents(res.events as EventDTO[])
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      toast.show({ type: 'danger', title: 'Erro', message: 'Não foi possível carregar eventos' })
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadEvents(selectedPeriod)
    }
  }, [user, selectedPeriod, currentWeekOffset, currentMonthOffset])

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period)
    setCurrentWeekOffset(0)
    setCurrentMonthOffset(0)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonthOffset(prev => direction === 'next' ? prev + 1 : prev - 1)
  }

  const getCurrentPeriodLabel = () => {
    if (selectedPeriod === 'today') return 'Hoje'
    
    if (selectedPeriod === 'week') {
      const range = getDateRangesWithOffset('week', currentWeekOffset, 0)
      const startDate = new Date(range.from)
      const endDate = new Date(range.to)
      
      if (currentWeekOffset === 0) return 'Esta Semana'
      if (currentWeekOffset === -1) return 'Semana Passada'
      if (currentWeekOffset === 1) return 'Próxima Semana'
      
      return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`
    }
    
    if (selectedPeriod === 'month') {
      const range = getDateRangesWithOffset('month', 0, currentMonthOffset)
      const date = new Date(range.from)
      
      if (currentMonthOffset === 0) return 'Este Mês'
      if (currentMonthOffset === -1) return 'Mês Passado'
      if (currentMonthOffset === 1) return 'Próximo Mês'
      
      return `${date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}`
    }
    
    return periodLabels[selectedPeriod]
  }

  if (loading) return <main className="container py-5">Carregando…</main>

  const periodLabels = {
    today: 'Hoje',
    week: 'Semana Atual', 
    month: 'Mês Atual'
  }

  return (
    <main className="container py-4">
      <nav className="navbar navbar-dark bg-dark rounded-3 px-3 mb-4">
        <span className="navbar-brand">Agendador</span>
        <div className="d-flex align-items-center gap-3">
          <a href="/app/events/new" className="btn btn-sm btn-success">
            <i className="fas fa-plus me-1"></i>Novo Evento
          </a>
          <a href="/app/events" className="btn btn-sm btn-outline-info">
            <i className="fas fa-list me-1"></i>Ver Todos os Eventos
          </a>
          <span className="text-secondary small">{user?.email}</span>
          <button className="btn btn-sm btn-outline-light" onClick={() => { clearToken(); router.replace('/login') }}>
            Sair
          </button>
        </div>
      </nav>

      <div className="row g-4">
        <div className="col-12">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Dashboard - {getCurrentPeriodLabel()}</h2>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedPeriod === 'today' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handlePeriodChange('today')}
                >
                  Hoje
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedPeriod === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handlePeriodChange('week')}
                >
                  Esta Semana
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${selectedPeriod === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handlePeriodChange('month')}
                >
                  Este Mês
                </button>
              </div>
            </div>

            {eventsLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted mb-3">
                  <i className="bi bi-calendar-x" style={{ fontSize: '3rem' }}></i>
                </div>
                <h6 className="text-muted">Nenhum evento {periodLabels[selectedPeriod].toLowerCase()}</h6>
                <p className="text-muted small mb-3">Que tal criar seu primeiro evento?</p>
                <a href="/app/events/new" className="btn btn-primary">
                  + Criar Evento
                </a>
              </div>
            ) : selectedPeriod === 'today' ? (
              <div className="vstack gap-2">
                {events.map(event => (
                  <div key={event.id} className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={`badge bg-${getCategoryColor(event.category)} rounded-pill`}>
                              {getCategoryLabel(event.category)}
                            </span>
                          </div>
                          <h6 className="mb-1">{event.title}</h6>
                          <p className="text-muted small mb-1">
                            {formatEventDateTime(event.startsAt, event.endsAt)}
                          </p>
                          {event.description && (
                            <p className="text-muted small mb-0">{event.description}</p>
                          )}
                        </div>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href={`/app/events/${event.id}`}>Ver detalhes</a></li>
                            {canEditEvent(event) && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" href={`/app/events/${event.id}/edit`}>Editar</a></li>
                              </>
                            )}
                            {canDeleteEvent(event) && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                <li><button className="dropdown-item text-danger">Excluir</button></li>
                              </>
                            )}
                            {getUserRoleInEvent(event) !== 'OWNER' && (
                              <>
                                <li><hr className="dropdown-divider" /></li>
                                <li className="dropdown-item-text text-muted small">
                                  {getUserRoleInEvent(event) === 'EDITOR' ? 'Você é Editor' : 'Apenas Visualização'}
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedPeriod === 'week' ? (
              (() => {
                const range = getDateRangesWithOffset('week', currentWeekOffset, 0)
                const weekStart = new Date(range.from)
                const weekDays = getWeekDays(weekStart)
                const eventsByDate = groupEventsByDate(events)
                const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
                
                return (
                  <div className="row g-2">
                    {weekDays.map((day, index) => (
                      <div key={day.toDateString()} className="col">
                        <div className="card h-100" style={{minHeight: '200px'}}>
                          <div className="card-header text-center py-2 bg-primary text-white">
                            <div className="fw-bold">{dayNames[index]}</div>
                            <small>{day.getDate()}/{day.getMonth() + 1}</small>
                          </div>
                          <div className="card-body p-2 overflow-auto">
                            {eventsByDate[day.toDateString()]?.map(event => (
                              <div key={event.id} className="mb-2 p-2 border rounded" style={{fontSize: '0.75rem'}}>
                                <div className={`badge bg-${getCategoryColor(event.category)} rounded-pill mb-1 w-100`} style={{fontSize: '0.6rem'}}>
                                  {getCategoryLabel(event.category)}
                                </div>
                                <div className="fw-bold text-truncate mb-1" title={event.title}>
                                  {event.title}
                                </div>
                                <div className="text-muted small">
                                  {new Date(event.startsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  {' - '}
                                  {new Date(event.endsAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            )) || <small className="text-muted">Sem eventos</small>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()
            ) : (
              (() => {
                const range = getDateRangesWithOffset('month', 0, currentMonthOffset)
                const currentDate = new Date(range.from)
                const monthWeeks = getMonthWeeks(currentDate.getFullYear(), currentDate.getMonth())
                const eventsByDate = groupEventsByDate(events)
                const dayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
                
                return (
                  <div>
                    {/* Cabeçalho com dias da semana */}
                    <div className="row g-1 mb-2">
                      {dayNames.map(day => (
                        <div key={day} className="col text-center">
                          <div className="fw-bold text-primary bg-light p-2 rounded">{day}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Semanas do mês */}
                    {monthWeeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="row g-1 mb-1">
                        {week.map(day => {
                          const today = new Date()
                          const isCurrentMonth = day.getMonth() === currentDate.getMonth() && day.getFullYear() === currentDate.getFullYear()
                          const isToday = day.toDateString() === today.toDateString()
                          const dayEvents = eventsByDate[day.toDateString()] || []
                          
                          return (
                            <div key={day.toDateString()} className="col">
                              <div 
                                className={`card h-100 ${!isCurrentMonth ? 'bg-light' : ''} ${isToday ? 'border-primary' : ''}`} 
                                style={{minHeight: '100px'}}
                              >
                                <div className="card-body p-1 d-flex flex-column">
                                  <div className="text-center mb-1">
                                    <span className={`${!isCurrentMonth ? 'text-muted' : ''} ${isToday ? 'fw-bold text-primary' : ''}`}>
                                      {day.getDate()}
                                    </span>
                                  </div>
                                  <div className="flex-grow-1 overflow-hidden">
                                    {dayEvents.slice(0, 3).map(event => (
                                      <div key={event.id} className="mb-1" style={{fontSize: '0.6rem'}}>
                                        <div 
                                          className={`badge bg-${getCategoryColor(event.category)} w-100 text-truncate p-1`} 
                                          style={{fontSize: '0.55rem'}} 
                                          title={`${event.title} - ${getCategoryLabel(event.category)}`}
                                        >
                                          {event.title}
                                        </div>
                                      </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                      <div style={{fontSize: '0.6rem'}} className="text-muted text-center">
                                        +{dayEvents.length - 3} mais
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )
              })()
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
