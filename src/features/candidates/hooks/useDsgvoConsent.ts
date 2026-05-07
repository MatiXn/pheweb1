import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

// [Story 3.4] DSGVO-Einwilligung Hook
// Ruft die SECURITY DEFINER RPC candidate_give_consent() auf,
// die atomisch profiles UPDATE + audit_log INSERT ausführt.

export function useDsgvoConsent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const giveConsent = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('candidate_give_consent')

      if (rpcError) {
        setError('Einwilligung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.')
        return false
      }

      // RPC gibt jsonb zurück: { success: true } oder { success: true, already_consented: true } oder { error: '...' }
      // Positive success assertion: prüfen ob data?.success === true, nicht nur ob kein Fehler vorliegt.
      const result = data as { success?: boolean; error?: string } | null
      if (!result?.success) {
        setError('Einwilligung konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.')
        return false
      }

      return true
    } finally {
      setIsLoading(false)
    }
  }

  return { giveConsent, isLoading, error }
}
