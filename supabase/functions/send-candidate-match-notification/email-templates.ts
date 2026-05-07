// email-templates.ts — Deutsche E-Mail-Vorlagen für Kandidaten-Match-Benachrichtigungen (via Recruiter)
// Story 5.3: Recruiter-Benachrichtigung wenn ein verwalteter Kandidat gematcht wurde

export interface CandidateMatchEmailData {
  recruiterFirstName: string    // Recruiter-Vorname für Anrede
  candidateAnonymousId: string  // candidates.anonymous_id (anonyme Referenz)
  jobTitle: string              // jobs.title — anonymisierter Stellentitel
  locationCity: string | null   // jobs.location_city — Standort der Stelle
  salaryMin: number | null      // jobs.salary_min — Gehaltsspanne
  salaryMax: number | null      // jobs.salary_max — Gehaltsspanne
  salaryCurrency: string        // 'EUR'
  candidateId: string           // UUID für CTA-Link
  platformUrl: string           // Basis-URL der Plattform
}

export function buildCandidateMatchSubject(data: Pick<CandidateMatchEmailData, 'recruiterFirstName' | 'jobTitle'>): string {
  const { jobTitle } = data
  return `[PHE-Perm] Neuer Match für Ihren Kandidaten — „${jobTitle}"`
}

export function buildCandidateMatchHtml(data: CandidateMatchEmailData): string {
  const {
    recruiterFirstName,
    candidateAnonymousId,
    jobTitle,
    locationCity,
    salaryMin,
    salaryMax,
    salaryCurrency,
    candidateId,
    platformUrl,
  } = data

  const dashboardUrl = `${platformUrl}/dashboard/candidates/${candidateId}/matches`

  const salaryText = salaryMin && salaryMax
    ? `${salaryMin.toLocaleString('de-DE')} – ${salaryMax.toLocaleString('de-DE')} ${salaryCurrency}/Jahr`
    : salaryMin
      ? `ab ${salaryMin.toLocaleString('de-DE')} ${salaryCurrency}/Jahr`
      : 'Auf Anfrage'

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neuer Kandidaten-Match</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background-color: #1a1a2e; padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }
    .header p { color: #a0a8c8; margin: 8px 0 0; font-size: 14px; }
    .body { padding: 40px; color: #333333; line-height: 1.6; }
    .match-box { background: #f0f4ff; border-left: 4px solid #4f6ef7; padding: 20px 24px; border-radius: 4px; margin: 24px 0; }
    .match-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
    .match-box .value { font-size: 16px; font-weight: 600; color: #1a1a2e; margin-bottom: 12px; }
    .match-box .value:last-child { margin-bottom: 0; }
    .ref-tag { display: inline-block; background: #e8edf8; color: #4f6ef7; padding: 4px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .cta-button { display: inline-block; background-color: #4f6ef7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 24px 40px; background: #f9f9f9; border-top: 1px solid #eee; font-size: 13px; color: #888; }
    .anonymized-notice { background: #fff8e1; border-left: 3px solid #ffc107; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #6d5c00; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PHE-Perm Recruiting</h1>
      <p>Neuer Match für Ihren Kandidaten</p>
    </div>
    <div class="body">
      <p>Guten Tag ${escapeHtml(recruiterFirstName)},</p>
      <p>
        für einen Ihrer Kandidaten wurde eine neue passende Stelle identifiziert.
        Bitte nehmen Sie Kontakt mit dem Kandidaten auf und informieren Sie ihn über diese Möglichkeit.
      </p>

      <span class="ref-tag">Kandidat-Ref: ${escapeHtml(candidateAnonymousId)}</span>

      <div class="match-box">
        <div class="label">Position</div>
        <div class="value">${escapeHtml(jobTitle)}</div>
        ${locationCity ? `
        <div class="label">Standort</div>
        <div class="value">${escapeHtml(locationCity)}</div>
        ` : ''}
        <div class="label">Gehalt</div>
        <div class="value">${escapeHtml(salaryText)}</div>
      </div>

      <p>
        Alle Details und den Match-Score finden Sie in Ihrem Recruiter-Dashboard.
      </p>

      <a href="${dashboardUrl}" class="cta-button">Match ansehen</a>

      <div class="anonymized-notice">
        ⚠️ <strong>Anonymisierungshinweis:</strong> Der Unternehmensname wird aus Datenschutzgründen
        erst nach gegenseitigem Interesse freigegeben. Bitte geben Sie keine Unternehmensdaten
        an den Kandidaten weiter.
      </div>

      <p style="margin-top: 24px; font-size: 14px; color: #666;">
        Haben Sie Fragen? Kontaktieren Sie uns unter
        <a href="mailto:team@phe-perm.de">team@phe-perm.de</a>.
      </p>
    </div>
    <div class="footer">
      <p>PHE-Perm GmbH &bull; Diese E-Mail wurde automatisch generiert.</p>
      <p>Sie erhalten diese E-Mail als verwaltender Recruiter für den oben genannten Kandidaten.</p>
    </div>
  </div>
</body>
</html>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
