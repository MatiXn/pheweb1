// Email-Templates für Banküberweisung-Bestätigung
// Story 8.2

export function buildBankTransferConfirmedHtml(params: {
  companyName: string
  reference: string
  tier: string
  expiresDate: string
  platformUrl: string
}): string {
  const { companyName, reference, tier, expiresDate, platformUrl } = params

  const tierLabel = tier === 'basis' ? 'Basis' : tier === 'professional' ? 'Professional' : 'Enterprise'

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zahlung bestätigt – Ihr Konto ist aktiv</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a1a2e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #e8b86d; margin: 0; font-size: 24px;">PHE-Perm</h1>
    <p style="color: #ccc; margin: 8px 0 0;">Zahlung bestätigt</p>
  </div>

  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="text-align: center; margin-bottom: 25px;">
      <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 50%; width: 60px; height: 60px; line-height: 60px; margin: 0 auto; font-size: 30px;">✓</div>
    </div>

    <p>Hallo ${companyName},</p>

    <p>wir haben Ihre Zahlung erhalten und bestätigt. Ihr <strong>${tierLabel}-Abonnement</strong> ist jetzt aktiv!</p>

    <div style="background: #f5f5f5; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Abonnement:</td>
          <td style="padding: 8px 0; font-weight: bold;">${tierLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Referenz:</td>
          <td style="padding: 8px 0; font-family: monospace;">${reference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Status:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #28a745;">Aktiv</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Gültig bis:</td>
          <td style="padding: 8px 0; font-weight: bold;">${expiresDate}</td>
        </tr>
      </table>
    </div>

    <p>Sie können jetzt die Plattform vollständig nutzen und Kandidaten einsehen.</p>

    <div style="margin-top: 30px; text-align: center;">
      <a href="${platformUrl}/unternehmen/dashboard" style="background: #1a1a2e; color: #e8b86d; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">
        Zum Dashboard
      </a>
    </div>

    <p style="margin-top: 25px;">Bei Fragen stehen wir Ihnen gerne zur Verfügung:</p>
    <p><a href="mailto:support@phe-perm.de" style="color: #1a1a2e;">support@phe-perm.de</a></p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>PHE-Perm GmbH | support@phe-perm.de</p>
    <p>Diese E-Mail wurde automatisch generiert.</p>
  </div>
</body>
</html>`
}

export function buildBankTransferConfirmedSubject(): string {
  return 'Ihre Zahlung wurde bestätigt — Zugang ist jetzt aktiv'
}
