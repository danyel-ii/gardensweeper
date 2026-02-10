import type { ReactNode } from 'react'
import { useEffect, useId } from 'react'

type ModalProps = {
  open: boolean
  title: string
  children: ReactNode
  actions?: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, actions, onClose }: ModalProps) {
  const titleId = useId()

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
    <div
      className="modalOverlay"
      // Use pointer events instead of mouse events so touch gestures (e.g. two-finger chord)
      // don't immediately synthesize a mouse event that dismisses the modal the moment it opens.
      onPointerDown={onClose}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <h2 className="modalTitle" id={titleId}>
            {title}
          </h2>
          <button className="seedBtn" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
        <div className="modalBody">{children}</div>
        {actions ? <div className="modalActions">{actions}</div> : null}
      </div>
    </div>
  )
}
