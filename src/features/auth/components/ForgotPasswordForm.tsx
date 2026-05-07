import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'

interface ForgotPasswordFormData {
  email: string
}

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  green: '#166534',
  greenBg: '#f0fdf4',
  greenBorder: '#bbf7d0',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword(data.email)
    // IMMER Success-State setzen — Anti-Enumeration
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        style={{
          background: C.greenBg,
          border: `1px solid ${C.greenBorder}`,
          borderRadius: 12,
          padding: '20px 24px',
          fontFamily: F,
          fontSize: 14,
          color: C.green,
          lineHeight: 1.7,
        }}
      >
        Wenn ein Konto mit dieser E-Mail-Adresse existiert, erhalten Sie in Kürze eine E-Mail
        mit einem Reset-Link.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ marginBottom: 20 }}>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 6,
            fontFamily: F,
          }}
        >
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: F,
            border: `1.5px solid ${errors.email ? C.red : C.border}`,
            borderRadius: 10,
            outline: 'none',
            boxSizing: 'border-box',
            color: C.text,
          }}
          {...register('email', {
            required: 'Bitte geben Sie Ihre E-Mail-Adresse ein',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: 'Ungültige E-Mail-Adresse' },
          })}
        />
        {errors.email && (
          <p
            style={{
              marginTop: 4,
              fontSize: 12,
              color: C.red,
              fontFamily: F,
            }}
          >
            {errors.email.message}
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
        {isLoading ? 'Wird gesendet...' : 'Reset-Link anfordern'}
      </button>
    </form>
  )
}
