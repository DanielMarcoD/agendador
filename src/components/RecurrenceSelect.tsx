'use client'

import { RecurrenceType } from '@/lib/eventsApi'

interface RecurrenceSelectProps {
  value: RecurrenceType
  onChange: (value: RecurrenceType) => void
  error?: string
  required?: boolean
}

const RECURRENCE_OPTIONS = [
  { value: 'NONE' as RecurrenceType, label: 'Sem repetição' },
  { value: 'DAILY' as RecurrenceType, label: 'Diário' },
  { value: 'WEEKLY' as RecurrenceType, label: 'Semanal' },
  { value: 'MONTHLY' as RecurrenceType, label: 'Mensal' }
]

export default function RecurrenceSelect({ 
  value, 
  onChange, 
  error, 
  required = false 
}: RecurrenceSelectProps) {
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as RecurrenceType)}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        required={required}
      >
        <option value="">Selecione a repetição</option>
        {RECURRENCE_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="invalid-feedback">{error}</div>
      )}
    </div>
  )
}
