import { Link } from 'react-router-dom'
import { ForgotPasswordForm } from '../features/auth'

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export default function ForgotPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: F,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link
            to="/"
            style={{
              fontFamily: F,
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            phe<em style={{ fontStyle: 'italic', color: C.accent }}>web</em>
          </Link>
          <p style={{ marginTop: 8, fontSize: 15, color: C.muted }}>
            Passwort zurücksetzen
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 36,
            boxShadow: C.shadowLg,
            border: `1px solid ${C.border}`,
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            Passwort vergessen?
          </h1>
          <p
            style={{
              fontSize: 14,
              color: C.muted,
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres
            Passworts.
          </p>

          <ForgotPasswordForm />

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: C.faint }}>
            <Link
              to="/login"
              style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}
            >
              ← Zurück zum Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
