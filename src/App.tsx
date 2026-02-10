import { AuthProvider, useAuth } from './auth/AuthProvider'
import { LoginScreen } from './auth/LoginScreen'
import { Recorder } from './components/Recorder'
import { NoteList } from './components/NoteList'
import { useCallback, useState } from 'react'
import { useNotes } from './hooks/useNotes'
import { processAudioNote } from './services/gemini/client'
import type { Note } from './types/note'
import type { RecorderResult } from './hooks/useRecorder'

function ProfileSection() {
  const { user } = useAuth()
  const email = user?.email ?? ''
  const displayName = email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : ''
  const seedKey = `avatar-seed-${user?.id ?? 'anon'}`
  const [avatarSeed, setAvatarSeed] = useState(() => localStorage.getItem(seedKey) ?? email)
  const avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=1e1e1e`

  function regenerateAvatar() {
    const newSeed = crypto.randomUUID()
    localStorage.setItem(seedKey, newSeed)
    setAvatarSeed(newSeed)
  }

  return (
    <section className="pixel-border relative overflow-hidden rounded-none bg-retro-dark p-5 scanlines">
      <div className="relative z-10 flex items-center gap-5">
        <img
          src={avatarUrl}
          alt={`${displayName}'s avatar`}
          className="pixel-avatar h-12 w-12 cursor-pointer rounded-none bg-retro-black transition hover:opacity-80"
          onClick={regenerateAvatar}
          title="Click to regenerate avatar"
        />
        <div className="flex-1 space-y-2">
          <h1 className="font-pixel text-sm text-retro-cyan sm:text-base">
            {displayName}
          </h1>
          <p className="font-body text-xs text-gray-400">{email}</p>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-retro-green shadow-glow-green" />
            <span className="font-body text-[10px] uppercase tracking-widest text-retro-green">
              Online
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function SummarySection({ notes }: { notes: Note[] }) {
  return (
    <section className="grid grid-cols-3 gap-3">
      <div className="pixel-border rounded-none bg-retro-dark p-4 text-center">
        <p className="font-pixel text-lg text-retro-cyan sm:text-2xl">{notes.length}</p>
        <p className="mt-2 font-body text-[10px] uppercase tracking-wider text-gray-500">
          Notes
        </p>
      </div>
      <div className="pixel-border-green rounded-none bg-retro-dark p-4 text-center">
        <p className="font-pixel text-lg text-retro-green sm:text-2xl">
          {Math.round(
            notes.reduce((sum, n) => sum + n.duration_seconds, 0) / 60,
          )}
        </p>
        <p className="mt-2 font-body text-[10px] uppercase tracking-wider text-gray-500">
          Minutes
        </p>
      </div>
      <div className="pixel-border-magenta rounded-none bg-retro-dark p-4 text-center">
        <p className="font-pixel text-lg text-retro-magenta sm:text-2xl">
          {new Set(notes.map((n) => n.created_at.slice(0, 10))).size}
        </p>
        <p className="mt-2 font-body text-[10px] uppercase tracking-wider text-gray-500">
          Days
        </p>
      </div>
    </section>
  )
}

function AppShell() {
  const { user, isLoading, signOut } = useAuth()
  const { notes, isLoading: isLoadingNotes, error: notesError, createNote } = useNotes(user?.id)

  const handleRecordingFinished = useCallback(
    async (result: RecorderResult) => {
      if (result.audioBlob.size === 0) {
        throw new Error('No audio was recorded.')
      }

      const geminiResponse = await processAudioNote({ audioBlob: result.audioBlob })

      await createNote({
        structured_transcript: geminiResponse.structured_transcript,
        durationSeconds: result.durationSeconds,
        title: geminiResponse.title,
      })
    },
    [createNote],
  )

  return (
    <div className="min-h-screen bg-retro-black font-body text-gray-200">
      {/* Header bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-xs text-retro-cyan sm:text-sm">
            {'>'} project-x
          </span>
          <span className="retro-blink font-pixel text-xs text-retro-cyan">_</span>
        </div>
        <span className="font-body text-[10px] uppercase tracking-widest text-gray-600">
          v0.1.0
        </span>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-10">
        {isLoading ? (
          <div className="pixel-border rounded-none bg-retro-dark p-6 text-center">
            <p className="font-pixel text-[10px] text-retro-cyan retro-blink">
              Loading...
            </p>
          </div>
        ) : !user ? (
          <LoginScreen />
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            {/* Left column: profile, stats, recorder */}
            <div className="space-y-4 lg:sticky lg:top-4 lg:w-80 lg:shrink-0">
              <ProfileSection />
              <SummarySection notes={notes} />
              <Recorder onCreateNote={handleRecordingFinished} />
            </div>

            {/* Right column: notes list */}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className="font-pixel text-[10px] text-retro-yellow sm:text-xs">
                  {'>'} your_notes
                </span>
                <div className="h-px flex-1 bg-retro-yellow/20" />
                <span className="font-body text-[10px] text-gray-600">
                  {notes.length} entries
                </span>
              </div>

              <NoteList notes={notes} isLoading={isLoadingNotes} error={notesError} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-5xl px-4 py-6 text-center">
        <p className="font-pixel text-[8px] text-gray-700">
          {'<<'} built with pixels and caffeine {'>>'}
        </p>
        {user && (
          <button
            type="button"
            onClick={() => void signOut()}
            className="pixel-btn pixel-border-magenta mt-3 rounded-none bg-retro-dark px-3 py-2 font-pixel text-[8px] text-retro-magenta transition hover:bg-retro-magenta/10 sm:text-[10px]"
          >
            Log out
          </button>
        )}
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
