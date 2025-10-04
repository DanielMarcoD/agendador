export function parseVirtualEventId(eventId: string): { isVirtual: boolean; parentId?: string; occurrence?: string } {
  if (eventId.includes('-') && eventId.split('-').length >= 2) {
    const parts = eventId.split('-')
    const occurrence = parts[parts.length - 1]
    
    // Verificar se a última parte é um número (indicando que é um evento virtual)
    if (/^\d+$/.test(occurrence)) {
      const parentId = parts.slice(0, -1).join('-')
      return {
        isVirtual: true,
        parentId,
        occurrence
      }
    }
  }
  
  return { isVirtual: false }
}

export function isEventVirtual(event: { id: string; parentEventId?: string; isVirtual?: boolean }): boolean {
  return event.isVirtual === true || parseVirtualEventId(event.id).isVirtual
}

export function getEventDisplayId(event: { id: string; parentEventId?: string; isVirtual?: boolean }): string {
  if (isEventVirtual(event)) {
    const parsed = parseVirtualEventId(event.id)
    return parsed.parentId || event.id
  }
  return event.id
}
