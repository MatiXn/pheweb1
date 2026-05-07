// useSubscription.ts — Story 8.1: Subscription-Status laden + Stripe Checkout
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { SubscriptionInfo, SubscriptionTier, SubscriptionStatus } from '../types'

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_my_subscription')
    setIsLoading(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    const rows = (data ?? []) as Array<Record<string, unknown>>
    if (rows.length === 0) {
      setSubscription(null)
      return
    }
    const row = rows[0]
    setSubscription({
      id:                   row.id as string,
      tier:                 row.tier as SubscriptionTier,
      status:               row.status as SubscriptionStatus,
      stripeSubscriptionId: row.stripe_subscription_id as string | null,
      stripeCustomerId:     row.stripe_customer_id as string | null,
      currentPeriodStart:   row.current_period_start as string | null,
      currentPeriodEnd:     row.current_period_end as string | null,
      createdAt:            row.created_at as string,
    })
  }, [])

  async function createCheckoutSession(tier: SubscriptionTier): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) throw new Error('Nicht angemeldet')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier }),
      }
    )

    // P3: Nicht-2xx Antworten (z.B. 502 Gateway-Fehler) vor JSON-Parsing prüfen
    if (!res.ok) {
      let message = `Checkout fehlgeschlagen (HTTP ${res.status})`
      try {
        const errBody = await res.json() as { error?: string }
        if (errBody.error) message = errBody.error
      } catch { /* non-JSON Antwort */ }
      throw new Error(message)
    }
    const result = await res.json() as { url?: string; error?: string }
    if (result.error || !result.url) {
      throw new Error(result.error ?? 'Checkout fehlgeschlagen')
    }
    // Redirect zu Stripe Checkout — kein React Router (externe URL)
    window.location.href = result.url
  }

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return { subscription, isLoading, error, refetch: fetchSubscription, createCheckoutSession }
}
