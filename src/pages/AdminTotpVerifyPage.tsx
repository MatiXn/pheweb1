import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAdminMfa } from '../features/auth/hooks/useAdminMfa'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

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

export default function AdminTotpVerifyPage() {
  const navigate = useNavigate()
  const { verifyTotp, isLoading, error } = useAdminMfa()
  const { profile, isLoading: profileLoading } = useCurrentUser()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TotpCodeFormData>()

  const onSubmit = async (data: TotpCodeFormData) => {
    const success = await verifyTotp(data.code)
    if (success) {
      navigate('/dashboard')
    }
  }

  // Wait for profile to load before evaluating role
  if (profileLoading) {
    return null
  }

  // Redirect non-admin users to dashboard
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
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
          <p style={{ marginTop: 8, fontSize: 15, color: C.muted }}>Admin-Authentifizierung</p>
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
            Zwei-Faktor-Authentifizierung
          </h1>
          <p style={{ fontSize: 14, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
            Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
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
                {error}
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
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
                Authentifizierungscode
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: 26,
                  fontFamily: 'monospace',
                  letterSpacing: '0.35em',
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
              {isLoading ? 'Wird geprüft...' : 'Bestätigen'}
            </button>
          </form>
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
