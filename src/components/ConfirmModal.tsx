import { useEffect } from 'react'

type ConfirmModalProps = {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onCancel}
    >
      <div
        className="pixel-border-magenta mx-4 max-w-sm rounded-none bg-retro-dark p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-pixel text-xs text-retro-magenta">{title}</h2>
        <p className="mt-3 font-body text-xs text-gray-300">{message}</p>
        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="pixel-btn pixel-border rounded-none bg-retro-dark px-4 py-2 font-pixel text-[8px] text-retro-cyan transition hover:bg-retro-cyan/10 sm:text-[10px]"
          >
            [CANCEL]
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="pixel-btn pixel-border-magenta rounded-none bg-retro-magenta/10 px-4 py-2 font-pixel text-[8px] text-retro-magenta transition hover:bg-retro-magenta/20 sm:text-[10px]"
          >
            [DELETE]
          </button>
        </div>
      </div>
    </div>
  )
}
