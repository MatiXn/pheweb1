import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

// send-interest-notification — Story 6.2: Recruiter bei Unternehmens-Interesse benachrichtigen
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false, Offset 1-56/5)
// Idempotenz: Sendet nur wenn KEIN audit_log Eintrag 'email.interest_notification.sent' für diesen Match

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
    // ── 1. Matches mit 'interested' Status finden die noch KEINE Benachrichtigung haben ──
    // Subquery: audit_log prüfen ob 'email.interest_notification.sent' für match_id existiert
    const { data: interestedRows, error: queryError } = await supabase
      .from('interactions')
      .select('match_id, set_by, created_at')
      .eq('status', 'interested')
      .order('created_at', { ascending: true })

    if (queryError) throw new Error(`Interactions query failed: ${queryError.message}`)

    if (!interestedRows || interestedRows.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Keine ausstehenden Interesse-Benachrichtigungen', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // Idempotenz-Check: Bereits gesendete Benachrichtigungen aus audit_log laden
    const matchIds = interestedRows.map((r: Record<string, unknown>) => r.match_id as string)
    const { data: alreadySentRows, error: auditError } = await supabase
      .from('audit_log')
      .select('entity_id')
      .eq('action', 'email.interest_notification.sent')
      .eq('entity_type', 'match')
      .in('entity_id', matchIds)

    if (auditError) throw new Error(`Audit log query failed: ${auditError.message}`)

    const alreadySentIds = new Set(
      (alreadySentRows ?? []).map((r: Record<string, unknown>) => r.entity_id as string)
    )

    // Nur unbenachrichtigte Matches verarbeiten
    const pending = interestedRows.filter(
      (r: Record<string, unknown>) => !alreadySentIds.has(r.match_id as string)
    )

    if (pending.length === 0) {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Alle Interesse-Benachrichtigungen bereits gesendet', durationMs: Date.now() - startTime }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'interest_notification_start', pendingCount: pending.length }))

    // ── 2. Pro Match: Recruiter + Unternehmens-Name laden und Benachrichtigung senden ──
    for (const row of pending) {
      const matchId = row.match_id as string
      const companyUserId = row.set_by as string

      try {
        // Match → Kandidat → Recruiter laden
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
            jobs!inner(
              title,
              company_id
            )
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

        // Unternehmens-Name laden
        const { data: companyUser, error: companyError } = await supabase
          .from('users')
          .select('first_name, last_name, company_name')
          .eq('id', companyUserId)
          .single()

        const cu = companyUser as Record<string, unknown> | null
        const companyName = cu
          ? ((cu.company_name as string) ?? `${cu.first_name ?? ''} ${cu.last_name ?? ''}`.trim())
          : 'Ein Unternehmen'

        if (companyError) {
          console.warn(JSON.stringify({ event: 'company_fetch_warn', matchId, error: companyError.message }))
        }

        // E-Mail an Recruiter senden
        const subject = `Interesse signalisiert: ${anonymousId} — ${jobTitle}`
        const html = buildInterestNotificationHtml({
          recruiterFirstName,
          anonymousId,
          jobTitle,
          companyName,
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

        // Idempotenz-Eintrag in audit_log setzen
        const { error: auditInsertError } = await supabase.from('audit_log').insert({
          action:      'email.interest_notification.sent',
          entity_type: 'match',
          entity_id:   matchId,
          user_id:     companyUserId,
          metadata:    { recruiter_email: recruiterEmail, anonymous_id: anonymousId },
        })

        if (auditInsertError) {
          console.error(JSON.stringify({ event: 'audit_log_error', matchId, error: auditInsertError.message }))
          // Kein Abbruch — E-Mail wurde bereits gesendet, nur Logging fehlgeschlagen
        }

        notificationsSent++
        console.log(JSON.stringify({ event: 'interest_notification_sent', matchId, anonymousId, recruiterEmail }))

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

    console.log(JSON.stringify({ event: 'interest_notification_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'interest_notification_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'INTEREST_NOTIFICATION_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

// ── E-Mail Template ───────────────────────────────────────────────────────────
function buildInterestNotificationHtml(params: {
  recruiterFirstName: string
  anonymousId: string
  jobTitle: string
  companyName: string
}): string {
  const { recruiterFirstName, anonymousId, jobTitle, companyName } = params
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interesse signalisiert</title>
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
                Interesse an Ihrem Kandidaten
              </h1>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 24px;">
                Hallo ${recruiterFirstName},
              </p>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 24px;">
                <strong>${companyName}</strong> hat Interesse an Ihrem Kandidaten
                <strong>${anonymousId}</strong> für die Stelle <strong>${jobTitle}</strong> signalisiert.
              </p>
              <div style="background:#eef4ff;border-radius:10px;padding:20px;margin:0 0 24px;">
                <div style="font-size:13px;font-weight:700;color:#2a5490;margin-bottom:8px;">NÄCHSTE SCHRITTE</div>
                <p style="font-size:14px;color:#4b5675;line-height:1.55;margin:0;">
                  Das Unternehmen hat Ihre Kontaktdaten erhalten und wird sich für weitere Informationen
                  direkt bei Ihnen melden. Bitte bereiten Sie die Kandidaten-Vorstellung vor.
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
