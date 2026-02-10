import { supabase } from '../../lib/supabaseClient'
import systemPrompt from '../../assets/note-prompt.md?raw'
import type { GeminiNoteRequest, GeminiNoteResponse } from './types'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      // Strip the data URL prefix (e.g. "data:audio/webm;base64,")
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function processAudioNote(
  request: GeminiNoteRequest,
): Promise<GeminiNoteResponse> {
  const audio_base64 = await blobToBase64(request.audioBlob)
  const mime_type = request.audioBlob.type || 'audio/webm'

  const { data, error } = await supabase.functions.invoke('process-note', {
    body: {
      audio_base64,
      mime_type,
      system_prompt: systemPrompt,
      structure: request.structure,
    },
  })

  if (error) {
    throw new Error(`Gemini processing failed: ${error.message}`)
  }

  const response = data as GeminiNoteResponse
  if (!response.title || !response.structured_transcript) {
    throw new Error('Invalid response from Gemini: missing title or structured_transcript')
  }

  return response
}
