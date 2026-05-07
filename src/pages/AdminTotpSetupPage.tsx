import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabaseClient'
import { useAdminMfa } from '../features/auth/hooks/useAdminMfa'

interface TotpCodeFormData {
  code: string
}

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export default function AdminTotpSetupPage() {
  const navigate = useNavigate()
  const { enrollTotp, verifyEnrollment, isLoading, error } = useAdminMfa()

  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [setupError, setSetupError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TotpCodeFormData>()

  useEffect(() => {
    const checkAndEnroll = async () => {
      // Wenn bereits verifizierter Faktor → zur Verify-Seite
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified')
      if (verifiedFactor) {
        setPageLoading(false)
        navigate('/admin/totp-verify')
        return
      }

      // Neuen TOTP-Faktor enrollen
      try {
        const result = await enrollTotp()
        if (result) {
          setFactorId(result.factorId)
          setQrCode(result.qrCode)
          setSecret(result.secret)
        }
      } catch (err) {
        setSetupError('MFA-Einrichtung fehlgeschlagen. Bitte Seite neu laden.')
        setPageLoading(false)
        return
      }
      setPageLoading(false)
    }

    checkAndEnroll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = async (data: TotpCodeFormData) => {
    if (!factorId) return
    const success = await verifyEnrollment(factorId, data.code)
    if (success) {
      navigate('/dashboard')
    }
  }

  if (pageLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f5f7fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: F,
          color: C.muted,
        }}
      >
        TOTP wird eingerichtet...
      </div>
    )
  }

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
      <div style={{ width: '100%', maxWidth: 480 }}>
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
          <p style={{ marginTop: 8, fontSize: 15, color: C.muted }}>Admin-Sicherheit</p>
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
            Zwei-Faktor-Authentifizierung einrichten
          </h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
            Scannen Sie den QR-Code mit Ihrer Authenticator-App (z.B. Google Authenticator, Authy)
            und geben Sie den 6-stelligen Code zur Bestätigung ein.
          </p>

          {/* QR-Code */}
          {qrCode && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img
                src={qrCode}
                alt="TOTP QR-Code"
                style={{
                  width: 180,
                  height: 180,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 8,
                  background: '#fff',
                }}
              />
            </div>
          )}

          {/* Secret als Fallback */}
          {secret && (
            <div
              style={{
                background: '#f8f9fb',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 12,
                color: C.muted,
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                textAlign: 'center',
              }}
            >
              <span style={{ display: 'block', fontSize: 11, marginBottom: 4, fontFamily: F }}>
                Manueller Schlüssel (falls QR-Code nicht funktioniert):
              </span>
              {secret}
            </div>
          )}

          {/* Code-Eingabe */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {(error || setupError) && (
              <div
                style={{
                  background: C.redBg,
                  border: `1px solid ${C.redBorder}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: C.red,
                  fontFamily: F,
                }}
              >
                {setupError ?? error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="code"
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.muted,
                  marginBottom: 6,
                  fontFamily: F,
                }}
              >
                6-stelliger Bestätigungscode
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 22,
                  fontFamily: 'monospace',
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  border: `1.5px solid ${errors.code ? C.red : C.border}`,
                  borderRadius: 10,
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: C.text,
                }}
                {...register('code', {
                  required: 'Bitte geben Sie den Authentifizierungscode ein',
                  pattern: { value: /^\d{6}$/, message: 'Der Code muss genau 6 Ziffern haben' },
                })}
              />
              {errors.code && (
                <p style={{ marginTop: 4, fontSize: 12, color: C.red, fontFamily: F }}>
                  {errors.code.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: isLoading ? '#93b3d8' : C.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                fontFamily: F,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              {isLoading ? 'Wird verifiziert...' : 'TOTP aktivieren'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
