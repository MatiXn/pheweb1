// useAdminBankTransfers.ts — Story 8.2: Admin-Sicht auf ausstehende Banküberweisungen
// Lädt alle Subscriptions mit status = 'ausstehend_zahlung'
// Ermöglicht Bestätigung via admin_confirm_bank_transfer RPC

import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export interface PendingBankTransfer {
  subscriptionId: string
  companyId: string
  tier: string
  reference: string
  requestedAt: string
  expiresAt: string
}

interface UseAdminBankTransfersReturn {
  pendingTransfers: PendingBankTransfer[]
  isLoading: boolean
  isConfirming: boolean
  error: string | null
  confirmTransfer: (subscriptionId: string) => Promise<boolean>
  hasPendingTransfer: (companyId: string) => PendingBankTransfer | undefined
}

export function useAdminBankTransfers(): UseAdminBankTransfersReturn {
  const [pendingTransfers, setPendingTransfers] = useState<PendingBankTransfer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingTransfers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const { data, error: dbError } = await supabase
      .from('subscriptions')
      .select('id, company_id, tier, bank_transfer_reference, bank_transfer_requested_at, expires_at')
      .eq('status', 'ausstehend_zahlung')
      .order('bank_transfer_requested_at', { ascending: true })

    setIsLoading(false)

    if (dbError) {
      setError(dbError.message)
      return
    }

    setPendingTransfers(
      (data ?? []).map(row => ({
        subscriptionId:  row.id as string,
        companyId:       row.company_id as string,
        tier:            row.tier as string,
        reference:       row.bank_transfer_reference as string,
        requestedAt:     row.bank_transfer_requested_at as string,
        expiresAt:       row.expires_at as string,
      }))
    )
  }, [])

  useEffect(() => {
    void fetchPendingTransfers()
  }, [fetchPendingTransfers])

  async function confirmTransfer(subscriptionId: string): Promise<boolean> {
    setIsConfirming(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('admin_confirm_bank_transfer', {
      p_subscription_id: subscriptionId,
    })

    setIsConfirming(false)

    if (rpcError) {
      setError(rpcError.message)
      return false
    }

    // Nach Bestätigung: E-Mail senden via Edge Function
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    if (accessToken) {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-bank-transfer-confirmed`,
        {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ subscription_id: subscriptionId }),
        }
      )
      if (!res.ok) {
        console.warn('send-bank-transfer-confirmed fehlgeschlagen:', res.status)
      }
    }

    // Liste aktualisieren
    await fetchPendingTransfers()
    return true
  }

  function hasPendingTransfer(companyId: string): PendingBankTransfer | undefined {
    return pendingTransfers.find(t => t.companyId === companyId)
  }

  return { pendingTransfers, isLoading, isConfirming, error, confirmTransfer, hasPendingTransfer }
}
