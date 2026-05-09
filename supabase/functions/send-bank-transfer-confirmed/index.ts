import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'
import {
  buildBankTransferConfirmedHtml,
  buildBankTransferConfirmedSubject,
} from './email-templates.ts'

// send-bank-transfer-confirmed — Story 8.2: Bestätigungs-E-Mail nach Admin-Confirm
// Aufgerufen nach admin_confirm_bank_transfer() mit { subscription_id }

const FROM_ADDRESS = 'PHE Perm <noreply@phe-perm.de>'

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
    // Subscription laden (jetzt im Status aktiv nach admin_confirm)
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('id, company_id, tier, status, bank_transfer_reference, expires_at')
      .eq('id', subscription_id)
      .eq('status', 'aktiv')
      .single()

    if (subError || !sub) {
      return new Response(
        JSON.stringify({ error: 'Aktive Subscription nicht gefunden' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      )
    }

    // Unternehmen laden
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

    // Ablaufdatum formatieren
    const expires = new Date(sub.expires_at)
    const expiresDate = expires.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    // Bestätigungs-E-Mail senden
    const { error: emailError } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: [user.email],
      subject: buildBankTransferConfirmedSubject(),
      html: buildBankTransferConfirmedHtml({
        companyName: profile.name,
        reference: sub.bank_transfer_reference,
        tier: sub.tier,
        expiresDate,
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

    return new Response(
      JSON.stringify({ status: 'ok', message: 'Bestätigungs-E-Mail gesendet', email: user.email }),
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
