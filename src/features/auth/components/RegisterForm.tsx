import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { RegisterFormData } from '../types'

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  green: '#16a34a',
  greenBg: '#dcfce7',
  greenBd: '#86efac',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const INP_BASE: React.CSSProperties = {
  width: '100%',
  background: '#f5f7fa',
  border: `1.5px solid ${C.border}`,
  borderRadius: 12,
  padding: '13px 16px',
  fontSize: 15,
  color: C.text,
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
}

const INP_ERROR: React.CSSProperties = {
  ...INP_BASE,
  border: `1.5px solid ${C.red}`,
}

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>()
  const { signUp, isLoading, error } = useAuth()
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: RegisterFormData) => {
    setSubmitError(null)
    try {
      const ok = await signUp(data.email, data.password)
      if (ok) setSuccess(true)
    } catch (err) {
      setSubmitError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
    }
  }

  if (success) {
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
        <div
          style={{
            width: '100%',
            maxWidth: 440,
            background: '#fff',
            borderRadius: 20,
            padding: 36,
            boxShadow: C.shadowLg,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: C.greenBg,
              border: `2px solid ${C.greenBd}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 26,
              color: C.green,
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 12 }}>
            Registrierung erfolgreich
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
            Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen eine E-Mail geschickt.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              background: C.accent,
              color: '#fff',
              borderRadius: 12,
              padding: '13px 28px',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Zur Anmeldung
          </Link>
        </div>
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
      <div style={{ width: '100%', maxWidth: 440 }}>
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
            Als Kandidat registrieren
          </p>
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
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: C.text,
              marginBottom: 8,
              letterSpacing: '-0.01em',
            }}
          >
            Konto erstellen
          </h1>
          <p style={{ fontSize: 13, color: C.faint, marginBottom: 24, lineHeight: 1.6 }}>
            Registrieren Sie sich, um Ihr Profil anzulegen.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label
              htmlFor="email"
              style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}
            >
              E-Mail-Adresse *
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ihre@email.de"
              style={errors.email ? INP_ERROR : { ...INP_BASE, marginBottom: 4 }}
              {...register('email', {
                required: 'E-Mail-Adresse ist erforderlich',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                  message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                },
              })}
            />
            {errors.email && (
              <p role="alert" style={{ fontSize: 12, color: C.red, marginBottom: 12, marginTop: 4 }}>
                {errors.email.message}
              </p>
            )}
            {!errors.email && <div style={{ marginBottom: 12 }} />}

            <label
              htmlFor="password"
              style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}
            >
              Passwort *
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
              maxLength={72}
              style={errors.password ? INP_ERROR : { ...INP_BASE, marginBottom: 4 }}
              {...register('password', {
                required: 'Passwort ist erforderlich',
                minLength: {
                  value: 8,
                  message: 'Passwort muss mindestens 8 Zeichen lang sein',
                },
                maxLength: {
                  value: 72,
                  message: 'Passwort darf maximal 72 Zeichen haben.',
                },
              })}
            />
            {errors.password && (
              <p role="alert" style={{ fontSize: 12, color: C.red, marginBottom: 12, marginTop: 4 }}>
                {errors.password.message}
              </p>
            )}
            {!errors.password && <div style={{ marginBottom: 12 }} />}

            {(error || submitError) && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '12px 14px',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>{error ?? submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                marginTop: 8,
                background: C.accent,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 20px',
                fontSize: 15,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: F,
                opacity: isLoading ? 0.75 : 1,
              }}
            >
              {isLoading ? 'Wird registriert...' : 'Konto erstellen'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: C.faint }}>
            Bereits ein Konto?{' '}
            <Link to="/login" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
              Anmelden
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.faint }}>
          <Link to="/" style={{ color: C.faint, textDecoration: 'none' }}>
            ← Zurück zu pheweb.de
          </Link>
        </p>
      </div>
    </div>
  )
}
