import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface RecruiterRegisterFormData {
  fullName: string
  email: string
  password: string
  nutzungsvereinbarung: boolean
}

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:   '#2563eb',
  text:     '#0f172a',
  muted:    '#475569',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  error:    '#dc2626',
  errorBg:  '#fef2f2',
  errorBd:  '#fecaca',
  green:    '#16a34a',
  greenBg:  '#f0fdf4',
  greenBd:  '#86efac',
}

const inp = (hasErr: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px', fontSize: 15,
  fontFamily: F, color: C.text, background: '#f8fafc',
  border: `1.5px solid ${hasErr ? C.error : C.border}`,
  borderRadius: 10, outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
})

export function RecruiterRegisterForm() {
  const { signUpRecruiter, isLoading, error } = useAuth()
  const [isSuccess, setIsSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RecruiterRegisterFormData>()

  const onSubmit = async (data: RecruiterRegisterFormData) => {
    const success = await signUpRecruiter(data.email, data.password, data.fullName)
    if (success) setIsSuccess(true)
  }

  const PageShell = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#f1f5f9', fontFamily: F,
            }}>
              phe<span style={{ color: '#60a5fa' }}>web</span>
            </span>
          </Link>
          <p style={{ marginTop: 6, fontSize: 12, color: 'rgba(148,163,184,0.7)',
            fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Als Recruiter registrieren
          </p>
        </div>

        {children}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(148,163,184,0.4)' }}>
          © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
        </p>
      </div>
    </div>
  )

  if (isSuccess) {
    return (
      <PageShell>
        <div style={{
          background: '#ffffff', borderRadius: 24,
          padding: '40px 36px', textAlign: 'center',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: C.greenBg, border: `2px solid ${C.greenBd}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: 28, color: C.green,
          }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 10, letterSpacing: '-0.03em' }}>
            Registrierung erfolgreich!
          </h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
            Ihr Recruiter-Konto wurde erstellt. Sie können sich jetzt anmelden.
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: '#fff', borderRadius: 12, padding: '13px 32px',
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
          }}>
            Zur Anmeldung
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div style={{
        background: '#ffffff', borderRadius: 24,
        padding: '40px 36px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.9)',
      }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: C.text,
          marginBottom: 6, letterSpacing: '-0.03em', lineHeight: 1.2,
        }}>
          Recruiter-Konto erstellen
        </h1>
        <p style={{ fontSize: 14, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
          Starten Sie kostenlos und bringen Sie Ihre Kandidaten auf die Plattform.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Full name */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="fullName" style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: C.muted, marginBottom: 6, fontFamily: F,
            }}>Vollständiger Name</label>
            <input
              id="fullName" type="text" autoComplete="name"
              placeholder="Max Mustermann"
              style={inp(!!errors.fullName)}
              {...register('fullName', {
                required: 'Bitte geben Sie Ihren Namen ein',
                validate: (v) => v.trim().length > 0 || 'Bitte geben Sie Ihren Namen ein.',
              })}
            />
            {errors.fullName && (
              <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 4, fontFamily: F }}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email" style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: C.muted, marginBottom: 6, fontFamily: F,
            }}>E-Mail-Adresse</label>
            <input
              id="email" type="email" autoComplete="email"
              placeholder="ihre@email.de"
              style={inp(!!errors.email)}
              {...register('email', {
                required: 'Bitte geben Sie Ihre E-Mail-Adresse ein',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
                },
              })}
            />
            {errors.email && (
              <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 4, fontFamily: F }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{
              display: 'block', fontSize: 13, fontWeight: 600,
              color: C.muted, marginBottom: 6, fontFamily: F,
            }}>Passwort</label>
            <input
              id="password" type="password" autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
              style={inp(!!errors.password)}
              {...register('password', {
                required: 'Bitte geben Sie ein Passwort ein',
                minLength: { value: 8, message: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
              })}
            />
            {errors.password && (
              <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 4, fontFamily: F }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Consent */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                style={{
                  width: 16, height: 16, marginTop: 2, flexShrink: 0,
                  accentColor: C.accent, cursor: 'pointer',
                }}
                {...register('nutzungsvereinbarung', {
                  validate: (v) => v === true || 'Bitte stimmen Sie den Bedingungen zu.',
                })}
              />
              <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
                Ich akzeptiere die Nutzungsvereinbarung und bestätige, dass ich für alle von mir
                hochgeladenen Kandidaten eine gültige DSGVO-Einwilligung eingeholt habe.
              </span>
            </label>
            {errors.nutzungsvereinbarung && (
              <p role="alert" style={{ fontSize: 12, color: C.error, marginTop: 6, fontFamily: F }}>
                {errors.nutzungsvereinbarung.message}
              </p>
            )}
          </div>

          {/* API error */}
          {error && (
            <div role="alert" style={{
              background: C.errorBg, border: `1px solid ${C.errorBd}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: C.error, fontFamily: F, lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

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
            {isLoading ? 'Wird registriert…' : 'Als Recruiter registrieren'}
          </button>
        </form>

        <div style={{
          marginTop: 24, paddingTop: 20,
          borderTop: '1px solid #f1f5f9',
          textAlign: 'center', fontSize: 13, color: C.faint, lineHeight: 1.6,
        }}>
          Bereits ein Konto?{' '}
          <Link to="/login" style={{ color: C.accent, fontWeight: 600 }}>
            Anmelden
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
