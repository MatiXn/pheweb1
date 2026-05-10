import { Link, useSearchParams } from 'react-router-dom'
import { LoginForm } from '../features/auth/components/LoginForm'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

/* ── Role themes ─────────────────────────────────────────────── */
type Role = 'unternehmen' | 'kandidat' | 'recruiter' | 'default'

const THEMES: Record<Role, {
  accent: string
  accentLight: string
  accentGlow: string
  orb1: string
  orb2: string
  gradient: string
  gradientText: string
  badge: string
  badgeBorder: string
  badgeText: string
  dot: string
  tagline: string
  headline: string
  headlineGradient: string
  sub: string
  features: { icon: string; title: string; desc: string }[]
  registerTo: string
  registerLabel: string
}> = {
  unternehmen: {
    accent:          '#2563eb',
    accentLight:     '#60a5fa',
    accentGlow:      'rgba(37,99,235,0.5)',
    orb1:            'rgba(59,130,246,0.25)',
    orb2:            'rgba(99,102,241,0.18)',
    gradient:        'linear-gradient(160deg, #08091a 0%, #0c1a3a 50%, #0f172a 100%)',
    gradientText:    'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
    badge:           'rgba(59,130,246,0.12)',
    badgeBorder:     'rgba(59,130,246,0.3)',
    badgeText:       '#93c5fd',
    dot:             '#60a5fa',
    tagline:         'Elektro · TGA · SHK · Mechatronik',
    headline:        'Die smarte Art,',
    headlineGradient:'Fachkräfte zu finden.',
    sub:             'Verbinden Sie sich mit vorqualifizierten Kandidaten über unsere datenschutzkonforme Matching-Plattform.',
    features: [
      { icon: '⚡', title: 'KI-Matching in Echtzeit',     desc: 'Passgenaue Kandidaten-Empfehlungen — vollautomatisch, sofort einsatzbereit.' },
      { icon: '🛡️', title: 'DSGVO-konform',               desc: 'Vollständig anonymisierte Profile bis zur beidseitigen Zustimmung.' },
      { icon: '📊', title: 'Transparente Match-Scores',   desc: 'Score-basierte Rangfolge für schnellere, bessere Einstellungsentscheidungen.' },
    ],
    registerTo:    '/registrieren/unternehmen',
    registerLabel: 'Noch kein Konto? Als Unternehmen registrieren →',
  },
  kandidat: {
    accent:          '#7c3aed',
    accentLight:     '#c4b5fd',
    accentGlow:      'rgba(124,58,237,0.5)',
    orb1:            'rgba(124,58,237,0.28)',
    orb2:            'rgba(139,92,246,0.18)',
    gradient:        'linear-gradient(160deg, #0d0920 0%, #1e1b4b 50%, #0f172a 100%)',
    gradientText:    'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
    badge:           'rgba(124,58,237,0.15)',
    badgeBorder:     'rgba(167,139,250,0.35)',
    badgeText:       '#c4b5fd',
    dot:             '#a78bfa',
    tagline:         'Für Kandidaten — 100 % kostenlos',
    headline:        'Ihre nächste Stelle',
    headlineGradient:'findet Sie.',
    sub:             'Einmalig Profil anlegen. Unsere Recruiter präsentieren Sie passenden Arbeitgebern — anonym, ohne aktive Bewerbung.',
    features: [
      { icon: '🔒', title: 'Anonym bis zur Zustimmung',   desc: 'Ihr Name und Unternehmen bleiben verborgen, bis Sie Interesse bekunden.' },
      { icon: '🎯', title: 'Passende Angebote',            desc: 'Nur Stellen, die wirklich zu Ihrer Qualifikation und Ihren Wünschen passen.' },
      { icon: '💰', title: 'Kostenlos für Kandidaten',     desc: 'Keine Gebühren, keine Abos — jetzt und immer.' },
    ],
    registerTo:    '/registrieren/kandidat',
    registerLabel: 'Noch kein Profil? Jetzt kostenlos registrieren →',
  },
  recruiter: {
    accent:          '#059669',
    accentLight:     '#6ee7b7',
    accentGlow:      'rgba(5,150,105,0.45)',
    orb1:            'rgba(5,150,105,0.3)',
    orb2:            'rgba(16,185,129,0.18)',
    gradient:        'linear-gradient(160deg, #031a10 0%, #064e3b 50%, #0f172a 100%)',
    gradientText:    'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)',
    badge:           'rgba(5,150,105,0.18)',
    badgeBorder:     'rgba(52,211,153,0.35)',
    badgeText:       '#6ee7b7',
    dot:             '#34d399',
    tagline:         'Für externe Recruiter — Erfolgsbasiert, kein Risiko',
    headline:        'Mehr Einstellungen.',
    headlineGradient:'Weniger Festkosten.',
    sub:             'Greifen Sie auf einen frischen Kandidatenpool zu. Präsentieren Sie Ihre Kandidaten direkt bei Unternehmen — auf Erfolgsbasis.',
    features: [
      { icon: '🤝', title: '~32,5 % Provision',            desc: 'Bei einem 50k-Gehalt: rund 16.250 € je erfolgreicher Einstellung.' },
      { icon: '🗃️', title: 'Kandidaten-Datenbank',         desc: 'Zugang zu vorqualifizierten Fachkräften aus Elektro, TGA, SHK, Mechatronik.' },
      { icon: '📈', title: 'Skalierbar',                    desc: 'Mehrere Unternehmen gleichzeitig bedienen — ohne Deckelung Ihrer Provision.' },
    ],
    registerTo:    '/registrieren/recruiter',
    registerLabel: 'Noch kein Account? Als Recruiter registrieren →',
  },
  default: {
    accent:          '#2563eb',
    accentLight:     '#60a5fa',
    accentGlow:      'rgba(37,99,235,0.5)',
    orb1:            'rgba(59,130,246,0.25)',
    orb2:            'rgba(99,102,241,0.18)',
    gradient:        'linear-gradient(160deg, #08091a 0%, #0c1a3a 50%, #0f172a 100%)',
    gradientText:    'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)',
    badge:           'rgba(59,130,246,0.12)',
    badgeBorder:     'rgba(59,130,246,0.3)',
    badgeText:       '#93c5fd',
    dot:             '#60a5fa',
    tagline:         'Elektro · TGA · SHK · Mechatronik',
    headline:        'Die smarte Art,',
    headlineGradient:'Fachkräfte zu finden.',
    sub:             'Verbinden Sie sich mit vorqualifizierten Kandidaten über unsere datenschutzkonforme Matching-Plattform.',
    features: [
      { icon: '⚡', title: 'KI-Matching in Echtzeit',     desc: 'Passgenaue Kandidaten-Empfehlungen — vollautomatisch, sofort einsatzbereit.' },
      { icon: '🛡️', title: 'DSGVO-konform',               desc: 'Vollständig anonymisierte Profile bis zur beidseitigen Zustimmung.' },
      { icon: '📊', title: 'Transparente Match-Scores',   desc: 'Score-basierte Rangfolge für schnellere, bessere Einstellungsentscheidungen.' },
    ],
    registerTo:    '/registrieren/kandidat',
    registerLabel: 'Noch kein Konto? Jetzt registrieren →',
  },
}

