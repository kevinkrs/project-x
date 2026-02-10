import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getSampleNotes } from '../data/sampleNotes'
import type { Note } from '../types/note'

type UseNotesResult = {
  notes: Note[]
  isLoading: boolean
  error: string | null
  createNote: (input: { structured_transcript: string; durationSeconds: number; title?: string }) => Promise<void>
}

export function useNotes(userId: string | undefined): UseNotesResult {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNotes([])
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      const { data, error: queryError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (queryError) {
        console.error('Error loading notes', queryError)
        setError('Unable to load notes.')
        setNotes([])
        setIsLoading(false)
        return
      }

      const loaded = (data ?? []) as Note[]

      // Auto-seed: if the user has no notes, insert sample data
      if (loaded.length === 0) {
        const samples = getSampleNotes(userId)
        const { data: seeded, error: seedError } = await supabase
          .from('notes')
          .insert(samples)
          .select('*')

        if (cancelled) return

        if (seedError) {
          console.error('Error seeding sample notes', seedError)
          // Non-fatal — just show empty state
          setNotes([])
        } else {
          // Sort seeded notes newest-first to match the query order
          const seededNotes = (seeded ?? []) as Note[]
          seededNotes.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          setNotes(seededNotes)
        }
      } else {
        setNotes(loaded)
      }

      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [userId])

  const createNote = useCallback(
    async (input: { structured_transcript: string; durationSeconds: number; title?: string }) => {
      if (!userId) {
        return
      }

      const payload: Record<string, unknown> = {
        user_id: userId,
        structured_transcript: input.structured_transcript.trim(),
        duration_seconds: Math.max(0, Math.round(input.durationSeconds)),
      }

      if (input.title) {
        payload.title = input.title
      }

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert(payload)
        .select('*')
        .single()

      if (insertError) {
        console.error('Error creating note', insertError)
        throw insertError
      }

      setNotes((prev) => [data as Note, ...prev])
    },
    [userId],
  )

  return { notes, isLoading, error, createNote }
}
