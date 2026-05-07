// useAdminCandidateAction — Story 7.2/7.3: Kandidaten-Profil freischalten, ablehnen oder sperren
// Ruft approve_candidate() / reject_candidate() / block_candidate() SECURITY DEFINER Funktionen auf

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseAdminCandidateActionReturn {
  isProcessing: boolean
  error: string | null
  approve: (candidateId: string) => Promise<void>
  reject: (candidateId: string, feedback: string) => Promise<void>
  block: (candidateId: string, reason: string) => Promise<void>
}

export function useAdminCandidateAction(): UseAdminCandidateActionReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function approve(candidateId: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('approve_candidate', {
      p_candidate_id: candidateId,
    })
    setIsProcessing(false)
    if (rpcError) {
      setError(rpcError.message)
    }
  }

  async function reject(candidateId: string, feedback: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('reject_candidate', {
      p_candidate_id: candidateId,
      p_feedback: feedback,
    })
    setIsProcessing(false)
    if (rpcError) {
      setError(rpcError.message)
    }
  }

  async function block(candidateId: string, reason: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('block_candidate', {
      p_candidate_id: candidateId,
      p_reason: reason,
    })
    setIsProcessing(false)
    if (rpcError) {
      setError(rpcError.message)
    }
  }

  return { isProcessing, error, approve, reject, block }
}
