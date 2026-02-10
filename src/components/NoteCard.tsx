import { useCallback, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Note } from '../types/note'
import { ConfirmModal } from './ConfirmModal'

type NoteCardProps = {
  note: Note
  isExpanded: boolean
  onToggle: () => void
  onDelete?: (id: string) => void
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00'
  const rounded = Math.round(seconds)
  const mins = Math.floor(rounded / 60)
  const secs = rounded % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function deriveTitle(note: Note) {
  if (note.title && note.title.trim().length > 0) return note.title.trim()
  const trimmed = note.structured_transcript.trim()
  if (!trimmed) {
    return 'Untitled note'
  }
  const max = 60
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed
}

const SWIPE_THRESHOLD = 80

export function NoteCard({ note, isExpanded, onToggle, onDelete }: NoteCardProps) {
  const title = deriveTitle(note)
  const date = formatDate(note.created_at)
  const duration = formatDuration(note.duration_seconds)

  const [showConfirm, setShowConfirm] = useState(false)
  const [translateX, setTranslateX] = useState(0)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)
  const isSwiping = useRef(false)

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!onDelete) return
      e.preventDefault()
      setShowConfirm(true)
    },
    [onDelete],
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchCurrentX.current = e.touches[0].clientX
    isSwiping.current = false
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!onDelete) return
      touchCurrentX.current = e.touches[0].clientX
      const diff = touchStartX.current - touchCurrentX.current
      if (diff > 10) {
        isSwiping.current = true
      }
      if (isSwiping.current) {
        setTranslateX(-Math.max(0, Math.min(diff, 120)))
      }
    },
    [onDelete],
  )

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchCurrentX.current
    if (isSwiping.current && diff > SWIPE_THRESHOLD && onDelete) {
      setShowConfirm(true)
    }
    setTranslateX(0)
    isSwiping.current = false
  }, [onDelete])

  const handleConfirm = useCallback(() => {
    setShowConfirm(false)
    onDelete?.(note.id)
  }, [onDelete, note.id])

  const handleCancel = useCallback(() => {
    setShowConfirm(false)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-none">
      {/* Red delete zone behind the card */}
      <div className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-retro-magenta/20">
        <span className="font-pixel text-[8px] text-retro-magenta">DELETE</span>
      </div>

      <article
        className="group relative rounded-none border border-retro-cyan/20 bg-retro-dark transition hover:border-retro-cyan/50 hover:shadow-pixel"
        style={{
          transform: translateX ? `translateX(${translateX}px)` : undefined,
          transition: translateX ? 'none' : 'transform 0.2s ease-out',
        }}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-3 p-4 text-left"
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[8px] text-retro-green">{'>'}</span>
              <h3 className="font-body text-sm font-semibold text-gray-100">
                {title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500">
              <span className="font-body">{date}</span>
              <span className="font-pixel text-[6px] text-retro-cyan/40">*</span>
              <span className="font-body">{duration}</span>
            </div>
          </div>
          <span className="font-pixel text-[8px] text-retro-cyan/60 transition group-hover:text-retro-cyan">
            {isExpanded ? '[-]' : '[+]'}
          </span>
        </button>

        {isExpanded && (
          <div className="border-t border-retro-cyan/10 px-4 pb-4 pt-3">
            <div className="font-body text-xs leading-relaxed text-gray-300 prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{note.structured_transcript || 'No transcript available for this note.'}</ReactMarkdown>
            </div>
          </div>
        )}
      </article>

      <ConfirmModal
        open={showConfirm}
        title=">> Delete note"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  )
}
