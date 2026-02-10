import type { Note } from '../types/note'

/** Returns sample notes with the given user_id injected. */
export function getSampleNotes(userId: string): Omit<Note, 'id'>[] {
  return [
    {
      user_id: userId,
      title: 'Design system notes',
      structured_transcript: `Going with a **retro 8-bit aesthetic** for the UI.

### Key decisions
- **Press Start 2P** as the pixel font for headings
- **Inter** for body text readability
- Color palette: dark base with neon *cyan*, *green*, and *magenta* accents
- Pixel borders with subtle glow effects give that CRT monitor vibe

Need to balance the retro feel with modern usability — keep touch targets large, text readable, and spacing generous.`,
      duration_seconds: 98,
      created_at: '2026-02-09T14:30:00Z',
    },
    {
      user_id: userId,
      title: 'Quick grocery list reminder',
      structured_transcript: `Need to pick up a few things:

- Coffee beans
- Oat milk
- Sourdough bread
- Avocados
- Those fancy chips from the corner store

Oh and **cat food**, almost forgot that one.`,
      duration_seconds: 23,
      created_at: '2026-02-06T08:20:00Z',
    },
    {
      user_id: userId,
      title: 'Debugging session notes',
      structured_transcript: `Found the issue with the audio recording cutting out. The \`MediaRecorder\` was being garbage collected because we were not holding a reference to the stream.

**Fix:** storing the \`MediaStream\` in a ref.

Also discovered that the **Web Speech API** needs a user gesture to start on Safari — added a click handler wrapper.

### TODO
- [ ] Test on Firefox next`,
      duration_seconds: 156,
      created_at: '2026-02-05T20:10:00Z',
    },
    {
      user_id: userId,
      title: 'Book notes: Designing Data-Intensive Apps',
      structured_transcript: `Chapter three covers **storage and retrieval**.

### Key takeaways
1. **B-trees vs LSM-trees** tradeoffs
2. The importance of understanding your *access patterns* before choosing a database
3. How indexing strategies affect write and read performance

Really good section on SSTables and compaction strategies. Need to revisit the section on hash indexes.`,
      duration_seconds: 189,
      created_at: '2026-02-04T13:30:00Z',
    },
  ]
}
