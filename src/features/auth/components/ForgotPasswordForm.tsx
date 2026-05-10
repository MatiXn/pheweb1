import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'

interface ForgotPasswordFormData {
  email: string
}

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:    '#2563eb',
  text:      '#0f172a',
  muted:     '#475569',
  border:    '#e2e8f0',
  error:     '#dc2626',
  errorBg:   '#fef2f2',
  errorBd:   '#fecaca',
  green:     '#166534',
  greenBg:   '#f0fdf4',
  greenBd:   '#bbf7d0',
}

const inp = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', fontSize: 15,
  fontFamily: F, color: C.text, background: '#f8fafc',
  border: `1.5px solid ${hasErr ? C.error : C.border}`,
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
})

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword(data.email)
    setSubmitted(true) // Always show success — anti-enumeration
  }

  if (submitted) {
    return (
      <div style={{
        background: C.greenBg, border: `1px solid ${C.greenBd}`,
        borderRadius: 12, padding: '16px 20px',
        fontSize: 14, color: C.green, lineHeight: 1.7, fontFamily: F,
      }}>
        Wenn ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze einen Reset-Link.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ marginBottom: 20 }}>
        <label htmlFor="email" style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: C.muted, marginBottom: 6, fontFamily: F,
        }}>
          E-Mail-Adresse
        </label>
        <input
          id="email" type="email" autoComplete="email"
          placeholder="ihre@email.de"
          style={inp(!!errors.email)}
          {...register('email', {
            required: 'Bitte geben Sie Ihre E-Mail-Adresse ein',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: 'Ungültige E-Mail-Adresse' },
          })}
        />
        {errors.email && (
          <p role="alert" style={{ marginTop: 4, fontSize: 12, color: C.error, fontFamily: F }}>
            {errors.email.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={isLoading} style={{
        width: '100%', padding: '12px 20px',
        background: isLoading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: '#fff', border: 'none', borderRadius: 12,
        fontSize: 15, fontWeight: 700, fontFamily: F,
        cursor: isLoading ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        boxShadow: isLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
        transition: 'all 0.2s',
      }}>
        {isLoading ? 'Wird gesendet…' : 'Reset-Link anfordern'}
      </button>
    </form>
  )
}
