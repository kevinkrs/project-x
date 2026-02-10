import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'recording' | 'processing'

export type RecorderResult = {
  durationSeconds: number
  audioBlob: Blob
}

type UseRecorderOptions = {
  onFinished?: (result: RecorderResult) => void | Promise<void>
}

export function useRecorder(options: UseRecorderOptions = {}) {
  const { onFinished } = options

  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [durationSeconds, setDurationSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const onFinishedRef = useRef(onFinished)
  onFinishedRef.current = onFinished

  const reset = () => {
    setDurationSeconds(0)
    setError(null)
  }

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

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

      chunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const elapsed = startTimeRef.current
          ? (performance.now() - startTimeRef.current) / 1000
          : 0
        startTimeRef.current = null

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []

        setDurationSeconds(elapsed)

        if (onFinishedRef.current) {
          await onFinishedRef.current({ durationSeconds: elapsed, audioBlob })
        }

        setStatus('idle')
        reset()
      }

      mediaRecorder.start(1000)

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
  }, [status])

  useEffect(() => {
    return () => {
      stopTimer()
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        mediaRecorderRef.current = null
      }
    }
  }, [])

  return {
    status,
    durationSeconds,
    error,
    start,
    stop,
  }
}

