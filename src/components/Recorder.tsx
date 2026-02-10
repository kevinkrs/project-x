import { useState } from 'react'
import { useRecorder, type RecorderResult } from '../hooks/useRecorder'

type RecorderProps = {
  onCreateNote: (result: RecorderResult) => Promise<void> | void
}

export function Recorder({ onCreateNote }: RecorderProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { status, durationSeconds, error, start, stop } = useRecorder({
    onFinished: async (result) => {
      try {
        setIsSubmitting(true)
        setSubmitError(null)
        await onCreateNote(result)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong while saving the note.'
        setSubmitError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
  })

  const isRecording = status === 'recording'
  const isProcessing = status === 'processing' || isSubmitting

  const formattedDuration =
    durationSeconds > 0
      ? new Date(durationSeconds * 1000).toISOString().substring(14, 19)
      : '00:00'

  return (
    <section className={`relative rounded-none bg-retro-dark p-4 ${isRecording ? 'pixel-border-magenta recording-pulse' : 'pixel-border-green'}`}>
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="font-pixel text-[10px] text-retro-green sm:text-xs">
            {'>'} new_recording
          </h2>
          <p className="font-body text-[10px] text-gray-500">
            Capture a quick voice note from your browser.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-3 w-3 items-center justify-center ${
              isRecording
                ? 'bg-retro-red shadow-[0_0_12px_rgba(255,7,58,0.9)]'
                : 'bg-gray-700'
            }`}
          />
          <div className="flex flex-col">
            <span className="font-body text-xs font-medium text-gray-300">
              {isRecording
                ? 'Recording...'
                : isProcessing
                  ? 'Processing note...'
                  : 'Ready'}
            </span>
            <span className="font-pixel text-[8px] text-gray-600">
              {formattedDuration}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              type="button"
              onClick={() => stop()}
              className="pixel-btn rounded-none border-2 border-retro-red bg-retro-red/10 px-4 py-2 font-pixel text-[8px] text-retro-red shadow-[4px_4px_0px_0px_rgba(255,7,58,0.3)] transition hover:bg-retro-red/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px]"
              disabled={isProcessing}
            >
              [STOP]
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void start()}
              className="pixel-btn rounded-none border-2 border-retro-green bg-retro-green/10 px-4 py-2 font-pixel text-[8px] text-retro-green shadow-[4px_4px_0px_0px_rgba(57,255,20,0.3)] transition hover:bg-retro-green/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[10px]"
              disabled={isProcessing}
            >
              [REC]
            </button>
          )}
        </div>
      </div>

      {(error || submitError || isRecording) && (
        <div className="mt-3 rounded-none border border-retro-cyan/10 bg-retro-black/60 p-3">
          {error && (
            <p className="font-pixel text-[8px] text-retro-red">{'>>'} {error}</p>
          )}
          {submitError && (
            <p className="font-pixel text-[8px] text-retro-red">{'>>'} {submitError}</p>
          )}
          {!error && isRecording && (
            <p className="font-body text-[10px] text-gray-600">
              Listening for your note<span className="retro-blink">_</span>
            </p>
          )}
        </div>
      )}
    </section>
  )
}
