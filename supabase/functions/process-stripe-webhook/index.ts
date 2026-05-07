import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'

// process-stripe-webhook — Story 8.1: Stripe Webhook-Verarbeitung
// verify_jwt = FALSE — Stripe sendet kein JWT, nutzt eigene Signatur-Verifizierung

type SubscriptionTier = 'basis' | 'professional' | 'enterprise'
const VALID_TIERS: SubscriptionTier[] = ['basis', 'professional', 'enterprise']

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
  })

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET nicht konfiguriert')
    return new Response(
      JSON.stringify({ error: 'Server-Konfigurationsfehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // KRITISCH: Raw Body lesen BEVOR JSON-Parsing —
  // stripe.webhooks.constructEvent braucht den exakten Raw-String
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'webhook_signature_failed', error: message }))
    return new Response(
      JSON.stringify({ error: `Signatur-Verifizierung fehlgeschlagen: ${message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // ── Idempotenz: stripe_event_id eintragen ─────────────────────────────────
  // stripe_events.stripe_event_id hat UNIQUE Constraint → ON CONFLICT führt zu
  // Postgres Error Code 23505 (unique_violation)
  const { error: insertError } = await supabase
    .from('stripe_events')
    .insert({
      stripe_event_id: event.id,
      event_type:      event.type,
      payload:         JSON.parse(body) as Record<string, unknown>,
    })

  if (insertError) {
    if (insertError.code === '23505') {
      // Bereits verarbeitet → stumm ignorieren (AC#4)
      console.log(JSON.stringify({ event: 'webhook_duplicate', stripe_event_id: event.id }))
      return new Response(
        JSON.stringify({ status: 'already_processed' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    console.error(JSON.stringify({ event: 'stripe_events_insert_error', error: insertError.message }))
    return new Response(
      JSON.stringify({ error: insertError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── Event-spezifische Verarbeitung ────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // P1: Nur Subscription-Checkouts verarbeiten (keine one-time payments)
    if (session.mode !== 'subscription') {
      console.log(JSON.stringify({ event: 'checkout_non_subscription_skipped', mode: session.mode, session_id: session.id }))
      return new Response(
        JSON.stringify({ status: 'ok', event_type: event.type }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const companyId = session.metadata?.company_id
    const tier      = session.metadata?.tier as SubscriptionTier | undefined

    // P2: Tier-Metadaten gegen bekannte Werte validieren
    if (!companyId || !tier || !VALID_TIERS.includes(tier)) {
      console.error(JSON.stringify({
        event: 'checkout_metadata_missing',
        session_id: session.id,
        metadata: session.metadata,
      }))
      return new Response(
        JSON.stringify({ error: 'Fehlende oder ungültige metadata (company_id, tier) in Stripe Session' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Subscription-Zeitraum: +90 Tage (Quartal) als Näherung bis invoice.paid es präzisiert
    const now        = new Date()
    const periodEnd  = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    // Subscription-Eintrag anlegen
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        company_id:             companyId,
        tier,
        status:                 'aktiv',
        stripe_subscription_id: (session.subscription as string) ?? null,
        stripe_customer_id:     (session.customer as string)     ?? null,
        current_period_start:   now.toISOString(),
        current_period_end:     periodEnd.toISOString(),
      })

    if (subError) {
      console.error(JSON.stringify({ event: 'subscription_insert_error', error: subError.message }))
      return new Response(
        JSON.stringify({ error: subError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Unternehmen aktivieren
    const { error: companyError } = await supabase
      .from('companies')
      .update({ account_status: 'aktiv' })
      .eq('id', companyId)

    if (companyError) {
      console.error(JSON.stringify({ event: 'company_activate_error', error: companyError.message }))
      // DN1: 500 zurückgeben damit Stripe die Anfrage wiederholt — Subscription ist angelegt aber Company inaktiv
      return new Response(
        JSON.stringify({ error: companyError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(JSON.stringify({
      event:       'subscription_created',
      company_id:  companyId,
      tier,
      session_id:  session.id,
    }))
  }
  // Andere Events (invoice.paid, invoice.payment_failed etc.) → Story 8.3/8.4

  return new Response(
    JSON.stringify({ status: 'ok', event_type: event.type }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
