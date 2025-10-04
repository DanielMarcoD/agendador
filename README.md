# Agendador Frontend

Interface moderna para o sistema de agendamento, construída com Next.js, React e TypeScript.

## Início Rápido

### Pré-requisitos
- Node.js >= 20.0.0
- [Agendador API](../agendador-api) rodando em `http://localhost:3333`

### Instalação e Execução

```bash
# Clone o repositório (se não fez ainda)
git clone <repo-url>
cd agendador

# Instale dependências
npm install

# Configure variáveis de ambiente (opcional)
cp .env.local.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

**Aplicação estará disponível em:** `http://localhost:3000`

### Comandos Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build para produção (Turbopack)
npm run start        # Servidor de produção
npm run lint         # ESLint
```

## Funcionalidades

### Autenticação
- **Login/Registro** com validação de formulário
- **Tokens JWT** com renovação automática
- **Redirecionamento** automático baseado no estado de auth

### Gestão de Eventos
- **Criar eventos** únicos ou recorrentes
- **Editar eventos** com formulário intuitivo
- **Deletar eventos** com confirmações apropriadas
- **Visualizar calendário** com eventos organizados

### Eventos Recorrentes
- **Suporte completo** a eventos diários, semanais e mensais
- **Eventos virtuais** gerados dinamicamente
- **Gestão de séries** com opções de edição/exclusão
- **Exclusão individual** de ocorrências específicas
- **Rastreamento de exclusões** via tabela `DeletedEventOccurrence`

### Interface Moderna
- **Design responsivo** com Bootstrap 5
- **Componentes reutilizáveis** para melhor manutenibilidade
- **Feedback visual** com toasts e modals
- **Formulários validados** com React Hook Form + Zod

## Arquitetura

### Estrutura de Diretórios
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout raiz
│   ├── page.tsx            # Página inicial
│   ├── login/              # Página de login
│   ├── register/           # Página de registro
│   └── app/                # Aplicação principal (autenticada)
│       ├── page.tsx        # Dashboard de eventos
│       └── events/         # Páginas relacionadas a eventos
├── components/             # Componentes reutilizáveis
│   ├── CategorySelect.tsx  # Seletor de categorias
│   ├── DateTimePicker.tsx  # Seletor de data/hora
│   ├── DeleteEventModal.tsx # Modal de confirmação
│   ├── RecurrenceBadge.tsx # Badge de recorrência
│   ├── RecurrenceSelect.tsx # Seletor de recorrência
│   ├── ToastProvider.tsx   # Provider de notificações
│   ├── TokenManager.tsx    # Gerenciamento de tokens
│   └── UserSelect.tsx      # Seletor de usuários
├── lib/                    # Utilitários e configurações
│   ├── api.ts              # Cliente API base
│   ├── crypto.ts           # Funções de criptografia
│   ├── dateUtils.ts        # Utilitários de data
│   ├── errors.ts           # Tratamento de erros
│   ├── eventsApi.ts        # API específica de eventos
│   ├── token.ts            # Gerenciamento de tokens
│   └── tokenManager.ts     # Manager de renovação
└── styles/                 # Estilos customizados
    ├── datepicker.css      # Estilos do datepicker
    └── theme.scss          # Tema Bootstrap customizado
```

### Tecnologias Utilizadas
- **Framework**: Next.js 15 com App Router
- **UI**: React 19 + Bootstrap 5
- **Formulários**: React Hook Form + Zod
- **Estilização**: SASS + Tailwind CSS
- **Datas**: date-fns + react-datepicker
- **Linguagem**: TypeScript
- **Build**: Turbopack (Next.js)

## Sistema de Autenticação

### Fluxo de Autenticação
1. **Login/Registro** → Obter tokens JWT
2. **Token Storage** → Armazenamento seguro no localStorage
3. **Auto-refresh** → Renovação automática antes da expiração
4. **Route Protection** → Redirecionamento baseado em auth

### Gerenciamento de Tokens
```typescript
// Tokens são gerenciados automaticamente
const tokenManager = useTokenManager()

// Verificar se está logado
if (tokenManager.isAuthenticated) {
  // Usuário está logado
}

// Fazer requisições (token incluído automaticamente)
const response = await eventsApi.getEvents()
```

## Interface de Eventos

### Formulário de Criação
- **Validação em tempo real** com feedback visual
- **Seletor de recorrência** intuitivo
- **Picker de data/hora** responsivo
- **Categorias predefinidas** com cores

### Lista de Eventos
```typescript
// Eventos são carregados automaticamente
const events = await eventsApi.getEvents({
  from: startDate,
  to: endDate,
  category: selectedCategory
})

// Eventos recorrentes aparecem como série
// Cada ocorrência é tratada como evento virtual
// Ocorrências excluídas são automaticamente filtradas
```