const STATS = [
  { value: '500+', label: 'Kandidaten'          },
  { value: '98%',  label: 'Match-Rate'           },
  { value: '3×',   label: 'Schnellere Besetzung' },
]

/* ── Component ───────────────────────────────────────────────── */
export default function LoginPage() {
  const [params] = useSearchParams()
  const raw = params.get('from') ?? 'default'
  const role: Role = (['unternehmen', 'kandidat', 'recruiter'] as const).includes(raw as Role)
    ? (raw as Role)
    : 'default'
  const T = THEMES[role]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: F, background: '#0f172a' }}>

      {/* ── Left panel ─────────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        padding:        '40px 52px',
        width:          '46%',
        flexShrink:     0,
        position:       'relative',
        overflow:       'hidden',
        minHeight:      '100vh',
        background:     T.gradient,
        transition:     'background 0.5s ease',
      }}>

        {/* Decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position:     'absolute', top: '-20%', right: '-15%',
            width: 480, height: 480, borderRadius: '50%',
            background:   `radial-gradient(circle, ${T.orb1} 0%, transparent 70%)`,
            transition:   'background 0.5s ease',
          }} />
          <div style={{
            position:     'absolute', bottom: '-10%', left: '-10%',
            width: 360, height: 360, borderRadius: '50%',
            background:   `radial-gradient(circle, ${T.orb2} 0%, transparent 70%)`,
            transition:   'background 0.5s ease',
          }} />
          <div style={{
            position:     'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }} />
        </div>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', color: '#f1f5f9', lineHeight: 1 }}>
              phe<span style={{ color: T.accentLight, transition: 'color 0.5s ease' }}>web</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.8)', marginTop: 5, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Fachkräfte-Plattform
            </div>
          </Link>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display:      'inline-flex', alignItems: 'center', gap: 8,
            background:   T.badge, border: `1px solid ${T.badgeBorder}`,
            borderRadius: 9999, padding: '5px 14px',
            fontSize: 12, fontWeight: 600, color: T.badgeText,
            marginBottom: 24, letterSpacing: '0.02em',
            transition: 'all 0.5s ease',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.dot, display: 'inline-block', boxShadow: `0 0 8px ${T.dot}`, transition: 'all 0.5s ease' }} />
            {T.tagline}
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(28px, 2.8vw, 42px)', fontWeight: 800,
            lineHeight: 1.15, color: '#f1f5f9',
            letterSpacing: '-0.035em', marginBottom: 10,
          }}>
            {T.headline}
          </h1>
          <h1 style={{
            fontSize: 'clamp(28px, 2.8vw, 42px)', fontWeight: 800,
            lineHeight: 1.15, letterSpacing: '-0.035em', marginBottom: 18,
            background: T.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            transition: 'background 0.5s ease',
          }}>
            {T.headlineGradient}
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.85)', lineHeight: 1.75, marginBottom: 36, maxWidth: 360 }}>
            {T.sub}
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {T.features.map(f => (
              <div key={f.title} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, backdropFilter: 'blur(8px)',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: T.badge, border: `1px solid ${T.badgeBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, transition: 'all 0.5s ease',
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
          position: 'relative', zIndex: 1,
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: '16px 20px', textAlign: 'center',
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

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 48px',
        background: '#f8fafc', position: 'relative',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Back link */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8', textDecoration: 'none', marginBottom: 32, transition: 'color 0.15s' }}>
            ← Zurück zur Startseite
          </Link>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
              Willkommen zurück
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.5 }}>
              {role === 'kandidat'
                ? 'Melden Sie sich in Ihrem Kandidaten-Profil an.'
                : role === 'recruiter'
                ? 'Melden Sie sich in Ihrem Recruiter-Konto an.'
                : 'Melden Sie sich in Ihrem Unternehmens-Konto an.'}
            </p>
          </div>

          {/* Role pill */}
          {role !== 'default' && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.badge, border: `1px solid ${T.badgeBorder}`,
              borderRadius: 9999, padding: '5px 14px',
              fontSize: 12, fontWeight: 600, color: T.badgeText,
              marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.dot, display: 'inline-block' }} />
              {role === 'kandidat' ? 'Kandidaten-Login'
               : role === 'recruiter' ? 'Recruiter-Login'
               : 'Unternehmens-Login'}
            </div>
          )}

          {/* Form card */}
          <div style={{
            background: '#ffffff', borderRadius: 20,
            border: '1px solid #e2e8f0', padding: '32px',
            boxShadow: '0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.05)',
          }}>
            <LoginForm />

            <div style={{
              marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9',
              textAlign: 'center', fontSize: 13, color: '#94a3b8', lineHeight: 1.6,
            }}>
              {T.registerLabel.split('→')[0]}
              <Link to={T.registerTo} style={{ color: T.accent, fontWeight: 600 }}>
                registrieren →
              </Link>
            </div>
          </div>

          {/* Role switcher */}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {role !== 'unternehmen' && (
              <Link to="/login?from=unternehmen" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
                Als Unternehmen →
              </Link>
            )}
            {role !== 'kandidat' && (
              <Link to="/login?from=kandidat" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
                Als Kandidat →
              </Link>
            )}
            {role !== 'recruiter' && (
              <Link to="/login?from=recruiter" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>
                Als Recruiter →
              </Link>
            )}
          </div>

          {/* Footer note */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
            Mit der Anmeldung stimmen Sie unseren{' '}
            <Link to="/kandidat/datenschutz" style={{ color: '#94a3b8' }}>Datenschutzbestimmungen</Link>
            {' '}zu.
          </p>
        </div>
      </div>
    </div>
  )
}
