import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
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
}

const inp = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', fontSize: 15,
  fontFamily: F, color: C.text, background: '#f8fafc',
  border: `1.5px solid ${hasErr ? C.error : C.border}`,
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
})

export function ResetPasswordForm() {
  const { resetPassword, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<ResetPasswordFormData>()

  const onSubmit = async (data: ResetPasswordFormData) => {
    const success = await resetPassword(data.newPassword)
    if (success) {
      navigate('/login', { state: { message: 'Passwort erfolgreich geändert. Bitte melden Sie sich an.' } })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <div style={{
          background: C.errorBg, border: `1px solid ${C.errorBd}`,
          borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          fontSize: 13, color: C.error, fontFamily: F, lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="newPassword" style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: C.muted, marginBottom: 6, fontFamily: F,
        }}>
          Neues Passwort
        </label>
        <input
          id="newPassword" type="password" autoComplete="new-password"
          placeholder="Mindestens 8 Zeichen"
          style={inp(!!errors.newPassword)}
          {...register('newPassword', {
            required: 'Bitte geben Sie ein Passwort ein',
            minLength: { value: 8, message: 'Passwort muss mindestens 8 Zeichen haben' },
          })}
        />
        {errors.newPassword && (
          <p style={{ marginTop: 4, fontSize: 12, color: C.error, fontFamily: F }}>
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 28 }}>
        <label htmlFor="confirmPassword" style={{
          display: 'block', fontSize: 13, fontWeight: 600,
          color: C.muted, marginBottom: 6, fontFamily: F,
        }}>
          Passwort bestätigen
        </label>
        <input
          id="confirmPassword" type="password" autoComplete="new-password"
          placeholder="Passwort wiederholen"
          style={inp(!!errors.confirmPassword)}
          {...register('confirmPassword', {
            required: 'Bitte bestätigen Sie Ihr Passwort',
            validate: (val) => val === getValues('newPassword') || 'Passwörter stimmen nicht überein',
          })}
        />
        {errors.confirmPassword && (
          <p style={{ marginTop: 4, fontSize: 12, color: C.error, fontFamily: F }}>
            {errors.confirmPassword.message}
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
        {isLoading ? 'Wird gespeichert…' : 'Passwort ändern'}
      </button>
    </form>
  )
}
