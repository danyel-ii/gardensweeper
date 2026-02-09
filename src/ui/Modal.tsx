import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  actions?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, actions, onClose }: ModalProps) {
  const titleId = useRef(`modal_${Math.random().toString(16).slice(2)}`)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId.current}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 className="modalTitle" id={titleId.current}>
            {title}
          </h2>
          <button className="btn btnGhost" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {actions ? <div className="modalActions">{actions}</div> : null}
      </div>
    </div>
  )
}

