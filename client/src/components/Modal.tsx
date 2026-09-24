import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop-custom" onMouseDown={onClose}>
      <div className="custom-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="custom-modal-header">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="custom-modal-body">{children}</div>
        {footer && <div className="custom-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
