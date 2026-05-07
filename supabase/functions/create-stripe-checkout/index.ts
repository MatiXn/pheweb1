import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

// create-stripe-checkout — Story 8.1: Stripe Checkout Session erstellen
// verify_jwt = TRUE — nur authentifizierte Unternehmensnutzer

type SubscriptionTier = 'basis' | 'professional' | 'enterprise'

const TIER_PRICES_EUR_CENT: Record<SubscriptionTier, number> = {
  basis:        70000,   // 700€
  professional: 140000,  // 1.400€
  enterprise:   210000,  // 2.100€
}

const TIER_LABELS: Record<SubscriptionTier, string> = {
  basis:        'Basis',
  professional: 'Professional',
  enterprise:   'Enterprise',
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Auth: JWT → user
  const jwt = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)
  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // company_id über users-Tabelle ermitteln
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (userError || !userData?.company_id) {
    return new Response(
      JSON.stringify({ error: 'Kein Unternehmen für diesen Nutzer gefunden' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Tier aus Request Body
  let tier: SubscriptionTier
  try {
    const body = await req.json() as { tier?: string }
    if (!body.tier || !TIER_PRICES_EUR_CENT[body.tier as SubscriptionTier]) {
      return new Response(
        JSON.stringify({ error: 'Ungültiger Tier. Erlaubt: basis, professional, enterprise' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
    tier = body.tier as SubscriptionTier
  } catch {
    return new Response(
      JSON.stringify({ error: 'Ungültiger Request Body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
  })

  // P5: Trailing slash normalisieren (APP_URL=https://example.com/ → kein Doppelslash in URLs)
  const appUrl = (Deno.env.get('APP_URL') ?? 'http://localhost:5173').replace(/\/$/, '')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Fachkräfte-Plattform ${TIER_LABELS[tier]}`,
            description: 'Quartalszugang zur Fachkräfte-Vermittlungsplattform',
          },
          unit_amount: TIER_PRICES_EUR_CENT[tier],
          recurring: {
            interval: 'month',
            interval_count: 3,  // Quarterly
          },
        },
        quantity: 1,
      }],
      metadata: {
        company_id: userData.company_id,
        tier,
      },
      success_url: `${appUrl}/unternehmen/abonnement?status=success`,
      cancel_url:  `${appUrl}/unternehmen/abonnement?status=canceled`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'stripe_checkout_error', error: message }))
    return new Response(
      JSON.stringify({ error: `Stripe-Fehler: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
