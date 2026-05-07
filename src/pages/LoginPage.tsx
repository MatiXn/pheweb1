import { Link } from 'react-router-dom'
import { LoginForm } from '../features/auth/components/LoginForm'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:   '#3b72b8',
  accentDk: '#2558a0',
  accentBg: '#eef4ff',
  text:     '#111827',
  muted:    '#6b7280',
  faint:    '#9ca3af',
  border:   '#e5e7eb',
}

const FEATURES = [
  { icon: '⚡', title: 'Automatisches Matching', desc: 'KI-gestützte Kandidaten-Empfehlungen für Ihre offenen Stellen.' },
  { icon: '🔒', title: 'DSGVO-konform', desc: 'Vollständig anonymisierte Profile bis zur beidseitigen Zustimmung.' },
  { icon: '📊', title: 'Score-basiert', desc: 'Transparente Match-Scores für schnellere Entscheidungen.' },
]

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: F }}>

      {/* Left panel — branding */}
      <div style={{
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'center',
        padding:         '60px 56px',
        width:           '46%',
        background:      'linear-gradient(145deg, #1a3a5c 0%, #2558a0 60%, #3b72b8 100%)',
        color:           '#fff',
        flexShrink:      0,
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em' }}>
            phe<span style={{ color: '#93c5fd' }}>web</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 500 }}>
            Fachkräfte-Vermittlungsplattform
          </div>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:     'clamp(26px,3vw,36px)',
          fontWeight:   700,
          lineHeight:   1.2,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}>
          Die smarte Art,<br />Fachkräfte zu finden.
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 48, maxWidth: 360 }}>
          Elektro, TGA, SHK, Mechatronik — verbinden Sie sich mit qualifizierten Kandidaten über unsere datenschutzkonforme Matching-Plattform.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width:           40,
                height:          40,
                borderRadius:    10,
                background:      'rgba(255,255,255,0.12)',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        20,
                flexShrink:      0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '60px 48px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize:     26,
              fontWeight:   700,
              color:        C.text,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}>
              Willkommen zurück
            </h2>
            <p style={{ fontSize: 14, color: C.muted }}>
              Melden Sie sich in Ihrem Konto an.
            </p>
          </div>

          {/* Form card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius:     16,
            border:           `1px solid ${C.border}`,
            padding:          '32px 28px',
            boxShadow:        '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <LoginForm />

            <div style={{
              marginTop:   24,
              paddingTop:  20,
              borderTop:   `1px solid ${C.border}`,
              textAlign:   'center',
              fontSize:    13,
              color:       C.faint,
            }}>
              Noch kein Konto?{' '}
              <Link to="/registrieren/kandidat" style={{ color: C.accent, fontWeight: 600, textDecoration: 'none' }}>
                Jetzt registrieren
              </Link>
            </div>
          </div>

          {/* Registration links */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: C.faint }}>
            <Link to="/registrieren/unternehmen" style={{ color: C.faint, textDecoration: 'none' }}>
              Als Unternehmen →
            </Link>
            <Link to="/registrieren/recruiter" style={{ color: C.faint, textDecoration: 'none' }}>
              Als Recruiter →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
