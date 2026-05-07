// email-templates.ts — Deutsche E-Mail-Vorlagen für Match-Benachrichtigungen
// Story 5.2: Unternehmen-Benachrichtigung bei neuen Kandidaten-Matches

export interface MatchNotificationData {
  firstName: string       // Anrede für Nutzer
  matchCount: number      // Anzahl neuer Matches
  jobTitle: string        // Stellenbezeichnung
  jobId: string           // UUID für CTA-Link
  platformUrl: string     // Basis-URL der Plattform
}

export function buildMatchNotificationSubject(data: MatchNotificationData): string {
  const { matchCount, jobTitle } = data
  const kandidaten = matchCount === 1 ? 'Kandidat' : 'Kandidaten'
  return `[PHE-Perm] ${matchCount} neue${matchCount === 1 ? 'r' : ''} ${kandidaten} für „${jobTitle}"`
}

export function buildMatchNotificationHtml(data: MatchNotificationData): string {
  const { firstName, matchCount, jobTitle, jobId, platformUrl } = data
  const kandidaten = matchCount === 1 ? 'Kandidat wurde' : 'Kandidaten wurden'
  const dashboardUrl = `${platformUrl}/dashboard/jobs/${jobId}/matches`

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neue Kandidaten-Matches</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background-color: #1a1a2e; padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; }
    .body { padding: 40px; color: #333333; line-height: 1.6; }
    .highlight { background: #f0f4ff; border-left: 4px solid #4f6ef7; padding: 16px 20px; border-radius: 4px; margin: 24px 0; }
    .highlight .count { font-size: 32px; font-weight: 700; color: #4f6ef7; }
    .highlight .label { font-size: 14px; color: #666; margin-top: 4px; }
    .cta-button { display: inline-block; background-color: #4f6ef7; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-size: 16px; font-weight: 600; margin: 24px 0; }
    .footer { padding: 24px 40px; background: #f9f9f9; border-top: 1px solid #eee; font-size: 13px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PHE-Perm Recruiting</h1>
    </div>
    <div class="body">
      <p>Guten Tag ${escapeHtml(firstName)},</p>
      <p>
        für Ihre Stelle <strong>„${escapeHtml(jobTitle)}"</strong>
        ${matchCount === 1 ? 'ist ein neuer passender' : 'sind neue passende'}
        ${kandidaten} identifiziert.
      </p>
      <div class="highlight">
        <div class="count">${matchCount}</div>
        <div class="label">${matchCount === 1 ? 'neuer Kandidat' : 'neue Kandidaten'} verfügbar</div>
      </div>
      <p>
        Besuchen Sie Ihr Dashboard, um die Kandidaten-Profile einzusehen und zu bewerten.
        Die Kandidaten sind aus Datenschutzgründen anonymisiert — Kontaktdaten werden
        erst nach gegenseitigem Interesse freigegeben.
      </p>
      <a href="${dashboardUrl}" class="cta-button">Kandidaten ansehen</a>
      <p style="margin-top: 32px; font-size: 14px; color: #666;">
        Haben Sie Fragen? Antworten Sie einfach auf diese E-Mail oder kontaktieren
        Sie unser Team direkt.
      </p>
    </div>
    <div class="footer">
      <p>PHE-Perm GmbH &bull; Diese E-Mail wurde automatisch generiert.</p>
      <p>Sie erhalten diese E-Mail, weil Sie als Kontaktperson für Ihr Unternehmen registriert sind.</p>
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
