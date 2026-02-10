import type { Note } from '../types/note'

export const SAMPLE_USER = {
  name: 'Kevin',
  email: 'kevin@project-x.dev',
  avatarUrl: 'https://api.dicebear.com/9.x/pixel-art/svg?seed=Kevin&backgroundColor=0a0a0a',
}

/** Returns sample notes with the given user_id injected. */
export function getSampleNotes(userId: string): Omit<Note, 'id'>[] {
  return [
    {
      user_id: userId,
      title: 'App architecture brainstorm',
      transcript:
        'Overall architecture of voice-based note-taking app in retro style: -',

      duration_seconds: 145,
      created_at: '2026-02-10T09:15:00Z',
    },
    {
      user_id: userId,
      title: 'Design system notes',
      transcript:
        'Going with a retro 8-bit aesthetic for the UI. Key decisions: Press Start 2P as the pixel font for headings, Inter for body text readability. Color palette is dark base with neon cyan, green, and magenta accents. Pixel borders with subtle glow effects give that CRT monitor vibe. Need to balance the retro feel with modern usability — keep touch targets large, text readable, and spacing generous.',
      duration_seconds: 98,
      created_at: '2026-02-09T14:30:00Z',
    },
    {
      user_id: userId,
      title: 'Sprint planning recap',
      transcript:
        'Sprint goals for this week: finish the recording feature with live transcription, implement the note list with expandable cards, and set up the Supabase database schema. Stretch goals include adding search functionality and a tag system for organizing notes. Team agreed on two-week sprints with daily standups.',
      duration_seconds: 67,
      created_at: '2026-02-08T11:00:00Z',
    },
    {
      user_id: userId,
      title: 'Meeting with the team',
      transcript:
        'Discussed the roadmap for Q1. Priority features are: voice recording with transcription, note organization with folders and tags, sharing notes with teammates, and offline support. We also talked about potential integrations with Slack and Notion. The team is excited about the retro theme — everyone thinks it will help us stand out in the market.',
      duration_seconds: 212,
      created_at: '2026-02-07T16:45:00Z',
    },
    {
      user_id: userId,
      title: 'Quick grocery list reminder',
      transcript:
        'Need to pick up a few things: coffee beans, oat milk, sourdough bread, avocados, and those fancy chips from the corner store. Oh and cat food, almost forgot that one.',
      duration_seconds: 23,
      created_at: '2026-02-06T08:20:00Z',
    },
    {
      user_id: userId,
      title: 'Debugging session notes',
      transcript:
        'Found the issue with the audio recording cutting out. The MediaRecorder was being garbage collected because we were not holding a reference to the stream. Fixed by storing the MediaStream in a ref. Also discovered that the Web Speech API needs a user gesture to start on Safari — added a click handler wrapper. Need to test on Firefox next.',
      duration_seconds: 156,
      created_at: '2026-02-05T20:10:00Z',
    },
    {
      user_id: userId,
      title: 'Book notes: Designing Data-Intensive Apps',
      transcript:
        'Chapter three covers storage and retrieval. Key takeaways: B-trees vs LSM-trees tradeoffs, the importance of understanding your access patterns before choosing a database, and how indexing strategies affect write and read performance. Really good section on SSTables and compaction strategies. Need to revisit the section on hash indexes.',
      duration_seconds: 189,
      created_at: '2026-02-04T13:30:00Z',
    },
  ]
}
