// useAdminCompanyQueue.ts
// Story 7.4: Unternehmens-Aktivierung & Konto-Management
// Lädt ausstehende Unternehmensregistrierungen via get_admin_company_queue()

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { AdminCompanyQueueEntry, CompanyAccountStatus } from '../types'

export function useAdminCompanyQueue() {
  const [entries, setEntries] = useState<AdminCompanyQueueEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_admin_company_queue')
    setIsLoading(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    // snake_case → camelCase Mapping (analog zu useVerificationQueue.ts)
    setEntries((data ?? []).map((row: Record<string, unknown>) => ({
      companyId:           row.company_id as string,
      companyName:         row.company_name as string,
      industry:            row.industry as string | null,
      size:                row.size as string | null,
      website:             row.website as string | null,
      contactPersonName:   row.contact_person_name as string | null,
      contactPersonPhone:  row.contact_person_phone as string | null,
      userEmail:           row.user_email as string,
      userFirstName:       row.user_first_name as string | null,
      userLastName:        row.user_last_name as string | null,
      accountStatus:       row.account_status as CompanyAccountStatus,
      createdAt:           row.created_at as string,
      welcomeSentAt:       row.welcome_sent_at as string | null,
    })))
  }, [])

  useEffect(() => { fetchQueue() }, [fetchQueue])

  return { entries, isLoading, error, refetch: fetchQueue }
}
