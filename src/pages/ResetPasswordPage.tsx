import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm'
import { supabase } from '../lib/supabaseClient'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

export default function ResetPasswordPage() {
  const { isLoading } = useAuthContext()
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecoverySession(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isLoading) return null

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
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          {!isRecoverySession ? (
            /* Invalid or expired link */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#fffbeb', border: '2px solid #fcd34d',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 28,
              }}>
                ⚠️
              </div>
              <h1 style={{
                fontSize: 22, fontWeight: 800, color: '#0f172a',
                marginBottom: 10, letterSpacing: '-0.03em', lineHeight: 1.2,
              }}>
                Link ungültig oder abgelaufen
              </h1>
              <p style={{
                fontSize: 14, color: '#475569',
                lineHeight: 1.7, marginBottom: 28,
              }}>
                Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen
                Reset-Link an.
              </p>
              <Link to="/passwort-vergessen" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: '#fff', borderRadius: 12, padding: '12px 28px',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
              }}>
                Neuen Reset-Link anfordern
              </Link>
            </div>
          ) : (
            /* Valid recovery session */
            <>
              <h1 style={{
                fontSize: 24, fontWeight: 800, color: '#0f172a',
                marginBottom: 8, letterSpacing: '-0.03em', lineHeight: 1.2,
              }}>
                Neues Passwort festlegen
              </h1>
              <p style={{
                fontSize: 14, color: '#475569',
                marginBottom: 28, lineHeight: 1.6,
              }}>
                Bitte wählen Sie ein neues Passwort mit mindestens 8 Zeichen.
              </p>
              <ResetPasswordForm />
            </>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{
            fontSize: 13, color: 'rgba(148,163,184,0.6)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>←</span> Zurück zum Login
          </Link>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(148,163,184,0.4)' }}>
          © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
        </p>
      </div>
    </div>
  )
}
