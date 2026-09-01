import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface ModalProps {
  children: ReactNode
  className?: string
  footer?: ReactNode
  title: string
  onClose: () => void
}

export function Modal({ children, className = '', footer, title, onClose }: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const body = document.body
    const scrollPosition = window.scrollY
    const previous = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    const backdrop = backdropRef.current
    const stopBackgroundTouch = (event: TouchEvent) => {
      if (event.target === backdrop) event.preventDefault()
    }

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollPosition}px`
    body.style.width = '100%'
    backdrop?.addEventListener('touchmove', stopBackgroundTouch, { passive: false })

    return () => {
      backdrop?.removeEventListener('touchmove', stopBackgroundTouch)
      body.style.overflow = previous.overflow
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      window.scrollTo({ top: scrollPosition, left: 0, behavior: 'auto' })
    }
  }, [])

  return (
    <div ref={backdropRef} className="modal-backdrop" role="presentation" onMouseDown={onClose}>
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
