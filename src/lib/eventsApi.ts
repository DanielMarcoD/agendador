import { api } from './api'

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
export type ParticipantRole = 'VIEWER' | 'EDITOR'

export type User = {
  id: string
  name: string
  email: string
}

export type EventParticipant = {
  userId: string
  role: ParticipantRole
  createdAt: string
  User: User
}

export type EventDTO = {
  id: string
  title: string
  description?: string | null
  category: 'alerta'|'estudo'|'lembrete'|'reuniao'|'tarefa'
  startsAt: string
  endsAt: string
  recurrence: RecurrenceType
  ownerId: string
  owner?: User
  EventParticipant?: EventParticipant[]
  parentEventId?: string
  isVirtual?: boolean // Para eventos gerados dinamicamente
}

export type CreateEventInput = {
  title: string
  description?: string
  category: EventDTO['category']
  startsAt: string
  endsAt: string
  recurrence?: RecurrenceType
  participants?: Array<{
    userId: string
    role?: ParticipantRole
  }>
}

export async function listEvents(params: { from?: string; to?: string; category?: EventDTO['category'] }) {
  const q = new URLSearchParams()
  if (params.from) q.set('from', params.from)
  if (params.to) q.set('to', params.to)
  if (params.category) q.set('category', params.category)
  return api(`/events?${q.toString()}`)
}

export async function createEvent(input: CreateEventInput) {
  return api('/events', { method: 'POST', body: JSON.stringify(input) })
}

export async function getEvent(id: string): Promise<EventDTO> {
  return api(`/events/${id}`)
}

export async function updateEvent(id: string, input: Partial<CreateEventInput>, updateSeries?: boolean) {
  const url = updateSeries ? `/events/${id}?updateSeries=true` : `/events/${id}`
  return api(url, { method: 'PATCH', body: JSON.stringify(input) })
}

export async function deleteEvent(id: string, deleteSeries?: boolean) {
  const url = deleteSeries ? `/events/${id}?deleteSeries=true` : `/events/${id}`
  return api(url, { method: 'DELETE' })
}

export async function getCategories() {
  return api('/events/categories')
}

// Funções para compartilhamento de eventos
export async function shareEvent(eventId: string, userIds: string[], role: ParticipantRole = 'VIEWER') {
  return api(`/events/${eventId}/share`, {
    method: 'POST',
    body: JSON.stringify({ userIds, role })
  })
}

export async function removeParticipant(eventId: string, userId: string) {
  return api(`/events/${eventId}/participants/${userId}`, { method: 'DELETE' })
}

export async function updateParticipantRole(eventId: string, userId: string, role: ParticipantRole) {
  return api(`/events/${eventId}/participants/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  })
}

export async function searchUsers(search: string): Promise<{ users: User[] }> {
  const q = new URLSearchParams({ search })
  return api(`/users/search?${q.toString()}`)
}

export async function getEventSeries(eventId: string) {
  return api(`/events/${eventId}/series`)
}

export async function getEventRecurrenceInfo(eventId: string) {
  return api(`/events/${eventId}/recurrence-info`)
}

export async function getVirtualEvent(parentId: string, occurrence: string): Promise<EventDTO> {
  return api(`/events/virtual/${parentId}/${occurrence}`)
}
