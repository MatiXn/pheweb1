import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

// send-verification-result — Story 7.2: Kandidaten-Profil freischalten oder ablehnen
// Aufgerufen von pg_cron alle 5 Minuten (verify_jwt = false, Offset 3-58/5)
// Idempotenz: Sendet nur wenn KEIN audit_log Eintrag 'email.verification_result.sent' für candidate_id existiert

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
    // ── 1. Unverarbeitete approve/reject Einträge aus audit_log holen ────────
    const { data: pendingRows, error: pendingError } = await supabase
      .from('audit_log')
      .select('id, action, entity_id, metadata, created_at')
      .in('action', ['candidate.profile.approved', 'candidate.profile.rejected'])
      .order('created_at', { ascending: true })

    if (pendingError) throw new Error(`audit_log query failed: ${pendingError.message}`)

    if (!pendingRows || pendingRows.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'Keine ausstehenden Verifikations-Mails',
          durationMs: Date.now() - startTime,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    // ── 2. Idempotenz: Bereits gesendete candidate_ids laden ─────────────────
    const candidateIds = pendingRows.map((r: Record<string, unknown>) => r.entity_id as string)

    const { data: alreadySentRows, error: auditError } = await supabase
      .from('audit_log')
      .select('entity_id')
      .eq('action', 'email.verification_result.sent')
      .eq('entity_type', 'candidate')
      .in('entity_id', candidateIds)

    if (auditError) throw new Error(`Idempotenz-Query fehlgeschlagen: ${auditError.message}`)

    const alreadySentSet = new Set(
      (alreadySentRows ?? []).map((r: Record<string, unknown>) => r.entity_id as string),
    )

    const pending = pendingRows.filter(
      (r: Record<string, unknown>) => !alreadySentSet.has(r.entity_id as string),
    )

    if (pending.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'Alle Verifikations-Mails bereits gesendet',
          durationMs: Date.now() - startTime,
        }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    console.log(JSON.stringify({ event: 'verification_result_start', pendingCount: pending.length }))

    // ── 3. Pro Eintrag: Recruiter laden und E-Mail senden ────────────────────
    for (const row of pending) {
      const candidateId = row.entity_id as string
      const action = row.action as string
      const metadata = (row.metadata ?? {}) as Record<string, unknown>
      const feedback = (metadata.feedback as string) ?? ''

      try {
        // Kandidat → Recruiter (via users-Join) laden
        const { data: candidate, error: candidateError } = await supabase
          .from('candidates')
          .select('anonymous_id, recruiter_id, users!inner(first_name, last_name, email)')
          .eq('id', candidateId)
          .single()

        if (candidateError || !candidate) {
          console.error(
            JSON.stringify({ event: 'candidate_fetch_error', candidateId, error: candidateError?.message }),
          )
          errors++
          continue
        }

        const c = candidate as Record<string, unknown>
        const recruiterUser = c.users as Record<string, unknown>
        const anonymousId = c.anonymous_id as string
        const recruiterEmail = recruiterUser.email as string
        const recruiterFirstName = (recruiterUser.first_name as string) ?? 'Recruiter'

        const isApproval = action === 'candidate.profile.approved'

        const subject = isApproval
          ? `Kandidat ${anonymousId} verifiziert ✓`
          : `Kandidat ${anonymousId}: Dokumente erforderlich`

        const html = isApproval
          ? buildApprovalHtml({ recruiterFirstName, anonymousId })
          : buildRejectionHtml({ recruiterFirstName, anonymousId, feedback })

        const { error: resendError } = await resend.emails.send({
          from: FROM_ADDRESS,
          to: [recruiterEmail],
          subject,
          html,
        })

        if (resendError) {
          console.error(
            JSON.stringify({ event: 'resend_error', candidateId, error: resendError.message }),
          )
          errors++
          continue
        }

        // Idempotenz-Eintrag setzen
        const { error: auditInsertError } = await supabase.from('audit_log').insert({
          action: 'email.verification_result.sent',
          entity_type: 'candidate',
          entity_id: candidateId,
          metadata: {
            recruiter_email: recruiterEmail,
            anonymous_id: anonymousId,
            result: isApproval ? 'approved' : 'rejected',
          },
        })

        if (auditInsertError) {
          console.error(
            JSON.stringify({ event: 'audit_log_error', candidateId, error: auditInsertError.message }),
          )
          // Kein Abbruch — E-Mail wurde bereits gesendet, nur Logging fehlgeschlagen
        }

        notificationsSent++
        console.log(
          JSON.stringify({ event: 'verification_email_sent', candidateId, action, recruiterEmail }),
        )
      } catch (err) {
        console.error(
          JSON.stringify({ event: 'candidate_processing_error', candidateId, error: String(err) }),
        )
        errors++
      }
    }

    const summary = {
      status: 'ok',
      notificationsSent,
      errors,
      durationMs: Date.now() - startTime,
    }

    console.log(JSON.stringify({ event: 'verification_result_complete', ...summary }))

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ event: 'verification_result_fatal', error: message }))
    return new Response(
      JSON.stringify({ error: { code: 'VERIFICATION_RESULT_FAILED', message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})

// ── E-Mail Templates ──────────────────────────────────────────────────────────

function buildApprovalHtml(params: { recruiterFirstName: string; anonymousId: string }): string {
  const { recruiterFirstName, anonymousId } = params
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kandidat verifiziert</title>
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
              <div style="display:inline-block;background:#f0fdf4;border-radius:8px;padding:6px 14px;margin-bottom:20px;">
                <span style="font-size:14px;font-weight:700;color:#16a34a;">✓ Profil verifiziert</span>
              </div>
              <h1 style="font-size:20px;font-weight:700;color:#0f1623;margin:0 0 16px;">
                Kandidat ${anonymousId} ist jetzt aktiv
              </h1>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 16px;">
                Hallo ${recruiterFirstName},
              </p>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 24px;">
                Das Profil Ihres Kandidaten <strong>${anonymousId}</strong> wurde erfolgreich durch unser Admin-Team verifiziert.
                Der Kandidat ist ab sofort im Matching-Pool aktiv und kann mit passenden Stellenangeboten gematcht werden.
              </p>
              <div style="background:#eef4ff;border-radius:10px;padding:20px;margin:0 0 24px;">
                <div style="font-size:13px;font-weight:700;color:#2a5490;margin-bottom:8px;">NÄCHSTE SCHRITTE</div>
                <p style="font-size:14px;color:#4b5675;line-height:1.55;margin:0;">
                  Der Kandidat wird nun automatisch mit passenden Unternehmen gematcht.
                  Sie werden benachrichtigt, sobald ein Unternehmen Interesse signalisiert.
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

function buildRejectionHtml(params: {
  recruiterFirstName: string
  anonymousId: string
  feedback: string
}): string {
  const { recruiterFirstName, anonymousId, feedback } = params
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dokumente erforderlich</title>
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
              <div style="display:inline-block;background:#fef2f2;border-radius:8px;padding:6px 14px;margin-bottom:20px;">
                <span style="font-size:14px;font-weight:700;color:#dc2626;">Dokumente erforderlich</span>
              </div>
              <h1 style="font-size:20px;font-weight:700;color:#0f1623;margin:0 0 16px;">
                Profil ${anonymousId}: Überarbeitung notwendig
              </h1>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 16px;">
                Hallo ${recruiterFirstName},
              </p>
              <p style="font-size:15px;color:#4b5675;line-height:1.6;margin:0 0 24px;">
                Das Profil Ihres Kandidaten <strong>${anonymousId}</strong> konnte noch nicht verifiziert werden.
                Unser Admin-Team hat folgendes Feedback hinterlassen:
              </p>
              <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:16px 20px;margin:0 0 24px;">
                <div style="font-size:13px;font-weight:700;color:#dc2626;margin-bottom:8px;">FEEDBACK DES ADMIN-TEAMS</div>
                <p style="font-size:14px;color:#0f1623;line-height:1.6;margin:0;white-space:pre-wrap;">${feedback}</p>
              </div>
              <div style="background:#eef4ff;border-radius:10px;padding:20px;margin:0 0 24px;">
                <div style="font-size:13px;font-weight:700;color:#2a5490;margin-bottom:8px;">NÄCHSTE SCHRITTE</div>
                <p style="font-size:14px;color:#4b5675;line-height:1.55;margin:0;">
                  Bitte laden Sie die korrigierten oder fehlenden Dokumente für Kandidat ${anonymousId} hoch.
                  Nach erfolgreichem Upload wird das Profil erneut zur Verifizierung eingereicht.
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
