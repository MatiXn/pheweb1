// FuerKandidatenPage — Für Kandidaten
// Route: /fuer-kandidaten

import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const C = {
  accent: '#7c3aed', accentBg: '#f5f3ff', accentBd: '#ddd6fe',
  text: '#0f172a', muted: '#475569', border: '#e2e8f0',
  white: '#ffffff', bg: '#f8fafc', navy: '#0f172a',
}

function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', borderBottom: `1px solid ${C.border}`,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F, color: C.navy }}>
            phe<span style={{ color: '#2563eb' }}>web</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: C.muted, textDecoration: 'none', padding: '8px 16px' }}>
            Anmelden
          </Link>
          <Link to="/registrieren/kandidat" style={{
            fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent} 0%, #8b5cf6 100%)`,
            boxShadow: `0 2px 8px ${C.accent}40`,
          }}>
            Jetzt bewerben
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function FuerKandidatenPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F }}>
      <Nav />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)`,
        textAlign: 'center', padding: '128px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)' }} />
        </div>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', fontFamily: F }}>Für Kandidaten</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.04em', color: '#f1f5f9', fontFamily: F, margin: '0 0 20px' }}>
            Ihre nächste Stelle —<br />
            <span style={{ background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              diskret und ohne Stress
            </span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', fontFamily: F, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Erstellen Sie einmalig Ihr Profil. Erfahrene Recruiter stellen Sie passenden Unternehmen vor — anonym, professionell und ohne aktive Jobsuche.
          </p>
          <Link to="/registrieren/kandidat" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '14px 32px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent} 0%, #8b5cf6 100%)`,
            boxShadow: `0 4px 16px ${C.accent}60`,
          }}>
            Kostenlos Profil erstellen
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px', background: C.white }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, textAlign: 'center', margin: '0 0 48px' }}>
            Warum pheweb für Kandidaten?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🆓', title: '100 % kostenlos', desc: 'Die Registrierung und alle Dienste für Kandidaten sind und bleiben kostenlos. Sie zahlen nichts.' },
              { icon: '🔒', title: 'Anonymität bis zur Einwilligung', desc: 'Ihre persönlichen Daten werden erst freigegeben, wenn Sie einer konkreten Vorstellung zustimmen.' },
              { icon: '🤝', title: 'Professionelle Recruiter', desc: 'Erfahrene externe Recruiter betreuen Sie aktiv und stellen Sie optimal bei passenden Unternehmen vor.' },
              { icon: '📍', title: 'Passende Region', desc: 'Nur Unternehmen aus Ihrer gewünschten Region sehen Ihr Profil — keine unnötigen Anfragen.' },
              { icon: '⏰', title: 'Ihr Tempo', desc: 'Setzen Sie Ihre Verfügbarkeit: sofort, in 1 Monat, oder flexibel. Sie behalten die Kontrolle.' },
              { icon: '📊', title: 'Transparente Matches', desc: 'Sie sehen, wie gut Ihre Qualifikationen zu offenen Stellen passen — mit aufgeschlüsselten Scores.' },
            ].map((b, i) => (
              <div key={i} style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 22px' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{b.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: F, margin: '0 0 8px' }}>{b.title}</h4>
                <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ablauf */}
      <section style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px' }}>
            So läuft es ab
          </h2>
          <p style={{ fontSize: 16, color: C.muted, fontFamily: F, margin: '0 0 48px' }}>In 4 einfachen Schritten zu Ihrer neuen Stelle.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: '01', title: 'Profil erstellen', desc: 'Titel, Skills, Erfahrung, Standort, Verfügbarkeit und Gehaltsvorstellung eintragen.' },
              { n: '02', title: 'Recruiter prüft', desc: 'Ein Recruiter nimmt Ihr Profil in seine Pipeline auf und bereitet Ihre Vorstellung vor.' },
              { n: '03', title: 'Anonymes Matching', desc: 'Ihr Profil wird anonymisiert passenden Unternehmen präsentiert. Kein Name, keine Kontaktdaten.' },
              { n: '04', title: 'Einwilligung & Gespräch', desc: 'Wenn ein Unternehmen Interesse hat und Sie zustimmen, werden Kontaktdaten freigegeben.' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', display: 'flex', gap: 20, alignItems: 'flex-start', textAlign: 'left' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.accent, background: C.accentBg, border: `1px solid ${C.accentBd}`, borderRadius: 8, padding: '4px 10px', fontFamily: 'monospace', flexShrink: 0, marginTop: 2 }}>
                  {s.n}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: C.muted, fontFamily: F, lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: C.white, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: F, margin: '0 0 12px' }}>
          Jetzt Profil erstellen — kostenlos
        </h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: F, margin: '0 0 28px' }}>
          In wenigen Minuten registriert. Kein Risiko, keine Kosten.
        </p>
        <Link to="/registrieren/kandidat" style={{
          fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12,
          background: `linear-gradient(135deg, ${C.accent} 0%, #8b5cf6 100%)`,
          boxShadow: `0 4px 16px ${C.accent}50`,
        }}>
          Kostenlos registrieren
        </Link>
      </section>

      <footer style={{ background: C.navy, padding: '24px', textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: 13, color: '#475569', fontFamily: F, textDecoration: 'none' }}>
          ← Zurück zur Startseite
        </Link>
      </footer>
    </div>
  )
}
