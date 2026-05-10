// FuerRecruiterPage — Für Recruiter
// Route: /fuer-recruiter

import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const C = {
  accent: '#059669', accentBg: '#ecfdf5', accentBd: '#a7f3d0',
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
          <Link to="/registrieren/recruiter" style={{
            fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent} 0%, #10b981 100%)`,
            boxShadow: `0 2px 8px ${C.accent}40`,
          }}>
            Als Recruiter starten
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function FuerRecruiterPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F }}>
      <Nav />

      {/* Hero */}
      <section style={{
        background: `linear-gradient(160deg, #064e3b 0%, #065f46 50%, #064e3b 100%)`,
        textAlign: 'center', padding: '128px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.25) 0%, transparent 70%)' }} />
        </div>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7', fontFamily: F }}>Für externe Recruiter</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.04em', color: '#f1f5f9', fontFamily: F, margin: '0 0 20px' }}>
            Skalieren Sie Ihre<br />
            <span style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Vermittlungs-Pipeline
            </span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', fontFamily: F, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Laden Sie Ihre vorqualifizierten Kandidaten hoch und profitieren Sie vom automatischen Matching mit passenden Unternehmen — provisionsbasisert und ohne Festkosten.
          </p>
          <Link to="/registrieren/recruiter" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '14px 32px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent} 0%, #10b981 100%)`,
            boxShadow: `0 4px 16px ${C.accent}60`,
          }}>
            Jetzt Recruiter-Konto anlegen
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px', background: C.white }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, textAlign: 'center', margin: '0 0 48px' }}>
            Ihre Vorteile als Recruiter
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '💶', title: 'Provisionsbasiert', desc: 'Keine monatlichen Fixkosten. Sie verdienen ~32,5 % des ersten Jahresgehalts bei erfolgreicher Einstellung.' },
              { icon: '⚡', title: 'Automatisches Matching', desc: 'Ihre hochgeladenen Kandidaten werden automatisch mit offenen Unternehmensstellen gematcht.' },
              { icon: '📊', title: 'Pipeline-Dashboard', desc: 'Behalten Sie den Überblick über alle Kandidaten, Matches und laufende Interessensbekundungen.' },
              { icon: '🔔', title: 'Echtzeit-Benachrichtigungen', desc: 'Sobald ein Unternehmen Interesse bekundet, werden Sie sofort informiert und können handeln.' },
              { icon: '🏭', title: 'Spezialisierter Markt', desc: 'pheweb fokussiert auf Elektro, TGA, SHK und Mechatronik — genau Ihre Kernbranchen.' },
              { icon: '🤝', title: 'Strukturierter Prozess', desc: 'Von der Kandidaten-Einwilligung bis zum Hiring — alles transparent dokumentiert auf der Plattform.' },
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

      {/* Wie es funktioniert */}
      <section style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px' }}>
            Ihr Workflow als Recruiter
          </h2>
          <p style={{ fontSize: 16, color: C.muted, fontFamily: F, margin: '0 0 48px' }}>So funktioniert pheweb für Sie.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { n: '01', title: 'Konto anlegen & verifizieren', desc: 'Registrieren Sie sich als externer Recruiter. Nach kurzer Prüfung wird Ihr Konto freigeschaltet.' },
              { n: '02', title: 'Kandidaten hochladen', desc: 'Laden Sie Ihre vorqualifizierten Kandidaten hoch: Berufsbezeichnung, Skills, Standort, Verfügbarkeit, Gehaltsvorstellung.' },
              { n: '03', title: 'Matching läuft automatisch', desc: 'pheweb matcht Ihre Kandidaten automatisch mit offenen Stellen. Sie erhalten Benachrichtigungen bei Interesse.' },
              { n: '04', title: 'Einwilligung einholen & Provision erhalten', desc: 'Sobald ein Unternehmen Interesse hat, holen Sie die Kandidaten-Einwilligung ein. Bei Einstellung: Provision.' },
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
          Bereit, Ihre Pipeline zu skalieren?
        </h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: F, margin: '0 0 28px' }}>
          Kostenlos starten, nur bei Erfolg zahlen.
        </p>
        <Link to="/registrieren/recruiter" style={{
          fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12,
          background: `linear-gradient(135deg, ${C.accent} 0%, #10b981 100%)`,
          boxShadow: `0 4px 16px ${C.accent}50`,
        }}>
          Recruiter-Konto anlegen
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
