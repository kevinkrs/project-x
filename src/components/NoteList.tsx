import { useState } from 'react'
import type { Note } from '../types/note'
import { NoteCard } from './NoteCard'

const INITIAL_VISIBLE = 4

type NoteListProps = {
  notes: Note[]
  isLoading: boolean
  error: string | null
  onDeleteNote?: (id: string) => void
}

export function NoteList({ notes, isLoading, error, onDeleteNote }: NoteListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (isLoading) {
    return (
      <section className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-none border border-retro-cyan/10 bg-retro-dark"
            style={{ opacity: 1 - i * 0.25 }}
          />
        ))}
      </section>
    )
  }

  if (error) {
    return (
      <section className="pixel-border-magenta rounded-none bg-retro-dark p-4">
        <p className="font-pixel text-[8px] text-retro-red">{'>>'} ERROR</p>
        <p className="mt-2 font-body text-xs text-gray-400">{error}</p>
      </section>
    )
  }

  if (!notes.length) {
    return (
      <section className="rounded-none border border-dashed border-retro-cyan/20 bg-retro-dark p-6 text-center">
        <p className="font-pixel text-[10px] text-retro-cyan/50">
          No notes yet
        </p>
        <p className="mt-2 font-body text-xs text-gray-600">
          Start a new recording above to create your first note.
        </p>
      </section>
    )
  }

  const visibleNotes = showAll ? notes : notes.slice(0, INITIAL_VISIBLE)
  const hasMore = notes.length > INITIAL_VISIBLE

  return (
    <section className="space-y-2">
      {visibleNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          isExpanded={expandedId === note.id}
          onToggle={() =>
            setExpandedId((current) => (current === note.id ? null : note.id))
          }
          onDelete={onDeleteNote}
        />
      ))}

      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="pixel-btn pixel-border-yellow w-full rounded-none bg-retro-dark px-4 py-3 font-pixel text-[8px] text-retro-yellow transition hover:bg-retro-yellow/5 sm:text-[10px]"
        >
          {showAll
            ? `<< show less >>`
            : `>> show ${notes.length - INITIAL_VISIBLE} more notes <<`}
        </button>
      )}
    </section>
  )
}
