import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:  '#2563eb',
  text:    '#0f172a',
  muted:   '#475569',
  faint:   '#94a3b8',
  border:  '#e2e8f0',
  error:   '#dc2626',
  errorBg: '#fef2f2',
  errorBd: '#fecaca',
}

const inputStyle = (hasError: boolean): React.CSSProperties => ({
  width:        '100%',
  padding:      '11px 14px',
  fontSize:     15,
  fontFamily:   F,
  color:        C.text,
  background:   '#f8fafc',
  border:       `1.5px solid ${hasError ? C.error : C.border}`,
  borderRadius: 10,
  outline:      'none',
  boxSizing:    'border-box',
  transition:   'border-color 0.15s',
})

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { signIn, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    const result = await signIn(data.email, data.password)
    if (result.success && result.redirectTo) {
      navigate(result.redirectTo)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Email field */}
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email" style={{
          display:    'block',
          fontSize:   13,
          fontWeight: 600,
          color:      C.muted,
          marginBottom: 6,
          fontFamily: F,
        }}>
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@firma.de"
          style={inputStyle(!!errors.email)}
          {...register('email', {
            required: 'E-Mail-Adresse ist erforderlich',
            pattern: {
              value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Ungültige E-Mail-Adresse',
            },
          })}
        />
        {errors.email && (
          <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 4, fontFamily: F }}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password field */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <label htmlFor="password" style={{
            fontSize:   13,
            fontWeight: 600,
            color:      C.muted,
            fontFamily: F,
          }}>
            Passwort
          </label>
          <Link to="/passwort-vergessen" style={{
            fontSize:   12,
            color:      C.accent,
            fontWeight: 500,
            fontFamily: F,
          }}>
            Vergessen?
          </Link>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Ihr Passwort"
            style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
            {...register('password', {
              required: 'Passwort ist erforderlich',
            })}
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            style={{
              position:   'absolute',
              right:      12,
              top:        '50%',
              transform:  'translateY(-50%)',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      C.faint,
              fontSize:   14,
              padding:    2,
              fontFamily: F,
            }}
            aria-label={showPw ? 'Passwort verbergen' : 'Passwort anzeigen'}
          >
            {showPw ? '🙈' : '👁'}
          </button>
        </div>
        {errors.password && (
          <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 4, fontFamily: F }}>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* API error */}
      {error && (
        <div
          role="alert"
          style={{
            background:   C.errorBg,
            border:       `1px solid ${C.errorBd}`,
            borderRadius: 10,
            padding:      '10px 14px',
            marginBottom: 16,
            fontSize:     13,
            color:        C.error,
            fontFamily:   F,
            lineHeight:   1.5,
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        style={{
          width:         '100%',
          padding:       '12px 20px',
          background:    isLoading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
          color:         '#fff',
          border:        'none',
          borderRadius:  12,
          fontSize:      15,
          fontWeight:    700,
          fontFamily:    F,
          cursor:        isLoading ? 'not-allowed' : 'pointer',
          letterSpacing: '-0.01em',
          boxShadow:     isLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
          transition:    'all 0.2s',
        }}
      >
        {isLoading ? 'Wird angemeldet…' : 'Anmelden'}
      </button>
    </form>
  )
}
