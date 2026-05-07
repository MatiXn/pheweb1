import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'
import { buildWelcomeSubject, buildWelcomeHtml } from './email-templates.ts'

// send-welcome-sequence — Story 5.5: Welcome-E-Mail nach Unternehmens-Aktivierung
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false, Offset 3 Minuten)
// Findet companies WHERE is_active = true AND welcome_sent_at IS NULL AND created_at > NOW() - 7 days

const STALE_COMPANY_DAYS = 7
const FROM_ADDRESS = 'PHE-Perm <noreply@phe-perm.de>'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const platformUrl = Deno.env.get('PLATFORM_URL') ?? 'https://app.phe-perm.de'
  const startTime = Date.now()
  let companiesProcessed = 0, emailsSent = 0, companiesMarked = 0, errors = 0

  try {
    // 1. Neue aktivierte Unternehmen ohne Welcome-E-Mail laden (max. 7 Tage alt)
    const cutoff = new Date(Date.now() - STALE_COMPANY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    const { data: newCompanies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .is('welcome_sent_at', null)
      .gte('created_at', cutoff)

    if (companiesError) throw new Error(`Companies query failed: ${companiesError.message}`)

    if (!newCompanies || newCompanies.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine neuen Unternehmen', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // KRITISCH: Resend NACH dem empty-company Guard initialisieren (Story 5.2 Bugfix-Lektion)
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'welcome_start', companyCount: newCompanies.length }))

    for (const company of newCompanies) {
      try {
        // Aktive Company-User laden
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email, first_name')
          .eq('company_id', company.id)
          .eq('role', 'company')
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (usersError || !users || users.length === 0) {
          console.error(JSON.stringify({
            event: 'users_fetch_error',
            companyId: company.id,
            error: usersError?.message ?? 'Keine aktiven User gefunden',
          }))
          errors++
          continue
        }

        let allSent = true

        for (const user of users) {
          const firstName = user.first_name ?? 'Team'
          const subject = buildWelcomeSubject({ firstName, companyName: company.name })
          const html = buildWelcomeHtml({ firstName, companyName: company.name, platformUrl })

          const { error: resendError } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [user.email],
            subject,
            html,
          })

          if (resendError) {
            console.error(JSON.stringify({
              event: 'resend_error',
              companyId: company.id,
              userId: user.id,
              error: resendError.message,
            }))
            allSent = false
            errors++
          } else {
            emailsSent++
          }
        }

        // welcome_sent_at nur setzen wenn ALLE User erfolgreich benachrichtigt (allSent-Guard)
        if (allSent) {
          const { error: updateError } = await supabase
            .from('companies')
            .update({ welcome_sent_at: new Date().toISOString() })
            .eq('id', company.id)

          if (updateError) {
            console.error(JSON.stringify({
              event: 'update_error',
              companyId: company.id,
              error: updateError.message,
            }))
            errors++
          } else {
            companiesMarked++
            await supabase.from('audit_log').insert({
              action: 'email.welcome_sequence.sent',
              entity_type: 'company',
              entity_id: company.id,
              metadata: { recipients: users.length },
            })
          }
        }

        companiesProcessed++
        console.log(JSON.stringify({
          event: 'company_welcomed',
          companyId: company.id,
          recipientCount: users.length,
          allSent,
        }))

      } catch (companyError) {
        console.error(JSON.stringify({
          event: 'company_error',
          companyId: company.id,
          error: String(companyError),
        }))
        errors++
      }
    }

    const summary = {
      status: 'ok',
      companiesProcessed,
      emailsSent,
      companiesMarked,
      errors,
      durationMs: Date.now() - startTime,
    }
    console.log(JSON.stringify({ event: 'welcome_complete', ...summary }))
    return new Response(JSON.stringify(summary), { headers: { 'Content-Type': 'application/json' } })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'welcome_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'WELCOME_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