### Edição de Eventos
- **Formulário pré-preenchido** com dados atuais
- **Opções de edição** para eventos recorrentes:
  - Editar apenas esta ocorrência
  - Editar toda a série
- **Validação de conflitos** de horário

### Exclusão de Eventos
- **Modal de confirmação** com opções flexíveis
- **Exclusão de eventos únicos** com confirmação simples
- **Exclusão de eventos recorrentes** com opções:
  - Excluir apenas esta ocorrência
  - Excluir toda a série
- **Eventos virtuais** podem ser excluídos individualmente
- **Sistema de rastreamento** impede exibição de ocorrências excluídas

## Componentes Principais

### CategorySelect
```tsx
### DeleteEventModal
```tsx
<DeleteEventModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDeleteEvent}
  eventTitle={selectedEvent?.title}
  hasRecurrence={selectedEvent?.recurrence !== 'NONE'}
  isVirtual={selectedEvent?.isVirtual}
/>
```

### CategorySelect
```tsx
<CategorySelect
  value={selectedCategory}
  onChange={setSelectedCategory}
  required
/>
```
```

### DateTimePicker
```tsx
<DateTimePicker
  selected={startDate}
  onChange={setStartDate}
  showTimeSelect
  dateFormat="dd/MM/yyyy HH:mm"
/>
```

### RecurrenceSelect
```tsx
<RecurrenceSelect
  value={recurrence}
  onChange={setRecurrence}
/>
```

## Configuração

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME="Agendador"
```

### Configuração da API
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

export const apiClient = {
  baseURL: API_BASE_URL,
  // Interceptors para tokens automáticos
}
```

## Customização de Estilos

### Bootstrap Customizado
```scss
// styles/theme.scss
$primary: #007bff;
$success: #28a745;
$info: #17a2b8;
$warning: #ffc107;
$danger: #dc3545;

// Importar Bootstrap com customizações
@import "bootstrap/scss/bootstrap";
```

### CSS Modules
```css
/* styles/datepicker.css */
.react-datepicker-wrapper {
  width: 100%;
}

.react-datepicker__input-container input {
  width: 100%;
  padding: 0.375rem 0.75rem;
}
```

## Tratamento de Erros

### Sistema de Notificações
```typescript
// Toasts automáticos para feedback
import { toast } from 'react-hot-toast'

// Sucesso
toast.success('Evento criado com sucesso!')

// Erro
toast.error('Erro ao criar evento')

// Loading
const loadingToast = toast.loading('Salvando...')
toast.dismiss(loadingToast)
```

### Tratamento Global
```typescript
// lib/errors.ts
export function handleApiError(error: any) {
  if (error.status === 401) {
    // Token inválido - redirecionar para login
    tokenManager.logout()
    router.push('/login')
  }
  
  // Mostrar erro ao usuário
  toast.error(error.message || 'Erro inesperado')
}
```

## Responsividade

### Breakpoints Bootstrap
- **xs**: < 576px (mobile)
- **sm**: ≥ 576px (mobile landscape)
- **md**: ≥ 768px (tablet)
- **lg**: ≥ 992px (desktop)
- **xl**: ≥ 1200px (desktop large)

### Componentes Adaptativos
```tsx
// Exemplo: Modal responsivo
<div className="modal-dialog modal-lg modal-dialog-centered">
  <div className="modal-content">
    {/* Conteúdo adaptativo */}
  </div>
</div>
```

## Desenvolvimento

### Modo de Desenvolvimento
```bash
# Com Turbopack (mais rápido)
npm run dev

# Modo tradicional
npm run dev -- --no-turbo
```

### Build e Deploy
```bash
# Build de produção
npm run build

# Testar build local
npm run start

# Deploy (exemplo Vercel)
vercel deploy
```

## Integração com Backend

### Configuração Base
```typescript
// lib/eventsApi.ts
export const eventsApi = {
  async getEvents(params?: EventsQuery) {
    const token = tokenManager.getAccessToken()
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch events')
    }
    
    return response.json()
  }
  
  // Outros métodos...
}
```

### Tipos TypeScript
```typescript
// Tipos compartilhados com o backend
export interface Event {
  id: string
  title: string
  description?: string
  category: 'alerta' | 'estudo' | 'lembrete' | 'reuniao' | 'tarefa'
  startsAt: string
  endsAt: string
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  ownerId: string
  isVirtual?: boolean
  parentEventId?: string
}

export interface DeletedEventOccurrence {
  id: string
  parentEventId: string
  occurrenceDate: string
  createdAt: string
}
```
