export type OutputStructure = Record<string, unknown>

export type GeminiNoteRequest = {
  audioBlob: Blob
  structure?: OutputStructure
}

export type GeminiNoteResponse = {
  title: string
  structured_transcript: string
}
