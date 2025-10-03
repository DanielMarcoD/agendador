'use client'

import { useState } from 'react'

interface DeleteEventModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (deleteSeries: boolean) => Promise<void>
  eventTitle: string
  isRecurring: boolean
  seriesCount?: number
  isLoading?: boolean
}

export default function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  isRecurring,
  seriesCount = 0,
  isLoading = false
}: DeleteEventModalProps) {
  const [deleteSeries, setDeleteSeries] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    await onConfirm(deleteSeries)
    onClose()
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Confirmar exclusão</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={isLoading}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Tem certeza que deseja excluir o evento <strong>"{eventTitle}"</strong>?</p>
            
            {isRecurring && (
              <div className="mt-3">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  Este evento faz parte de uma série recorrente com {seriesCount} eventos.
                </div>
                
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deleteOption"
                    id="deleteOne"
                    checked={!deleteSeries}
                    onChange={() => setDeleteSeries(false)}
                  />
                  <label className="form-check-label" htmlFor="deleteOne">
                    Excluir apenas este evento
                  </label>
                </div>
                
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deleteOption"
                    id="deleteSeries"
                    checked={deleteSeries}
                    onChange={() => setDeleteSeries(true)}
                  />
                  <label className="form-check-label" htmlFor="deleteSeries">
                    <span className="text-danger">
                      Excluir toda a série recorrente ({seriesCount} eventos)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className={`btn ${deleteSeries ? 'btn-danger' : 'btn-warning'}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Excluindo...
                </>
              ) : (
                deleteSeries ? 'Excluir Série' : 'Excluir Evento'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
