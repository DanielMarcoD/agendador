import { api } from './api'

export type EventDTO = {
  id: string
  title: string
  description?: string | null
  category: 'alerta'|'estudo'|'lembrete'|'reuniao'|'tarefa'
  startsAt: string
  endsAt: string
}

export async function listEvents(params: { from?: string; to?: string; category?: EventDTO['category'] }) {
  const q = new URLSearchParams()
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.category) q.set('category', params.category)
  return api(`/events?${q.toString()}`)
}

export async function createEvent(input: Omit<EventDTO,'id'>) {
  return api('/events', { method: 'POST', body: JSON.stringify(input) })
}

export async function getEvent(id: string): Promise<EventDTO> {
  return api(`/events/${id}`)
}

export async function updateEvent(id: string, input: Omit<EventDTO,'id'>) {
  return api(`/events/${id}`, { method: 'PUT', body: JSON.stringify(input) })
}

export async function deleteEvent(id: string) {
  return api(`/events/${id}`, { method: 'DELETE' })
}

export async function getCategories() {
  return api('/events/categories')
}
