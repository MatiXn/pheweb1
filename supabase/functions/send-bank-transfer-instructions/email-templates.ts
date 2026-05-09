// Email-Templates für Banküberweisung-Anweisungen
// Story 8.2

export function buildBankTransferInstructionsHtml(params: {
  companyName: string
  reference: string
  tier: string
  amountEur: number
  iban: string
  bic: string
  accountHolder: string
  deadlineDate: string
  platformUrl: string
}): string {
  const { companyName, reference, tier, amountEur, iban, bic, accountHolder, deadlineDate, platformUrl } = params

  const tierLabel = tier === 'basis' ? 'Basis' : tier === 'professional' ? 'Professional' : 'Enterprise'

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banküberweisung – Zahlungsdetails</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #1a1a2e; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #e8b86d; margin: 0; font-size: 24px;">PHE-Perm</h1>
    <p style="color: #ccc; margin: 8px 0 0;">Zahlungsanweisungen für Banküberweisung</p>
  </div>

  <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p>Hallo ${companyName},</p>

    <p>vielen Dank für Ihre Anfrage zur Aktivierung des <strong>${tierLabel}-Abonnements</strong> per Banküberweisung.</p>

    <p>Bitte überweisen Sie den folgenden Betrag auf unser Konto:</p>

    <div style="background: #f5f5f5; border-left: 4px solid #e8b86d; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 40%;">Empfänger:</td>
          <td style="padding: 8px 0; font-weight: bold;">${accountHolder}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">IBAN:</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 16px;">${iban}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">BIC:</td>
          <td style="padding: 8px 0; font-weight: bold;">${bic}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Betrag:</td>
          <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #1a1a2e;">${amountEur.toFixed(2)} €</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Verwendungszweck:</td>
          <td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 16px; color: #c0392b;">${reference}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Zahlungsfrist:</td>
          <td style="padding: 8px 0; font-weight: bold;">${deadlineDate}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <strong>Wichtig:</strong> Bitte geben Sie den Verwendungszweck <strong>${reference}</strong> exakt an,
      damit wir Ihre Zahlung korrekt zuordnen können.
    </div>

    <p>Nach Eingang Ihrer Zahlung werden wir Ihr Konto innerhalb von 1-2 Werktagen freischalten.
    Sie erhalten dann eine Bestätigungs-E-Mail mit Ihren Zugangsdaten.</p>

    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung:</p>
    <p><a href="mailto:support@phe-perm.de" style="color: #1a1a2e;">support@phe-perm.de</a></p>

    <div style="margin-top: 30px; text-align: center;">
      <a href="${platformUrl}" style="background: #1a1a2e; color: #e8b86d; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
        Zur Plattform
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>PHE-Perm GmbH | support@phe-perm.de</p>
    <p>Diese E-Mail wurde automatisch generiert.</p>
  </div>
</body>
</html>`
}

export function buildBankTransferInstructionsSubject(reference: string): string {
  return `Banküberweisung – Ihre Zahlungsdetails [${reference}]`
}
