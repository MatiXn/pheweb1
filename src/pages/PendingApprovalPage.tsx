// PendingApprovalPage — Konto wird geprüft / Profil nicht aktiv

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const STEPS = [
  { icon: '📝', label: 'Registrierung abgeschlossen' },
  { icon: '🔍', label: 'Prüfung durch unser Team', active: true },
  { icon: '✅', label: 'Freischaltung & Zugang' },
]

export default function PendingApprovalPage() {
  const { profile }  = useCurrentUser()
  const { signOut }  = useAuth()
  const navigate     = useNavigate()
  const isGesperrt   = profile?.profile_status === 'gesperrt'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight:  '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding:    24,
      fontFamily: F,
      position:   'relative',
      overflow:   'hidden',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{
              fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em',
              color: '#f1f5f9', fontFamily: F,
            }}>
              phe<span style={{ color: '#60a5fa' }}>web</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background:   'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          borderRadius: 24,
          border:       '1px solid rgba(255,255,255,0.10)',
          padding:      '48px 40px',
          textAlign:    'center',
          boxShadow:    '0 32px 64px rgba(0,0,0,0.4)',
        }}>

          {/* Status icon */}
          <div style={{
            width:           80,
            height:          80,
            borderRadius:    '50%',
            background:      isGesperrt
              ? 'rgba(239,68,68,0.15)'
              : 'rgba(251,191,36,0.12)',
            border:          `2px solid ${isGesperrt ? 'rgba(239,68,68,0.3)' : 'rgba(251,191,36,0.25)'}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            margin:          '0 auto 28px',
            fontSize:        32,
          }}>
            {isGesperrt ? '🔒' : '⏳'}
          </div>

          <h1 style={{
            fontSize:     24,
            fontWeight:   800,
            color:        '#f1f5f9',
            marginBottom: 12,
            letterSpacing: '-0.03em',
            lineHeight:   1.2,
          }}>
            {isGesperrt ? 'Profil nicht aktiv' : 'Ihr Konto wird geprüft'}
          </h1>

          <p style={{
            fontSize:   15,
            color:      'rgba(148,163,184,0.85)',
            lineHeight: 1.8,
            marginBottom: 36,
            maxWidth:   340,
            margin:     '0 auto 36px',
          }}>
            {isGesperrt
              ? 'Ihr Profil ist derzeit nicht aktiv. Bitte kontaktieren Sie uns.'
              : 'Unser Team prüft Ihre Registrierung. Sie erhalten eine E-Mail-Benachrichtigung, sobald Ihr Konto freigeschaltet wurde.'}
          </p>

          {/* Progress steps — only for pending */}
          {!isGesperrt && (
            <div style={{
              display:   'flex',
              alignItems: 'center',
              marginBottom: 36,
              gap:        0,
            }}>
              {STEPS.map((step, i) => (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{
                      width:          40,
                      height:         40,
                      borderRadius:   '50%',
                      background:     step.active
                        ? 'rgba(59,130,246,0.2)'
                        : i === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      border:         `2px solid ${step.active
                        ? 'rgba(59,130,246,0.5)'
                        : i === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       18,
                      margin:         '0 auto 6px',
                    }}>
                      {step.icon}
                    </div>
                    <div style={{
                      fontSize:   10,
                      color:      step.active ? '#93c5fd' : i === 0 ? '#6ee7b7' : 'rgba(148,163,184,0.5)',
                      fontWeight: step.active ? 600 : 500,
                      lineHeight: 1.4,
                    }}>
                      {step.label}
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{
                      height:     1,
                      flex:       0.4,
                      background: i === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)',
                      flexShrink: 0,
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Info box */}
          <div style={{
            background:   isGesperrt ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)',
            border:       `1px solid ${isGesperrt ? 'rgba(239,68,68,0.2)' : 'rgba(59,130,246,0.2)'}`,
            borderRadius: 12,
            padding:      '14px 18px',
            marginBottom: 32,
            fontSize:     13,
            color:        'rgba(148,163,184,0.85)',
            textAlign:    'left',
            lineHeight:   1.6,
          }}>
            💡{' '}
            {isGesperrt
              ? <>Kontaktieren Sie uns unter{' '}
                  <a href="mailto:support@phe-perm.de" style={{ color: '#60a5fa' }}>
                    support@phe-perm.de
                  </a></>
              : <>Typische Prüfzeit: <strong style={{ color: '#e2e8f0' }}>1–2 Werktage</strong>. Sie erhalten eine E-Mail an die angegebene Adresse.</>
            }
          </div>

          {/* Actions */}
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background:    'rgba(255,255,255,0.06)',
              color:         'rgba(148,163,184,0.8)',
              border:        '1px solid rgba(255,255,255,0.1)',
              borderRadius:  12,
              padding:       '12px 32px',
              fontSize:      14,
              fontWeight:    600,
              cursor:        'pointer',
              fontFamily:    F,
              letterSpacing: '-0.01em',
              width:         '100%',
            }}
          >
            Abmelden
          </button>
        </div>

        <p style={{
          textAlign:  'center',
          marginTop:  24,
          fontSize:   12,
          color:      'rgba(148,163,184,0.4)',
        }}>
          © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
        </p>
      </div>
    </div>
  )
}
