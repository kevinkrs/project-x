export type Note = {
  id: string
  user_id: string
  structured_transcript: string
  duration_seconds: number
  created_at: string
  title?: string | null
}

