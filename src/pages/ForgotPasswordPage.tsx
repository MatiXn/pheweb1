import { Link } from 'react-router-dom'
import { ForgotPasswordForm } from '../features/auth'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

export default function ForgotPasswordPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#f1f5f9', fontFamily: F,
            }}>
              phe<span style={{ color: '#60a5fa' }}>web</span>
            </span>
          </Link>
          <p style={{
            marginTop: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)',
            fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Passwort zurücksetzen
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <h1 style={{
            fontSize: 24, fontWeight: 800, color: '#0f172a',
            marginBottom: 8, letterSpacing: '-0.03em', lineHeight: 1.2,
          }}>
            Passwort vergessen?
          </h1>
          <p style={{
            fontSize: 14, color: '#475569',
            marginBottom: 28, lineHeight: 1.6,
          }}>
            Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link
            zum Zurücksetzen Ihres Passworts.
          </p>

          <ForgotPasswordForm />

          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center', fontSize: 13,
          }}>
            <Link to="/login" style={{
              color: '#2563eb', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 14 }}>←</span> Zurück zum Login
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(148,163,184,0.4)' }}>
          © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
        </p>
      </div>
    </div>
  )
}
