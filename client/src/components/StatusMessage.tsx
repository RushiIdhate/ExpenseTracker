interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export function StatusMessage({ type, message, onClose }: StatusMessageProps) {
  return (
    <div className={`status-message ${type}`} role="alert">
      <i className={`bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'}`} />
      <span>{message}</span>
      {onClose && (
        <button className="icon-button small" onClick={onClose} aria-label="Close message">
          <i className="bi bi-x" />
        </button>
      )}
    </div>
  );
}
