import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

const C = {
  accent: '#3b72b8',
  text: '#0f1623',
  muted: '#4b5675',
  border: 'rgba(15,22,35,0.08)',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

export function ResetPasswordForm() {
  const { resetPassword, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetPasswordFormData>()

  const onSubmit = async (data: ResetPasswordFormData) => {
    const success = await resetPassword(data.newPassword)
    if (success) {
      navigate('/login', { state: { message: 'Passwort erfolgreich geändert. Bitte melden Sie sich an.' } })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <div
          style={{
            background: C.redBg,
            border: `1px solid ${C.redBorder}`,
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: C.red,
            fontFamily: F,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor="newPassword"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 6,
            fontFamily: F,
          }}
        >
          Neues Passwort
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: F,
            border: `1.5px solid ${errors.newPassword ? C.red : C.border}`,
            borderRadius: 10,
            outline: 'none',
            boxSizing: 'border-box',
            color: C.text,
          }}
          {...register('newPassword', {
            required: 'Bitte geben Sie ein Passwort ein',
            minLength: { value: 8, message: 'Passwort muss mindestens 8 Zeichen haben' },
          })}
        />
        {errors.newPassword && (
          <p style={{ marginTop: 4, fontSize: 12, color: C.red, fontFamily: F }}>
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label
          htmlFor="confirmPassword"
          style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 600,
            color: C.muted,
            marginBottom: 6,
            fontFamily: F,
          }}
        >
          Passwort bestätigen
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: F,
            border: `1.5px solid ${errors.confirmPassword ? C.red : C.border}`,
            borderRadius: 10,
            outline: 'none',
            boxSizing: 'border-box',
            color: C.text,
          }}
          {...register('confirmPassword', {
            required: 'Bitte bestätigen Sie Ihr Passwort',
            validate: (val) =>
              val === getValues('newPassword') || 'Passwörter stimmen nicht überein',
          })}
        />
        {errors.confirmPassword && (
          <p style={{ marginTop: 4, fontSize: 12, color: C.red, fontFamily: F }}>
            {errors.confirmPassword.message}
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
        {isLoading ? 'Wird gespeichert...' : 'Passwort ändern'}
      </button>
    </form>
  )
}
