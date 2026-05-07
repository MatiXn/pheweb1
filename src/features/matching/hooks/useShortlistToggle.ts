// useShortlistToggle — Story 6.5: Vormerken-Toggle mit optimistischem Update
// Ruft toggle_match_shortlist() SECURITY DEFINER via RPC auf
// Optimistisches Update: lokaler State wechselt sofort, wird bei Fehler zurückgesetzt

import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseShortlistToggleReturn {
  isShortlisted: boolean
  toggle: () => Promise<void>
  isToggling: boolean
  error: string | null
}

export function useShortlistToggle(
  matchId: string,
  initialIsShortlisted: boolean
): UseShortlistToggleReturn {
  const [isShortlisted, setIsShortlisted] = useState(initialIsShortlisted)
  const [isToggling, setIsToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  // Note: mountedRef.current wird in der Komponente via useEffect gesetzt wenn nötig
  // Hier reicht der initiale Wert true, da der Hook mit der Komponente lebt

  async function toggle(): Promise<void> {
    if (isToggling) return
    if (!mountedRef.current) return

    const previousState = isShortlisted

    // Optimistisches Update
    setIsShortlisted(!isShortlisted)
    setIsToggling(true)
    setError(null)

    const { data, error: rpcError } = await supabase.rpc('toggle_match_shortlist', {
      p_match_id: matchId,
    })

    if (!mountedRef.current) return

    if (rpcError) {
      // Revert bei Fehler
      setIsShortlisted(previousState)
      setError('Vormerken konnte nicht gespeichert werden.')
      setIsToggling(false)
      return
    }

    // Server-Rückgabe als Wahrheit setzen (boolean: true = shortlisted, false = removed)
    setIsShortlisted(data as boolean)
    setIsToggling(false)
  }

  return { isShortlisted, toggle, isToggling, error }
}
