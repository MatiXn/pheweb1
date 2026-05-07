import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'
import {
  buildCandidateMatchSubject,
  buildCandidateMatchHtml,
} from './email-templates.ts'

// send-candidate-match-notification — Story 5.3: Recruiter-Benachrichtigung bei Kandidaten-Matches
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false)
// Verarbeitet alle matches WHERE candidate_notified_at IS NULL AND created_at > NOW() - 24h
//
// WICHTIG: candidates.encrypted_email ist AES-verschlüsselt — NICHT verwenden.
// E-Mails gehen an candidates.recruiter_id → users.email (Recruiter als Intermediär).

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
  let matchesProcessed = 0
  let emailsSent = 0
  let matchesMarked = 0
  let errors = 0

  try {
    // ── 1. Unbenachrichtigte Matches laden (max. 24h alt) ───────────────────
    const cutoff = new Date(Date.now() - STALE_MATCH_HOURS * 60 * 60 * 1000).toISOString()

    const { data: unnotified, error: matchesError } = await supabase
      .from('matches')
      .select('id, job_id, candidate_id, created_at')
      .is('candidate_notified_at', null)
      .gte('created_at', cutoff)

    if (matchesError) throw new Error(`Matches query failed: ${matchesError.message}`)

    if (!unnotified || unnotified.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine unbenachrichtigten Kandidaten-Matches', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Resend erst initialisieren wenn tatsächlich Matches vorhanden (kein Absturz bei fehlendem Key im Leerlauf)
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'candidate_notification_start', unnotifiedCount: unnotified.length }))

    // ── 2. Pro Match: Kandidat → Recruiter → Job laden ──────────────────────
    for (const match of unnotified) {
      const matchId = match.id as string
      const candidateId = match.candidate_id as string
      const jobId = match.job_id as string

      try {
        // Kandidat laden (recruiter_id + anonymous_id für Referenz)
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('id, anonymous_id, recruiter_id, professional_title')
          .eq('id', candidateId)
          .single()

        if (candidateError || !candidate) {
          console.error(JSON.stringify({ event: 'candidate_fetch_error', matchId, candidateId, error: candidateError?.message }))
          errors++
          continue
        }

        const c = candidate as Record<string, unknown>

        // Recruiter laden (via candidates.recruiter_id → users)
        const { data: recruiter, error: recruiterError } = await supabase
          .from('users')
          .select('id, email, first_name, is_active')
          .eq('id', c.recruiter_id)
          .eq('is_active', true)
          .single()

        if (recruiterError || !recruiter) {
          console.error(JSON.stringify({
            event: 'recruiter_fetch_error',
            matchId,
            candidateId,
            recruiterId: c.recruiter_id,
            error: recruiterError?.message,
          }))
          errors++
          continue
        }

        const r = recruiter as Record<string, unknown>

        // Job laden (anonymisiert — KEIN join auf companies.name)
        const { data: job, error: jobError } = await supabase
          .from('jobs')
          .select('id, title, location_city, salary_min, salary_max, salary_currency')
          .eq('id', jobId)
          .single()

        if (jobError || !job) {
          console.error(JSON.stringify({ event: 'job_fetch_error', matchId, jobId, error: jobError?.message }))
          errors++
          continue
        }

        const j = job as Record<string, unknown>

        // ── 3. E-Mail an Recruiter senden ──────────────────────────────────
        const recruiterFirstName = (r.first_name as string) ?? 'Recruiter'
        const toEmail = r.email as string
        const anonymousId = (c.anonymous_id as string) ?? candidateId.slice(0, 8)

        const subject = buildCandidateMatchSubject({
          recruiterFirstName,
          jobTitle: j.title as string,
        })

        const html = buildCandidateMatchHtml({
          recruiterFirstName,
          candidateAnonymousId: anonymousId,
          jobTitle: j.title as string,
          locationCity: j.location_city as string | null,
          salaryMin: j.salary_min as number | null,
          salaryMax: j.salary_max as number | null,
          salaryCurrency: (j.salary_currency as string) ?? 'EUR',
          candidateId,
          platformUrl,
        })

        const { error: resendError } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [toEmail],
          subject,
          html,
        })

        if (resendError) {
          console.error(JSON.stringify({
            event: 'resend_error',
            matchId,
            candidateId,
            recruiterId: r.id,
            error: resendError.message,
          }))
          errors++
          continue
        }

        emailsSent++

        // ── 4. candidate_notified_at setzen ───────────────────────────────
        const { error: updateError } = await supabase
          .from('matches')
          .update({ candidate_notified_at: new Date().toISOString() })
          .eq('id', matchId)

        if (updateError) {
          console.error(JSON.stringify({ event: 'update_error', matchId, error: updateError.message }))
          errors++
          continue
        }

        matchesMarked++

        // ── 5. Audit-Log Eintrag ───────────────────────────────────────────
        await supabase.from('audit_log').insert({
          action: 'email.candidate_match_notification.sent',
          entity_type: 'candidate',
          entity_id: candidateId,
          metadata: {
            match_id: matchId,
            job_id: jobId,
            recruiter_id: r.id,
          },
        })

        matchesProcessed++

        console.log(JSON.stringify({
          event: 'match_notified',
          matchId,
          candidateId,
          recruiterId: r.id,
          jobId,
        }))

      } catch (matchError) {
        console.error(JSON.stringify({
          event: 'match_notification_error',
          matchId,
          error: String(matchError),
        }))
        errors++
      }
    }

    const summary = {
      status: 'ok',
      matchesProcessed,
      emailsSent,
      matchesMarked,
      errors,
      durationMs: Date.now() - startTime,
    }

    console.log(JSON.stringify({ event: 'candidate_notification_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'candidate_notification_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'CANDIDATE_NOTIFICATION_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
