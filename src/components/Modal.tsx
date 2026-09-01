import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps {
  children: ReactNode
  className?: string
  footer?: ReactNode
  title: string
  onClose: () => void
}

export function Modal({ children, className = '', footer, title, onClose }: ModalProps) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal-sheet ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-button" onClick={onClose} aria-label="Chiudi">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </section>
    </div>
  )
}
