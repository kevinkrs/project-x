import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { TokenUsage } from '../types/tokenUsage'

type UseTokenUsageResult = {
  totalInputTokens: number
  totalOutputTokens: number
  isLoading: boolean
}

export function useTokenUsage(userId: string | undefined): UseTokenUsageResult {
  const [rows, setRows] = useState<TokenUsage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      setRows([])
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId)

      if (cancelled) return

      if (error) {
        console.error('Error loading token usage', error)
      } else {
        setRows((data ?? []) as TokenUsage[])
      }

      setIsLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [userId])

  const totalInputTokens = rows.reduce((sum, r) => sum + r.input_tokens, 0)
  const totalOutputTokens = rows.reduce((sum, r) => sum + r.output_tokens, 0)

  return { totalInputTokens, totalOutputTokens, isLoading }
}
