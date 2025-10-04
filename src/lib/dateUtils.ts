// Utilitários para manipulação de datas no dashboard
export function getDateRanges() {
  const now = new Date()
  
  // Hoje
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now)
  todayEnd.setHours(23, 59, 59, 999)
  
  // Esta semana (segunda a domingo)
  const weekStart = new Date(now)
  const dayOfWeek = weekStart.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStart.setDate(weekStart.getDate() + daysToMonday)
  weekStart.setHours(0, 0, 0, 0)
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  
  // Este mês
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  monthEnd.setHours(23, 59, 59, 999)
  
  return {
    today: { from: todayStart.toISOString(), to: todayEnd.toISOString() },
    week: { from: weekStart.toISOString(), to: weekEnd.toISOString() },
    month: { from: monthStart.toISOString(), to: monthEnd.toISOString() }
  }
}

export function formatEventDateTime(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const isToday = start.toDateString() === today.toDateString()
  const isTomorrow = start.toDateString() === tomorrow.toDateString()
  const isSameDay = start.toDateString() === end.toDateString()
  
  if (isToday) {
    if (isSameDay) {
      return `Hoje às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return `Hoje às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  if (isTomorrow) {
    if (isSameDay) {
      return `Amanhã às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    }
    return `Amanhã às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  if (isSameDay) {
    return `${start.toLocaleDateString('pt-BR')} às ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  return `${start.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${end.toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`
}

export function getCategoryLabel(category: string) {
  const labels = {
    alert: 'Alerta',
    study: 'Estudo', 
    reminder: 'Lembrete',
    meeting: 'Reunião',
    task: 'Tarefa',
    // Versões em português também
    'alerta': 'Alerta',
    'estudo': 'Estudo',
    'lembrete': 'Lembrete', 
    'reuniao': 'Reunião',
    'tarefa': 'Tarefa'
  }
  return labels[category.toLowerCase() as keyof typeof labels] || category
}

export function getCategoryColor(category: string) {
  const colors = {
    alert: 'danger',
    study: 'primary',
    reminder: 'warning',
    meeting: 'success',
    task: 'info',
    // Versões em português também
    'alerta': 'danger',
    'estudo': 'primary',
    'lembrete': 'warning',
    'reuniao': 'success',
    'tarefa': 'info'
  }
  return colors[category.toLowerCase() as keyof typeof colors] || 'secondary'
}
