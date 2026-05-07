import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDsgvoConsent } from '../hooks/useDsgvoConsent'

// Inline-Styles Pattern: C-Objekt + F-Font (Story 3.3 Konvention)
const C = {
  accent: '#3b72b8',
  accentHover: '#2d5a9e',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
  green: '#16a34a',
  greenBg: '#f0fdf4',
  greenBorder: '#bbf7d0',
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',
  infoText: '#1e40af',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// Einwilligungstext gemäß AC1 (Story 3.4)
const CONSENT_TEXT =
  'Ich stimme zu, dass mein anonymisiertes Profil qualifizierten Unternehmen auf der Plattform angezeigt wird. Ich kann diese Einwilligung jederzeit widerrufen.'

export function DsgvoConsentPage() {
  const { giveConsent, isLoading, error } = useDsgvoConsent()
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!checked) return
    const ok = await giveConsent()
    if (ok) {
      // Force full page reload so useCurrentUser refetches the updated profile.
      // navigate() alone would leave stale dsgvo_consent_at=null in cache → redirect loop.
      window.location.href = '/dashboard'
    }
  }

  return (
    <div
      style={{
        fontFamily: F,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8faff 0%, #eef3fb 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 16px 60px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 22,
            color: C.accent,
            letterSpacing: '-0.5px',
            marginBottom: 6,
          }}
        >
          pheweb
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: C.text,
            margin: 0,
            letterSpacing: '-0.5px',
          }}
        >
          Profil aktivieren
        </h1>
        <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>
          Ein letzter Schritt — Ihre Einwilligung zur Profilveröffentlichung
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: C.shadowLg,
          padding: '32px 28px',
          width: '100%',
          maxWidth: 560,
        }}
      >
        {/* Info-Banner */}
        <div
          style={{
            background: C.infoBg,
            border: `1px solid ${C.infoBorder}`,
            borderRadius: 10,
            padding: '14px 16px',
            marginBottom: 24,
            fontSize: 14,
            color: C.infoText,
            lineHeight: 1.5,
          }}
        >
          <strong>Ihr Profil ist fast fertig.</strong> Damit Unternehmen Ihr anonymisiertes Profil
          sehen und Sie kontaktieren können, benötigen wir Ihre ausdrückliche Einwilligung.
        </div>

        {/* Einwilligungstext-Box */}
        <div
          style={{
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: '16px 18px',
            marginBottom: 20,
            background: '#fafbfd',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Einwilligungserklärung
          </p>
          <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>{CONSENT_TEXT}</p>
        </div>

        {/* Checkbox — aktive Handlung (AC1: kein Pre-Check) */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            marginBottom: 24,
            padding: '14px 16px',
            borderRadius: 10,
            border: `2px solid ${checked ? C.accent : C.border}`,
            background: checked ? '#eff5fd' : '#fafbfd',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            style={{
              width: 18,
              height: 18,
              flexShrink: 0,
              marginTop: 2,
              accentColor: C.accent,
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
            Ich stimme der obigen Einwilligungserklärung zu und möchte mein Profil aktivieren.
          </span>
        </label>

        {/* Fehler */}
        {error && (
          <div
            style={{
              background: C.redBg,
              border: `1px solid ${C.redBorder}`,
              borderRadius: 10,
              padding: '12px 16px',
              color: C.red,
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {/* Primärer Button: disabled bis Checkbox aktiv (AC1) */}
        <button
          onClick={handleSubmit}
          disabled={!checked || isLoading}
          style={{
            width: '100%',
            padding: '14px 20px',
            borderRadius: 10,
            border: 'none',
            background: !checked || isLoading ? '#e2e8f0' : C.accent,
            color: !checked || isLoading ? C.faint : '#fff',
            fontFamily: F,
            fontSize: 15,
            fontWeight: 700,
            cursor: !checked || isLoading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s ease',
            marginBottom: 12,
          }}
        >
          {isLoading ? 'Wird gespeichert…' : 'Zustimmung erteilen'}
        </button>

        {/* Sekundäre Aktion: Später entscheiden (AC3 — kein Consent = entwurf, Plattform weiter nutzbar) */}
        <button
          onClick={() => navigate('/kandidat/onboarding')}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: 'transparent',
            color: C.faint,
            fontFamily: F,
            fontSize: 14,
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Später entscheiden
        </button>

        <p style={{ fontSize: 12, color: C.faint, textAlign: 'center', marginTop: 16 }}>
          Ihr Profil bleibt im Entwurf-Status, bis Sie einwilligen. Sie können jederzeit
          zurückkehren.
        </p>
      </div>
    </div>
  )
}
