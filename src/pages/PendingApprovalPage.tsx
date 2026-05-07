// PendingApprovalPage — 2030 Redesign
// Zeigt Konto-Prüfung oder Gesperrt-Status

import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"

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
      minHeight:       '100vh',
      background:      'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         24,
      fontFamily:      F,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
              phe<span style={{ color: '#3b72b8' }}>web</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius:    20,
          border:          '1px solid #e2e8f0',
          padding:         '48px 40px',
          boxShadow:       '0 4px 40px rgba(15,23,42,0.08)',
          textAlign:       'center',
        }}>
          {/* Status indicator */}
          <div style={{
            width:           72,
            height:          72,
            borderRadius:    '50%',
            backgroundColor: isGesperrt ? '#fef2f2' : '#fefce8',
            border:          `2px solid ${isGesperrt ? '#fecaca' : '#fde68a'}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            margin:          '0 auto 28px',
            fontSize:        28,
          }}>
            {isGesperrt ? '⊘' : '⏳'}
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {isGesperrt ? 'Profil nicht aktiv' : 'Konto wird geprüft'}
          </h1>

          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, marginBottom: 36, maxWidth: 340, margin: '0 auto 36px' }}>
            {isGesperrt
              ? 'Ihr Profil ist derzeit nicht aktiv. Bitte kontaktieren Sie uns unter support@pheweb.de.'
              : 'Ihr Konto wird durch unser Team geprüft. Sie erhalten eine Benachrichtigung per E-Mail, sobald Ihr Zugang freigeschaltet wurde.'}
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            style={{
              backgroundColor: 'transparent',
              color:           '#94a3b8',
              border:          '1px solid #e2e8f0',
              borderRadius:    10,
              padding:         '10px 28px',
              fontSize:        13,
              fontWeight:      600,
              cursor:          'pointer',
              fontFamily:      F,
              transition:      'all 0.15s',
            }}
          >
            Abmelden
          </button>
        </div>
      </div>
    </div>
  )
}
