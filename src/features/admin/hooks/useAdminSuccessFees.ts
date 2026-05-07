// useAdminSuccessFees — Story 7.5: Admin-Success-Fee-Tracking
// Lädt alle Success-Fee-Einträge via RPC und erlaubt "Bezahlt markieren"

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { SuccessFeeEntry, SuccessFeeStatus } from '../types'

export function useAdminSuccessFees() {
  const [fees, setFees] = useState<SuccessFeeEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_admin_success_fees')
    setIsLoading(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    setFees(
      (data ?? []).map((row: Record<string, unknown>) => ({
        feeId:             row.fee_id             as string,
        companyName:       row.company_name        as string,
        candidateAnonId:   row.candidate_anon_id   as string | null,
        professionalTitle: row.professional_title  as string,
        locationCity:      row.location_city       as string,
        annualSalary:      row.annual_salary        as number,
        feeAmount:         row.fee_amount           as number,
        feeStatus:         row.fee_status           as SuccessFeeStatus,
        createdAt:         row.created_at           as string,
        paidAt:            row.paid_at              as string | null,
      }))
    )
  }, [])

  const markPaid = useCallback(async (feeId: string): Promise<string | null> => {
    const { error: rpcError } = await supabase.rpc('mark_success_fee_paid', { p_fee_id: feeId })
    if (rpcError) return rpcError.message
    await fetchFees()
    return null
  }, [fetchFees])

  useEffect(() => { fetchFees() }, [fetchFees])

  return { fees, isLoading, error, refetch: fetchFees, markPaid }
}
