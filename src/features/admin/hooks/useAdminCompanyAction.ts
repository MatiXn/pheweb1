// useAdminCompanyAction.ts
// Story 7.4: Unternehmens-Aktivierung & Konto-Management
// Admin-Aktionen: activate, freeze, block — analog zu useAdminCandidateAction.ts

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseAdminCompanyActionReturn {
  isProcessing: boolean
  error: string | null
  activate: (companyId: string) => Promise<void>
  freeze: (companyId: string) => Promise<void>
  block: (companyId: string, reason: string) => Promise<void>
}

export function useAdminCompanyAction(): UseAdminCompanyActionReturn {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function activate(companyId: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('activate_company', {
      p_company_id: companyId,
    })
    setIsProcessing(false)
    if (rpcError) setError(rpcError.message)
  }

  async function freeze(companyId: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('freeze_company', {
      p_company_id: companyId,
    })
    setIsProcessing(false)
    if (rpcError) setError(rpcError.message)
  }

  async function block(companyId: string, reason: string): Promise<void> {
    setIsProcessing(true)
    setError(null)
    const { error: rpcError } = await supabase.rpc('block_company', {
      p_company_id: companyId,
      p_reason: reason,
    })
    setIsProcessing(false)
    if (rpcError) setError(rpcError.message)
  }

  return { isProcessing, error, activate, freeze, block }
}
