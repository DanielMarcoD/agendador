'use client'

import { useState, useCallback } from 'react'
import { User, ParticipantRole, searchUsers } from '@/lib/eventsApi'

interface UserSelectProps {
  selectedUsers: Array<{ user: User; role: ParticipantRole }>
  onUserAdd: (user: User, role: ParticipantRole) => void
  onUserRemove: (userId: string) => void
  onRoleChange: (userId: string, role: ParticipantRole) => void
}

export default function UserSelect({
  selectedUsers,
  onUserAdd,
  onUserRemove,
  onRoleChange
}: UserSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = useCallback(async (term: string) => {
    if (term.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const { users } = await searchUsers(term)
      // Filtrar usuários já selecionados
      const selectedIds = selectedUsers.map(u => u.user.id)
      const filteredUsers = users.filter(u => !selectedIds.includes(u.id))
      setSearchResults(filteredUsers)
      setShowResults(true)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [selectedUsers])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    handleSearch(term)
  }

  const handleUserSelect = (user: User) => {
    onUserAdd(user, 'VIEWER')
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
  }

  return (
    <div>
      <label className="form-label">Compartilhar com usuários</label>
      
      {/* Campo de busca */}
      <div className="position-relative">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar usuários por nome ou email..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
        />
        
        {/* Resultados da busca */}
        {showResults && searchResults.length > 0 && (
          <div className="dropdown-menu show position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
            {searchResults.map(user => (
              <button
                key={user.id}
                type="button"
                className="dropdown-item"
                onClick={() => handleUserSelect(user)}
              >
                <div>
                  <div className="fw-medium">{user.name}</div>
                  <small className="text-muted">{user.email}</small>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {isSearching && (
          <div className="position-absolute top-50 end-0 translate-middle-y me-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Buscando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Usuários selecionados */}
      {selectedUsers.length > 0 && (
        <div className="mt-3">
          <small className="text-muted">Usuários que terão acesso ao evento:</small>
          <div className="mt-2">
            {selectedUsers.map(({ user, role }) => (
              <div key={user.id} className="d-flex align-items-center gap-2 mb-2 p-2 border rounded">
                <div className="flex-grow-1">
                  <div className="fw-medium">{user.name}</div>
                  <small className="text-muted">{user.email}</small>
                </div>
                
                <select
                  value={role}
                  onChange={(e) => onRoleChange(user.id, e.target.value as ParticipantRole)}
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                >
                  <option value="VIEWER">Visualizar</option>
                  <option value="EDITOR">Editar</option>
                </select>
                
                <button
                  type="button"
                  onClick={() => onUserRemove(user.id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
