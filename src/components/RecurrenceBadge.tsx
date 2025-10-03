'use client'

import { RecurrenceType } from '@/lib/eventsApi'

interface RecurrenceBadgeProps {
  recurrence: RecurrenceType
  isParent?: boolean
  seriesCount?: number
  className?: string
}

export default function RecurrenceBadge({ 
  recurrence, 
  isParent = false, 
  seriesCount, 
  className = '' 
}: RecurrenceBadgeProps) {
  if (recurrence === 'NONE') return null

  const getRecurrenceInfo = () => {
    switch (recurrence) {
      case 'DAILY':
        return { icon: '📅', label: 'Diário', color: 'bg-primary' }
      case 'WEEKLY':
        return { icon: '📆', label: 'Semanal', color: 'bg-success' }
      case 'MONTHLY':
        return { icon: '🗓️', label: 'Mensal', color: 'bg-info' }
      default:
        return { icon: '🔄', label: 'Recorrente', color: 'bg-secondary' }
    }
  }

  const info = getRecurrenceInfo()

  return (
    <span className={`badge ${info.color} ${className}`}>
      <span className="me-1">{info.icon}</span>
      {info.label}
      {isParent && seriesCount && (
        <span className="ms-1">({seriesCount})</span>
      )}
    </span>
  )
}
