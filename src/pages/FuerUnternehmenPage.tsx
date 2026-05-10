// FuerUnternehmenPage — Für Unternehmen
// Route: /fuer-unternehmen

import { useState } from 'react'
import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
const C = {
  accent: '#2563eb', text: '#0f172a', muted: '#475569',
  border: '#e2e8f0', white: '#ffffff', bg: '#f8fafc', navy: '#0f172a',
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
            phe<span style={{ color: C.accent }}>web</span>
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/login" style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: C.muted, textDecoration: 'none', padding: '8px 16px' }}>
            Anmelden
          </Link>
          <Link to="/registrieren/unternehmen" style={{
            fontFamily: F, fontSize: 14, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`,
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            Jetzt starten
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function FuerUnternehmenPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: F }}>
      <Nav />

      {/* Hero */}
      <section style={{
        paddingTop: 120, paddingBottom: 80,
        background: `linear-gradient(160deg, ${C.navy} 0%, #1e293b 100%)`,
        textAlign: 'center', padding: '128px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)' }} />
        </div>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', fontFamily: F }}>Für Unternehmen</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.04em', color: '#f1f5f9', fontFamily: F, margin: '0 0 20px' }}>
            Finden Sie qualifizierte<br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Fachkräfte auf Knopfdruck
            </span>
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', fontFamily: F, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            pheweb liefert Ihnen anonymisierte, vorqualifizierte Kandidaten-Empfehlungen direkt zu Ihren offenen Stellen — DSGVO-konform und ohne Risiko.
          </p>
          <Link to="/registrieren/unternehmen" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
            padding: '14px 32px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`,
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
          }}>
            Kostenlos registrieren
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: '80px 24px', background: C.white }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, textAlign: 'center', margin: '0 0 48px' }}>
            Ihre Vorteile mit pheweb
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              { icon: '🎯', title: 'Präzises Matching', desc: 'Unser Algorithmus berechnet Scores für Skills, Erfahrung, Standort, Verfügbarkeit und Gehaltsvorstellung — nur passende Kandidaten erscheinen.' },
              { icon: '🔒', title: 'Vollständige Anonymität', desc: 'Alle Kandidaten werden anonymisiert dargestellt. Erst nach beidseitiger Zustimmung werden Kontaktdaten freigegeben — DSGVO by Design.' },
              { icon: '📊', title: 'Transparente Scores', desc: 'Jede Karte zeigt aufgeschlüsselte Match-Scores. Keine Black Box — Sie verstehen sofort, warum ein Kandidat empfohlen wird.' },
              { icon: '💳', title: 'Kein Upfront-Risiko', desc: 'Sie zahlen nur bei erfolgreicher Einstellung. Keine monatlichen Fixkosten, keine Vertragsbindung.' },
              { icon: '⭐', title: 'Vorgemerkte Kandidaten', desc: 'Favorisieren Sie interessante Profile und filtern Sie jederzeit Ihre Shortlist — übersichtlich und einfach.' },
              { icon: '📬', title: 'Direkte Recruiter-Verbindung', desc: 'Wenn Sie Interesse bekunden, kontaktiert der Recruiter Sie direkt. Schneller, strukturierter Prozess ohne Umwege.' },
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

      {/* Branchen */}
      <section style={{ padding: '80px 24px', background: C.bg }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.text, letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px' }}>
            Spezialisiert auf Ihre Branchen
          </h2>
          <p style={{ fontSize: 16, color: C.muted, fontFamily: F, margin: '0 0 40px' }}>
            pheweb ist kein generischer Stellenmarkt — wir fokussieren auf technische Fachberufe.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            {['⚡ Elektrotechnik', '🏗️ TGA', '💧 SHK', '🔧 Mechatronik'].map(b => (
              <div key={b} style={{
                fontSize: 15, fontWeight: 600, color: C.accent, fontFamily: F,
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 12, padding: '12px 24px',
              }}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px', background: C.white, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: F, margin: '0 0 12px' }}>
          Bereit, Ihre nächste Fachkraft zu finden?
        </h2>
        <p style={{ fontSize: 15, color: C.muted, fontFamily: F, margin: '0 0 28px' }}>
          Legen Sie in wenigen Minuten Ihre erste Stelle an.
        </p>
        <Link to="/registrieren/unternehmen" style={{
          fontFamily: F, fontSize: 15, fontWeight: 700, color: C.white, textDecoration: 'none',
          padding: '14px 32px', borderRadius: 12,
          background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`,
          boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
        }}>
          Jetzt kostenlos registrieren
        </Link>
      </section>

      {/* Footer minimal */}
      <footer style={{ background: C.navy, padding: '24px', textAlign: 'center' }}>
        <Link to="/" style={{ fontSize: 13, color: '#475569', fontFamily: F, textDecoration: 'none' }}>
          ← Zurück zur Startseite
        </Link>
      </footer>
    </div>
  )
}
