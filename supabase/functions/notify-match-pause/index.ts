import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

// notify-match-pause — Story 6.6: Recruiter bei Konto-Einfrierung benachrichtigen
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false)
// Idempotenz: Sendet nur wenn KEIN audit_log Eintrag 'email.match_pause_notification.sent' für diesen Match

const FROM_ADDRESS = 'PHE-Perm <noreply@phe-perm.de>'

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const startTime = Date.now()
  let notificationsSent = 0
  let errors = 0

  try {
    // ── 1. Alle aktuell pausierten Matches finden ─────────────────────────────
    // Subquery: letzter interactions-Eintrag pro match muss 'paused' sein
    const { data: pausedRows, error: queryError } = await supabase
      .from('interactions')
      .select('match_id, created_at')
      .eq('status', 'paused')
      .order('created_at', { ascending: true })

    if (queryError) throw new Error(`Interactions query failed: ${queryError.message}`)

    if (!pausedRows || pausedRows.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine pausierten Matches', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Deduplizieren: Pro match_id nur den neuesten paused-Eintrag behalten
    const matchMap = new Map<string, Record<string, unknown>>()
    for (const row of pausedRows as Record<string, unknown>[]) {
      const matchId = row.match_id as string
      if (!matchMap.has(matchId)) {
        matchMap.set(matchId, row)
      }
    }
    const uniquePausedMatchIds = Array.from(matchMap.keys())

    // ── 2. Idempotenz-Check: bereits benachrichtigte Matches aus audit_log ─────
    const { data: alreadySentRows, error: auditError } = await supabase
      .from('audit_log')
      .select('entity_id')
      .eq('action', 'email.match_pause_notification.sent')
      .eq('entity_type', 'match')
      .in('entity_id', uniquePausedMatchIds)

    if (auditError) throw new Error(`Audit log query failed: ${auditError.message}`)

    const alreadySentIds = new Set(
      (alreadySentRows ?? []).map((r: Record<string, unknown>) => r.entity_id as string)
    )

    const pending = uniquePausedMatchIds.filter(id => !alreadySentIds.has(id))

    if (pending.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Alle Pause-Benachrichtigungen bereits gesendet', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'pause_notification_start', pendingCount: pending.length }))

    // ── 3. Pro Match: Kandidat → Recruiter laden und Benachrichtigung senden ───
    for (const matchId of pending) {
      try {
        // Match → Kandidat → Recruiter laden (wie send-interest-notification)
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            id,
            candidate_id,
            job_id,
            candidates!inner(
              anonymous_id,
              recruiter_id,
              users!inner(first_name, last_name, email)
            ),
            jobs!inner(title)
          `)
          .eq('id', matchId)
          .single()

        if (matchError || !matchData) {
          console.error(JSON.stringify({ event: 'match_fetch_error', matchId, error: matchError?.message }))
          errors++
          continue
        }

        const m = matchData as Record<string, unknown>
        const candidate = m.candidates as Record<string, unknown>
        const recruiterUser = candidate.users as Record<string, unknown>
        const job = m.jobs as Record<string, unknown>

        const recruiterFirstName = (recruiterUser.first_name as string) ?? 'Recruiter'
        const recruiterEmail = recruiterUser.email as string
        const anonymousId = candidate.anonymous_id as string
        const jobTitle = job.title as string

        // E-Mail an Recruiter senden
        const subject = `Laufender Prozess vorübergehend pausiert: ${anonymousId}`
        const html = buildPauseNotificationHtml({
          recruiterFirstName,
          anonymousId,
          jobTitle,
        })

        const { error: resendError } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [recruiterEmail],
          subject,
          html,
        })

        if (resendError) {
          console.error(JSON.stringify({ event: 'resend_error', matchId, error: resendError.message }))
          errors++
          continue
        }

        // Idempotenz-Eintrag in audit_log
        const { error: auditInsertError } = await supabase.from('audit_log').insert({
          action:      'email.match_pause_notification.sent',
          entity_type: 'match',
          entity_id:   matchId,
          user_id:     null,  // kein Auth-User (pg_cron)
          metadata:    { recruiter_email: recruiterEmail, anonymous_id: anonymousId },
        })

        if (auditInsertError) {
          console.error(JSON.stringify({ event: 'audit_log_error', matchId, error: auditInsertError.message }))
          // Kein Abbruch — E-Mail bereits gesendet
        }

        notificationsSent++
        console.log(JSON.stringify({ event: 'pause_notification_sent', matchId, anonymousId, recruiterEmail }))

      } catch (matchErr) {
        console.error(JSON.stringify({ event: 'match_processing_error', matchId, error: String(matchErr) }))
        errors++
      }
    }

    const summary = {
      status: 'ok',
      notificationsSent,
      errors,
      durationMs: Date.now() - startTime,
    }

    console.log(JSON.stringify({ event: 'pause_notification_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'pause_notification_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'PAUSE_NOTIFICATION_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

// ── E-Mail Template ───────────────────────────────────────────────────────────
function buildPauseNotificationHtml(params: {
  recruiterFirstName: string
  anonymousId: string
  jobTitle: string
}): string {
  const { recruiterFirstName, anonymousId, jobTitle } = params
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prozess vorübergehend pausiert</title>
</head>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <tr>
            <td>
              <div style="font-size:22px;font-weight:800;color:#0f1623;letter-spacing:-0.02em;margin-bottom:24px;">
                phe<em style="font-style:italic;color:#3b72b8;">web</em>
              </div>
              <h1 style="font-size:20px;font-weight:700;color:#0f1623;margin:0 0 16px;">
                Vermittlungsprozess vorübergehend pausiert
              </h1>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 16px;">
                Hallo ${recruiterFirstName},
              </p>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 24px;">
                der laufende Vermittlungsprozess für Kandidat
                <strong>${anonymousId}</strong> bezüglich der Stelle
                <strong>${jobTitle}</strong> wurde vorübergehend pausiert.
              </p>
              <div style="background:#f3f4f6;border-radius:10px;padding:20px;margin:0 0 24px;border-left:4px solid #9ca3af;">
                <p style="font-size:14px;color:#374151;line-height:1.55;margin:0;font-weight:600;">
                  Dies liegt nicht am Profil des Kandidaten.
                </p>
                <p style="font-size:14px;color:#6b7280;line-height:1.55;margin:8px 0 0;">
                  Ein technischer Umstand auf Unternehmensseite hat zur Pausierung geführt.
                  Wir informieren Sie, sobald der Prozess wieder aufgenommen werden kann.
                </p>
              </div>
              <p style="font-size:13px;color:#8b9ab1;line-height:1.5;margin:0;">
                Diese E-Mail wurde automatisch von PHE-Perm generiert.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
