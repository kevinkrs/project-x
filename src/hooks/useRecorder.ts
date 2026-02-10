import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'processing'

export type RecorderResult = {
  transcript: string
  durationSeconds: number
}

type UseRecorderOptions = {
  onFinished?: (result: RecorderResult) => void | Promise<void>
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const { onFinished } = options

  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [transcript, setTranscript] = useState('')
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)

  const reset = () => {
    setTranscript('')
    setDurationSeconds(0)
    setError(null)
  }

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (startTimeRef.current !== null) {
      const now = performance.now()
      const elapsedMs = now - startTimeRef.current
      setDurationSeconds(elapsedMs / 1000)
      startTimeRef.current = null
    }
  }

  const finish = useCallback(
    async (overrideTranscript?: string) => {
      stopTimer()
      const finalTranscript = (overrideTranscript ?? transcript).trim()
      const finalDuration = durationSeconds

      setStatus('idle')

      if (onFinished) {
        await onFinished({
          transcript: finalTranscript,
          durationSeconds: finalDuration,
        })
      }

      reset()
    },
    [durationSeconds, onFinished, transcript],
  )

  const start = useCallback(async () => {
    if (status === 'recording') return

    reset()

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.lang = navigator.language || 'en-US'
        recognition.interimResults = true
        recognition.continuous = true

        recognition.onresult = (event: any) => {
          let combined = ''
          for (let i = 0; i < event.results.length; i += 1) {
            combined += event.results[i][0].transcript
          }
          setTranscript(combined)
        }

        recognition.onerror = () => {
          // Swallow errors; we still keep the duration-only note.
        }

        recognitionRef.current = recognition
        recognition.start()
      }

      mediaRecorder.start()

      startTimeRef.current = performance.now()
      timerRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          const now = performance.now()
          setDurationSeconds((now - startTimeRef.current) / 1000)
        }
      }, 250)

      setStatus('recording')
      setError(null)
    } catch (err) {
      console.error('Error starting recorder', err)
      setError('Could not access microphone.')
    }
  }, [status])

  const stop = useCallback(() => {
    if (status !== 'recording') return

    setStatus('processing')
    stopTimer()

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      mediaRecorderRef.current = null
    }

    const recognition = recognitionRef.current
    if (recognition) {
      recognition.onend = () => {
        void finish()
      }
      recognition.stop()
      recognitionRef.current = null
    } else {
      // No speech recognition support – just finish with whatever we have.
      void finish()
    }
  }, [finish, status])

  useEffect(() => {
    return () => {
      stopTimer()
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        mediaRecorderRef.current = null
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }
    }
  }, [])

  return {
    status,
    transcript,
    durationSeconds,
    error,
    start,
    stop,
  }
}

