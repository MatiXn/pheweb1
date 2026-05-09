import { Link } from 'react-router-dom'
import { LoginForm } from '../features/auth/components/LoginForm'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const FEATURES = [
  {
    icon: '⚡',
    title: 'Automatisches Matching',
    desc: 'KI-gestützte Kandidaten-Empfehlungen für Ihre offenen Stellen — in Echtzeit.',
  },
  {
    icon: '🛡️',
    title: 'DSGVO-konform',
    desc: 'Vollständig anonymisierte Profile bis zur beidseitigen Zustimmung.',
  },
  {
    icon: '📊',
    title: 'Score-basiert',
    desc: 'Transparente Match-Scores für schnellere, bessere Entscheidungen.',
  },
]

const STATS = [
  { value: '500+', label: 'Kandidaten' },
  { value: '98%',  label: 'Match-Rate'  },
  { value: '3×',   label: 'Schnellere Besetzung' },
]

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: F, background: '#0f172a' }}>

      {/* ── Left panel — branding ── */}
      <div style={{
        display:       'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding:       '40px 52px',
        width:         '46%',
        flexShrink:    0,
        position:      'relative',
        overflow:      'hidden',
        minHeight:     '100vh',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {/* Large gradient orb top-right */}
          <div style={{
            position:   'absolute',
            top:        '-20%',
            right:      '-15%',
            width:      480,
            height:     480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
          }} />
          {/* Subtle orb bottom-left */}
          <div style={{
            position:   'absolute',
            bottom:     '-10%',
            left:       '-10%',
            width:      360,
            height:     360,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          }} />
          {/* Grid overlay */}
          <div style={{
            position:   'absolute',
            inset:      0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize:      30,
            fontWeight:    800,
            letterSpacing: '-0.04em',
            color:         '#f1f5f9',
            lineHeight:    1,
          }}>
            phe<span style={{ color: '#60a5fa' }}>web</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', marginTop: 5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Fachkräfte-Plattform
          </div>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display:     'inline-flex',
            alignItems:  'center',
            gap:         8,
            background:  'rgba(59,130,246,0.12)',
            border:      '1px solid rgba(59,130,246,0.25)',
            borderRadius: 9999,
            padding:     '5px 14px',
            fontSize:    12,
            fontWeight:  600,
            color:       '#93c5fd',
            marginBottom: 24,
            letterSpacing: '0.02em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', boxShadow: '0 0 8px #60a5fa' }} />
            Elektro · TGA · SHK · Mechatronik
          </div>

          <h1 style={{
            fontSize:      'clamp(28px, 2.8vw, 42px)',
            fontWeight:    800,
            lineHeight:    1.15,
            color:         '#f1f5f9',
            letterSpacing: '-0.035em',
            marginBottom:  18,
          }}>
            Die smarte Art,<br />
            <span style={{
              background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Fachkräfte zu finden.
            </span>
          </h1>

          <p style={{
            fontSize:   15,
            color:      'rgba(148,163,184,0.85)',
            lineHeight: 1.75,
            marginBottom: 40,
            maxWidth:   360,
          }}>
            Verbinden Sie sich mit vorqualifizierten Kandidaten über
            unsere datenschutzkonforme Matching-Plattform.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                display:     'flex',
                gap:         14,
                alignItems:  'flex-start',
                padding:     '12px 16px',
                background:  'rgba(255,255,255,0.04)',
                border:      '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12,
                backdropFilter: 'blur(8px)',
              }}>
                <div style={{
                  width:          38,
                  height:         38,
                  borderRadius:   10,
                  background:     'rgba(59,130,246,0.15)',
                  border:         '1px solid rgba(59,130,246,0.2)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       18,
                  flexShrink:     0,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.75)', lineHeight: 1.55 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          position:   'relative',
          zIndex:     1,
          display:    'flex',
          gap:        0,
          background: 'rgba(255,255,255,0.04)',
          border:     '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          overflow:   'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex:       1,
              padding:    '16px 20px',
              textAlign:  'center',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(148,163,184,0.6)', marginTop: 4, fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        flex:           1,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '40px 48px',
        background:     '#f8fafc',
        position:       'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Form header */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize:     28,
              fontWeight:   800,
              color:        '#0f172a',
              letterSpacing: '-0.03em',
              marginBottom: 8,
              lineHeight:   1.2,
            }}>
              Willkommen zurück
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
              Melden Sie sich in Ihrem Konto an, um fortzufahren.
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background:   '#ffffff',
            borderRadius: 20,
            border:       '1px solid #e2e8f0',
            padding:      '32px 32px',
            boxShadow:    '0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.05)',
          }}>
            <LoginForm />

            <div style={{
              marginTop:  24,
              paddingTop: 20,
              borderTop:  '1px solid #f1f5f9',
              textAlign:  'center',
              fontSize:   13,
              color:      '#94a3b8',
              lineHeight: 1.6,
            }}>
              Noch kein Konto?{' '}
              <Link to="/registrieren/kandidat" style={{
                color:      '#2563eb',
                fontWeight: 600,
              }}>
                Jetzt registrieren
              </Link>
            </div>
          </div>

          {/* Role links */}
          <div style={{
            marginTop:      28,
            display:        'flex',
            justifyContent: 'center',
            gap:            24,
            flexWrap:       'wrap',
          }}>
            {[
              { to: '/registrieren/unternehmen', label: 'Als Unternehmen registrieren' },
              { to: '/registrieren/recruiter',   label: 'Als Recruiter registrieren'   },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  fontSize:   13,
                  color:      '#94a3b8',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        4,
                  transition: 'color 0.15s',
                }}
              >
                {l.label}
                <span style={{ fontSize: 14, opacity: 0.7 }}>→</span>
              </Link>
            ))}
          </div>

          {/* Footer note */}
          <p style={{
            textAlign:  'center',
            marginTop:  28,
            fontSize:   12,
            color:      '#cbd5e1',
            lineHeight: 1.6,
          }}>
            Mit der Anmeldung stimmen Sie unseren{' '}
            <Link to="/kandidat/datenschutz" style={{ color: '#94a3b8' }}>Datenschutzbestimmungen</Link>
            {' '}zu.
          </p>
        </div>
      </div>
    </div>
  )
}
