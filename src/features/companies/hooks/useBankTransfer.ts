// useBankTransfer.ts — Story 8.2: Banküberweisung-Flow
// Initiiert Banküberweisung via RPC + sendet Anweisungs-E-Mail via Edge Function

import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { SubscriptionTier } from '../types'

interface BankTransferState {
  isLoading: boolean
  error: string | null
}

interface UseBankTransferReturn extends BankTransferState {
  initiateBankTransfer: (tier: SubscriptionTier) => Promise<string | null>
}

export function useBankTransfer(): UseBankTransferReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function initiateBankTransfer(tier: SubscriptionTier): Promise<string | null> {
    setIsLoading(true)
    setError(null)

    try {
      // 1. RPC aufrufen — legt ausstehende Subscription an, gibt subscription_id zurück
      const { data: subscriptionId, error: rpcError } = await supabase
        .rpc('initiate_bank_transfer', { p_tier: tier })

      if (rpcError) {
        // Fehlercode P0003 = bereits eine ausstehende Überweisung vorhanden
        const msg = rpcError.code === 'P0003'
          ? 'Sie haben bereits eine ausstehende Banküberweisung.'
          : rpcError.message
        setError(msg)
        return null
      }

      if (!subscriptionId) {
        setError('Überweisung konnte nicht initiiert werden.')
        return null
      }

      // 2. Edge Function aufrufen — sendet Zahlungsanweisungen per E-Mail
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      if (accessToken) {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-bank-transfer-instructions`,
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
          // E-Mail-Fehler ist nicht kritisch — Subscription wurde bereits angelegt
          console.warn('send-bank-transfer-instructions fehlgeschlagen:', res.status)
        }
      }

      return subscriptionId as string
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, error, initiateBankTransfer }
}
