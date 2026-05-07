import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'
import {
  buildMatchNotificationSubject,
  buildMatchNotificationHtml,
} from './email-templates.ts'

// send-match-notification — Story 5.2: Unternehmen-Match-Benachrichtigung
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false)
// Verarbeitet alle matches WHERE company_notified_at IS NULL AND created_at > NOW() - 24h

const STALE_MATCH_HOURS = 24  // Matches älter als 24h werden übersprungen
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
  let jobsProcessed = 0
  let emailsSent = 0
  let matchesMarked = 0
  let errors = 0

  try {
    // ── 1. Unbenachrichtigte Matches laden (max. 24h alt) ───────────────────
    const cutoff = new Date(Date.now() - STALE_MATCH_HOURS * 60 * 60 * 1000).toISOString()

    const { data: unnotified, error: matchesError } = await supabase
      .from('matches')
      .select('id, job_id, created_at')
      .is('company_notified_at', null)
      .gte('created_at', cutoff)

    if (matchesError) throw new Error(`Matches query failed: ${matchesError.message}`)

    if (!unnotified || unnotified.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine unbenachrichtigten Matches', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Resend erst initialisieren wenn tatsächlich Matches vorhanden (kein Absturz bei fehlendem Key im Leerlauf)
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'notification_start', unnotifiedCount: unnotified.length }))

    // ── 2. Matches nach job_id gruppieren ───────────────────────────────────
    const byJob = new Map<string, string[]>()
    for (const m of unnotified) {
      const jobId = m.job_id as string
      const existing = byJob.get(jobId) ?? []
      existing.push(m.id as string)
      byJob.set(jobId, existing)
    }

    // ── 3. Pro Job: Benachrichtigung senden ─────────────────────────────────
    for (const [jobId, matchIds] of byJob) {
      try {
        // Job + Company laden
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, company_id')
          .eq('id', jobId)
          .single()

        if (jobError || !job) {
          console.error(JSON.stringify({ event: 'job_fetch_error', jobId, error: jobError?.message }))
          errors++
          continue
        }

        const j = job as Record<string, unknown>

        // Aktive Nutzer des Unternehmens laden
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, email, first_name')
          .eq('company_id', j.company_id)
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (usersError || !users || users.length === 0) {
          console.error(JSON.stringify({ event: 'users_fetch_error', jobId, error: usersError?.message }))
          errors++
          continue
        }

        const matchCount = matchIds.length
        const jobTitle = j.title as string
        let allSent = true

        // E-Mail an jeden aktiven Nutzer des Unternehmens senden
        for (const user of users) {
          const u = user as Record<string, unknown>
          const firstName = (u.first_name as string) ?? 'Team'
          const toEmail = u.email as string

          const subject = buildMatchNotificationSubject({ firstName, matchCount, jobTitle, jobId, platformUrl })
          const html = buildMatchNotificationHtml({ firstName, matchCount, jobTitle, jobId, platformUrl })

          const { error: resendError } = await resend.emails.send({
            from: FROM_ADDRESS,
            to: [toEmail],
            subject,
            html,
          })

          if (resendError) {
            console.error(JSON.stringify({
              event: 'resend_error',
              jobId,
              userId: u.id,
              error: resendError.message,
            }))
            allSent = false
            errors++
          } else {
            emailsSent++
          }
        }

        // company_notified_at nur setzen wenn ALLE Nutzer erfolgreich benachrichtigt
        if (allSent) {
          const { error: updateError } = await supabase
            .from('matches')
            .update({ company_notified_at: new Date().toISOString() })
            .in('id', matchIds)

          if (updateError) {
            console.error(JSON.stringify({ event: 'update_error', jobId, error: updateError.message }))
            errors++
          } else {
            matchesMarked += matchIds.length

            // Audit-Log Eintrag
            await supabase.from('audit_log').insert({
              action: 'email.match_notification.sent',
              entity_type: 'job',
              entity_id: jobId,
              metadata: {
                match_count: matchCount,
                recipients: users.length,
                match_ids: matchIds,
              },
            })
          }
        }

        jobsProcessed++

        console.log(JSON.stringify({
          event: 'job_notified',
          jobId,
          matchCount,
          recipientCount: users.length,
          allSent,
        }))

      } catch (jobError) {
        console.error(JSON.stringify({
          event: 'job_notification_error',
          jobId,
          error: String(jobError),
        }))
        errors++
      }
    }

    const summary = {
      status: 'ok',
      jobsProcessed,
      emailsSent,
      matchesMarked,
      errors,
      durationMs: Date.now() - startTime,
    }

    console.log(JSON.stringify({ event: 'notification_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'notification_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'NOTIFICATION_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
