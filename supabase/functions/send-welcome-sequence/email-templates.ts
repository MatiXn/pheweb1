// Story 5.5: E-Mail-Templates für Welcome-Sequenz nach Unternehmens-Aktivierung

export interface WelcomeEmailData {
  firstName: string    // users.first_name für Anrede
  companyName: string  // companies.name für Personalisierung
  platformUrl: string  // Basis-URL der Plattform
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function buildWelcomeSubject(
  data: Pick<WelcomeEmailData, 'firstName' | 'companyName'>,
): string {
  return `[PHE-Perm] Willkommen — Ihr Konto ist aktiviert, ${data.companyName}!`
}

export function buildWelcomeHtml(data: WelcomeEmailData): string {
  const firstName = escapeHtml(data.firstName)
  const companyName = escapeHtml(data.companyName)
  const ctaUrl = `${data.platformUrl}/dashboard/vacancies/new`

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Willkommen bei PHE-Perm</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;">
              <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">PHE-Perm</p>
              <p style="margin:4px 0 0;color:#a0a0c0;font-size:13px;">Fachkräfte-Vermittlung</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;color:#1a1a2e;font-size:24px;font-weight:bold;">
                Herzlich willkommen, ${firstName}!
              </h1>
              <p style="margin:0 0 24px;color:#333333;font-size:15px;line-height:1.6;">
                Ihr Unternehmenskonto für <strong>${companyName}</strong> wurde erfolgreich freigeschaltet.
                Sie können jetzt sofort mit der Suche nach qualifizierten Fachkräften beginnen.
              </p>

              <!-- 3-Schritt-Erklärung -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9ff;border-radius:8px;padding:24px;margin-bottom:32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 16px;color:#1a1a2e;font-size:15px;font-weight:bold;">
                      So funktioniert PHE-Perm:
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;">
                                <span style="display:inline-block;width:24px;height:24px;background-color:#1a1a2e;border-radius:50%;color:#ffffff;font-size:12px;font-weight:bold;text-align:center;line-height:24px;">1</span>
                              </td>
                              <td style="padding-left:12px;color:#333333;font-size:14px;line-height:1.5;">
                                <strong>Stelle anlegen</strong> — Beschreiben Sie die gesuchte Position und gewünschte Skills
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;">
                                <span style="display:inline-block;width:24px;height:24px;background-color:#1a1a2e;border-radius:50%;color:#ffffff;font-size:12px;font-weight:bold;text-align:center;line-height:24px;">2</span>
                              </td>
                              <td style="padding-left:12px;color:#333333;font-size:14px;line-height:1.5;">
                                <strong>Algorithmus matcht</strong> — Unser System analysiert Kandidaten-Profile und findet passende Fachkräfte
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:32px;vertical-align:top;">
                                <span style="display:inline-block;width:24px;height:24px;background-color:#1a1a2e;border-radius:50%;color:#ffffff;font-size:12px;font-weight:bold;text-align:center;line-height:24px;">3</span>
                              </td>
                              <td style="padding-left:12px;color:#333333;font-size:14px;line-height:1.5;">
                                <strong>E-Mail-Benachrichtigung</strong> — Sie erhalten sofort eine E-Mail sobald neue Matches vorliegen
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}"
                       style="display:inline-block;background-color:#1a1a2e;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:6px;">
                      Erste Stelle anlegen →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Kontakt -->
              <p style="margin:0;color:#666666;font-size:14px;line-height:1.6;">
                Bei Fragen steht Ihnen unser Team gerne zur Verfügung:<br/>
                <a href="mailto:team@phe-perm.de" style="color:#1a1a2e;">team@phe-perm.de</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0;padding:20px 40px;">
              <p style="margin:0;color:#999999;font-size:12px;line-height:1.5;">
                PHE-Perm GmbH · Fachkräfte-Vermittlung für Elektro, TGA, SHK &amp; Mechatronik<br/>
                Diese E-Mail wurde automatisch versandt. Bitte antworten Sie nicht direkt auf diese Nachricht.
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
