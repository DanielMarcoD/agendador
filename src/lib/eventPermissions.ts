import { EventDTO, ParticipantRole } from './eventsApi'
import { getCurrentUserId } from './tokenManager'

// Verifica se o usuário atual é o dono do evento
export function isEventOwner(event: EventDTO): boolean {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return false
  
  return event.ownerId === currentUserId
}

// Verifica se o usuário atual tem permissão para editar o evento
export function canEditEvent(event: EventDTO): boolean {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return false
  
  // O dono pode sempre editar
  if (event.ownerId === currentUserId) return true
  
  // Participantes com role EDITOR também podem editar
  const participation = event.EventParticipant?.find(p => p.userId === currentUserId)
  return participation?.role === 'EDITOR'
}

// Verifica se o usuário atual tem permissão para deletar o evento
export function canDeleteEvent(event: EventDTO): boolean {
  // Apenas o dono pode deletar eventos
  return isEventOwner(event)
}

// Verifica se o usuário atual tem permissão para compartilhar o evento
export function canShareEvent(event: EventDTO): boolean {
  // Apenas o dono pode compartilhar eventos
  return isEventOwner(event)
}

// Obtém o papel do usuário atual no evento
export function getUserRoleInEvent(event: EventDTO): 'OWNER' | 'EDITOR' | 'VIEWER' | null {
  const currentUserId = getCurrentUserId()
  if (!currentUserId) return null
  
  // Verificar se é o dono
  if (event.ownerId === currentUserId) return 'OWNER'
  
  // Verificar participação
  const participation = event.EventParticipant?.find(p => p.userId === currentUserId)
  if (participation) {
    return participation.role as 'EDITOR' | 'VIEWER'
  }
  
  return null
}
