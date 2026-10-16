import type { ReactNode } from 'react'

interface DialogFrameProps {
  label: string
  onClose: () => void
  children: ReactNode
}

export default function DialogFrame({ label, onClose, children }: DialogFrameProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        role="dialog"
        aria-label={label}
        className="w-[min(92vw,420px)] rounded-md border border-white/20 bg-neutral-900 text-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
