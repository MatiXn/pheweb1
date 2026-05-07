// useRecruiterBlockAction — Story 6.4: Kandidat blockiert Unternehmen dauerhaft
// Ruft block_company_for_candidate() SECURITY DEFINER auf:
//   - Legt Eintrag in candidate_company_blocks an (idempotent via ON CONFLICT)
//   - Setzt candidate_declined Interaction (Match verschwindet aus Interessenten-Liste)
//   - Schreibt audit_log: action = 'candidate.company.blocked'

import { useRef, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseRecruiterBlockActionReturn {
  blockCompany: (matchId: string, companyId: string) => Promise<boolean>
  isBlocking: boolean
  error: string | null
}

export function useRecruiterBlockAction(): UseRecruiterBlockActionReturn {
  const mountedRef = useRef(true)
  const [isBlocking, setIsBlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function blockCompany(matchId: string, companyId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    setIsBlocking(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('block_company_for_candidate', {
      p_match_id:   matchId,
      p_company_id: companyId,
    })

    if (!mountedRef.current) return false

    if (rpcError) {
      console.warn('[useRecruiterBlockAction] blockCompany fehler:', rpcError.message)
      setError(rpcError.message)
      setIsBlocking(false)
      return false
    }

    setIsBlocking(false)
    return true
  }

  return { blockCompany, isBlocking, error }
}
