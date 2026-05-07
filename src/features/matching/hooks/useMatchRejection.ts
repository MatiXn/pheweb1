// useMatchRejection — Story 5.4: Match als „Nicht passend" markieren (Feedback-Loop)
// Aktualisiert matches.status auf 'abgelehnt' + speichert rejection_reason[]

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseMatchRejectionOptions {
  onSuccess?: (matchId: string) => void
}

interface UseMatchRejectionReturn {
  rejectMatch: (matchId: string, reasons?: string[]) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useMatchRejection(options?: UseMatchRejectionOptions): UseMatchRejectionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function rejectMatch(matchId: string, reasons: string[] = []): Promise<boolean> {
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('matches')
      .update({
        status: 'abgelehnt',
        rejection_reason: reasons.length > 0 ? reasons : null,
      })
      .eq('id', matchId)

    setLoading(false)

    if (updateError) {
      setError('Match konnte nicht abgelehnt werden.')
      return false
    }

    options?.onSuccess?.(matchId)
    return true
  }

  return { rejectMatch, loading, error }
}
