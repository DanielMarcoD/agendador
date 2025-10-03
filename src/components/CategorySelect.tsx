import React from 'react'
import { getCategoryLabel, getCategoryColor } from '@/lib/dateUtils'

interface CategorySelectProps {
  value: string
  onChange: (value: string) => void
  className?: string
  loading?: boolean
  error?: string
  required?: boolean
}

const categories = ['alerta', 'estudo', 'lembrete', 'reuniao', 'tarefa']

export default function CategorySelect({ 
  value, 
  onChange, 
  className = '', 
  loading = false, 
  error = '',
  required = false 
}: CategorySelectProps) {
  
  if (loading) {
    return (
      <div className={`form-control d-flex align-items-center ${className}`}>
        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
        Carregando categorias...
      </div>
    )
  }

  return (
    <select 
      className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">Selecione uma categoria</option>
      {categories.map(category => (
        <option key={category} value={category}>
          {getCategoryLabel(category)}
        </option>
      ))}
    </select>
  )
}

export { categories, getCategoryLabel, getCategoryColor }
