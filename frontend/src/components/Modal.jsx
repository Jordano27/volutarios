export function Modal({ eyebrow, title, onClose, children, className = '' }) {
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleBackdropClick}>
      <section className={`app-modal ${className}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar modal">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function ConfirmationModal({ title, message, onConfirm, onCancel, loading = false }) {
  return (
    <Modal eyebrow="CONFIRMAÇÃO" title={title} onClose={onCancel} className="confirmation-modal">
      <p className="confirmation-message">{message}</p>
      <div className="modal-actions">
        <button type="button" className="button button-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className="button button-primary" onClick={onConfirm} disabled={loading}>
          {loading ? 'Confirmando...' : 'Confirmar'}
        </button>
      </div>
    </Modal>
  );
}
