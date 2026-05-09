import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'
import {
  buildBankTransferInstructionsHtml,
  buildBankTransferInstructionsSubject,
} from './email-templates.ts'

// send-bank-transfer-instructions — Story 8.2: Banküberweisung-Anweisungen per E-Mail
// Aufgerufen nach initiate_bank_transfer() mit { subscription_id }
// Idempotent: sendet nur wenn bank_transfer_email_sent_at IS NULL

const FROM_ADDRESS = 'PHE Perm <noreply@phe-perm.de>'

const TIER_PRICES: Record<string, number> = {
  basis: 700,
  professional: 1400,
  enterprise: 2100,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
  const platformUrl = Deno.env.get('PLATFORM_URL') ?? 'https://app.phe-perm.de'

  const iban = Deno.env.get('BANK_IBAN') ?? 'DE89 3704 0044 0532 0130 00'
  const bic = Deno.env.get('BANK_BIC') ?? 'COBADEFFXXX'
  const accountHolder = Deno.env.get('BANK_ACCOUNT_HOLDER') ?? 'PHE Perm GmbH'

  let body: { subscription_id: string }
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  }

  const { subscription_id } = body
  if (!subscription_id) {
    return new Response(
      JSON.stringify({ error: 'subscription_id erforderlich' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  }

  try {
    // Subscription laden
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, company_id, tier, status, bank_transfer_reference, bank_transfer_requested_at, bank_transfer_email_sent_at, expires_at')
      .eq('id', subscription_id)
      .single()

    if (subError || !sub) {
      return new Response(
        JSON.stringify({ error: 'Subscription nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    if (sub.status !== 'ausstehend_zahlung') {
      return new Response(
        JSON.stringify({ error: 'Subscription ist nicht im Status ausstehend_zahlung' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // Idempotenz: nicht erneut senden wenn bereits gesendet
    if (sub.bank_transfer_email_sent_at) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'E-Mail bereits gesendet', skipped: true }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // Unternehmen und User laden
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', sub.company_id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Unternehmensprofil nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // Primären User des Unternehmens laden
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('company_id', sub.company_id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unternehmensnutzer nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // Zahlungsfrist formatieren
    const deadline = new Date(sub.expires_at)
    const deadlineDate = deadline.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    const amountEur = TIER_PRICES[sub.tier] ?? 0

    // E-Mail senden
    const { error: emailError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [user.email],
      subject: buildBankTransferInstructionsSubject(sub.bank_transfer_reference),
      html: buildBankTransferInstructionsHtml({
        companyName: profile.name,
        reference: sub.bank_transfer_reference,
        tier: sub.tier,
        amountEur,
        iban,
        bic,
        accountHolder,
        deadlineDate,
        platformUrl,
      }),
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return new Response(
        JSON.stringify({ error: 'E-Mail-Versand fehlgeschlagen', details: emailError }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // bank_transfer_email_sent_at setzen
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ bank_transfer_email_sent_at: new Date().toISOString() })
      .eq('id', subscription_id)

    if (updateError) {
      console.error('Update error:', updateError)
    }

    return new Response(
      JSON.stringify({ status: 'ok', message: 'Zahlungsanweisungen gesendet', email: user.email }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Interner Serverfehler' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    )
  }
})
