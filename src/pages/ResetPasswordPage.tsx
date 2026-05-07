import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { ResetPasswordForm } from '../features/auth/components/ResetPasswordForm'
import { supabase } from '../lib/supabaseClient'

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  orange: '#d97706',
  orangeBg: '#fffbeb',
  orangeBd: '#fcd34d',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export default function ResetPasswordPage() {
  const { user, isLoading } = useAuthContext()
  // Only allow access during PASSWORD_RECOVERY event
  const [isRecoverySession, setIsRecoverySession] = useState(false)

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Avoid flash of error/redirect content while auth state is loading
  if (isLoading) return null

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
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 36,
            boxShadow: C.shadowLg,
            border: `1px solid ${C.border}`,
          }}
        >
          {!isRecoverySession ? (
            /* Kein gültiger Recovery-Token — AC #3 */
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: C.orangeBg,
                  border: `2px solid ${C.orangeBd}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: 28,
                }}
              >
                ⚠️
              </div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 12,
                  letterSpacing: '-0.01em',
                }}
              >
                Link ungültig oder abgelaufen
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: C.muted,
                  lineHeight: 1.7,
                  marginBottom: 28,
                }}
              >
                Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen
                Reset-Link an.
              </p>
              <Link
                to="/passwort-vergessen"
                style={{
                  display: 'inline-block',
                  background: C.accent,
                  color: '#fff',
                  borderRadius: 12,
                  padding: '12px 28px',
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontFamily: F,
                }}
              >
                Neuen Reset-Link anfordern
              </Link>
            </div>
          ) : (
            /* Gültige Session — Passwort-Reset-Formular anzeigen — AC #2 */
            <>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}
              >
                Neues Passwort festlegen
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: C.muted,
                  marginBottom: 24,
                  lineHeight: 1.6,
                }}
              >
                Bitte wählen Sie ein neues Passwort mit mindestens 8 Zeichen.
              </p>
              <ResetPasswordForm />
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.faint }}>
          <Link to="/login" style={{ color: C.faint, textDecoration: 'none' }}>
            ← Zurück zum Login
          </Link>
        </p>
      </div>
    </div>
  )
}
