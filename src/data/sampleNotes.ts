import type { Note } from '../types/note'

/** Returns sample notes with the given user_id injected. */
export function getSampleNotes(userId: string): Omit<Note, 'id'>[] {
  return [
    {
      user_id: userId,
      title: 'Welcome to Project X!',
      structured_transcript: `This is a sample note for you to get started, describing the design system of the app.
      Going with a **retro 8-bit aesthetic** for the UI.

### Key decisions
- **Press Start 2P** as the pixel font for headings
- **Inter** for body text readability
- Color palette: dark base with neon *cyan*, *green*, and *magenta* accents
- Pixel borders with subtle glow effects give that CRT monitor vibe

Need to balance the retro feel with modern usability — keep touch targets large, text readable, and spacing generous.

Feel free to delete this note!`,
      duration_seconds: 98,
      created_at: '2026-02-09T14:30:00Z',
    },
  ]
}
