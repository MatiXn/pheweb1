// FuerUnternehmenPage — Für Unternehmen
// Route: /fuer-unternehmen

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import {
  IcoTarget, IcoLock, IcoChart, IcoStar, IcoMail, IcoCard,
  IcoBuilding, IcoLightning, IcoEye, IcoCheck,
  IcoWrench, IcoDroplet,
} from '../components/icons'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const Styles = () => (
  <style>{`
    @keyframes fadeInUp { from { opacity:0; transform:translateY(36px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
    @keyframes floatA   { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(20px,-25px) scale(1.04);} }
    @keyframes gradientMove { 0%,100%{background-position:0% 50%;} 50%{background-position:100% 50%;} }
    .ub-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important; }
    .ub-card:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 56px rgba(15,23,42,0.12), 0 4px 16px rgba(37,99,235,0.12) !important; border-color: #bfdbfe !important; }
    .ub-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.1) !important; box-shadow: 0 8px 24px rgba(37,99,235,0.5) !important; }
    .ub-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease !important; }
  `}</style>
)

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function FuerUnternehmenPage() {
  const benefits = useInView()
  const branchen = useInView()
  const process  = useInView()

  return (
    <>
      <Styles />
      <div style={{ minHeight: '100vh', fontFamily: F, overflowX: 'hidden' }}>
        <PublicNav />

        {/* Hero */}
        <section style={{
          background: 'linear-gradient(155deg, #08091a 0%, #0d1229 50%, #080c1f 100%)',
          padding: '140px 28px 100px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 70%)', animation: 'floatA 14s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)`, backgroundSize: '52px 52px', maskImage: 'radial-gradient(ellipse 80% 80% at 60% 40%, black 20%, transparent 100%)' }} />
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 99, padding: '6px 16px', marginBottom: 32, animation: 'fadeIn 0.6s ease forwards' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', fontFamily: F }}>Für Unternehmen — Elektro · TGA · SHK · Mechatronik</span>
            </div>

            <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', color: '#f1f5f9', fontFamily: F, margin: '0 0 10px', animation: 'fadeInUp 0.7s ease 0.15s both' }}>
              Finden Sie Fachkräfte,
            </h1>
            <h1 style={{
              fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', fontFamily: F, margin: '0 0 28px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)', backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'fadeInUp 0.7s ease 0.2s both, gradientMove 5s ease infinite',
            }}>
              bevor Ihr Mitbewerber es tut.
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', fontFamily: F, maxWidth: 600, margin: '0 0 48px', lineHeight: 1.75, animation: 'fadeInUp 0.7s ease 0.3s both' }}>
              pheweb liefert Ihnen <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>score-basierte, vollständig anonymisierte</strong> Kandidaten-Empfehlungen direkt zu Ihren offenen Stellen — automatisch, transparent und ohne Bewerbungs-Chaos.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease 0.4s both' }}>
              <Link to="/registrieren/unternehmen" className="ub-btn" style={{
                fontFamily: F, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none',
                padding: '14px 28px', borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                Kostenlos registrieren <span>→</span>
              </Link>
              <Link to="/login" style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.85)', textDecoration: 'none', padding: '14px 20px', display: 'inline-flex', alignItems: 'center' }}>
                Bereits registriert? Anmelden
              </Link>
            </div>

            {/* Trust row */}
            <div style={{ display: 'flex', gap: 24, marginTop: 48, animation: 'fadeIn 0.8s ease 0.6s both' }}>
              {['✓ Keine Kreditkarte', '✓ Sofort aktiv', '✓ DSGVO-konform'].map(t => (
                <span key={t} style={{ fontSize: 13, color: '#475569', fontFamily: F, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ background: '#ffffff', padding: '100px 28px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div
              ref={benefits.ref}
              style={{
                textAlign: 'center', marginBottom: 64,
                opacity: benefits.inView ? 1 : 0,
                transform: benefits.inView ? 'none' : 'translateY(30px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px' }}>
                Was pheweb für Sie verändert
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F, maxWidth: 480, margin: '0 auto' }}>
                Nicht mehr durch Stapel ungeeigneter Bewerbungen. Nur noch relevante Kandidaten, direkt in Ihrem Dashboard.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
              {[
                { icon: <IcoTarget />, title: 'Nur passende Kandidaten', desc: 'Unser 5-dimensionaler Algorithmus matcht Skills, Erfahrung, Standort, Verfügbarkeit und Gehalt. Sie sehen nur Kandidaten, die wirklich passen.' },
                { icon: <IcoLock />,   title: 'Anonym bis zur Einwilligung', desc: 'Kein Name, kein Foto, keine Kontaktdaten — bis Sie Interesse bekunden und der Kandidat zustimmt. DSGVO pur.' },
                { icon: <IcoChart />,  title: 'Transparente Match-Scores', desc: 'Jede Karte zeigt den exakten Score mit Aufschlüsselung nach Dimension. Keine Bauchentscheidungen mehr, keine Black Box.' },
                { icon: <IcoStar />,   title: 'Shortlist & Filter', desc: 'Kandidaten vormerken, nach Scores sortieren, nach Job filtern — alles in einer übersichtlichen Ansicht, ohne Excel.' },
                { icon: <IcoMail />,   title: 'Direkte Recruiter-Verbindung', desc: 'Wenn Sie Interesse signalisieren, kontaktiert der Recruiter Sie sofort. Kein Postfach-Ping-Pong, kein Warten.' },
                { icon: <IcoCard />,   title: 'Kein Upfront-Risiko', desc: 'Keine monatliche Gebühr. Sie investieren nur, wenn eine Einstellung tatsächlich zustande kommt. Win-win.' },
              ].map((b, i) => (
                <div
                  key={b.title}
                  className="ub-card"
                  style={{
                    background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '26px 22px',
                    opacity: benefits.inView ? 1 : 0,
                    transform: benefits.inView ? 'none' : 'translateY(24px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                    transitionDelay: `${i * 0.07}s`,
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{b.icon}</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.01em' }}>{b.title}</h4>
                  <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ background: '#f8fafc', padding: '100px 28px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div ref={process.ref} style={{
              textAlign: 'center', marginBottom: 64,
              opacity: process.inView ? 1 : 0, transform: process.inView ? 'none' : 'translateY(30px)', transition: 'all 0.6s ease',
            }}>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px' }}>
                Ihr Weg zur nächsten Einstellung
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F }}>So einfach war Personalsuche noch nie.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2 }}>
              {[
                { n: '01', icon: <IcoBuilding />,   title: 'Stelle anlegen', desc: 'Beschreiben Sie Ihre offene Position: Berufsfeld, Skills, Standort, Erfahrung, Gehaltsrahmen.' },
                { n: '02', icon: <IcoLightning />,  title: 'Matching läuft', desc: 'pheweb matcht automatisch passende Kandidaten aus der gesamten Recruiter-Pipeline — Sie müssen nichts tun.' },
                { n: '03', icon: <IcoEye />,        title: 'Kandidaten prüfen', desc: 'Sehen Sie anonymisierte Kandidaten-Karten mit aufgeschlüsselten Scores. Favorisieren Sie interessante Profile.' },
                { n: '04', icon: <IcoCheck />,      title: 'Interesse bekunden', desc: 'Ein Klick genügt. Der Recruiter kontaktiert Sie und koordiniert das erste Gespräch — ohne Mehraufwand für Sie.' },
              ].map((s, i) => (
                <div key={s.n} style={{
                  textAlign: 'center', padding: '0 16px',
                  opacity: process.inView ? 1 : 0, transform: process.inView ? 'none' : 'translateY(24px)',
                  transition: 'all 0.5s ease', transitionDelay: `${i * 0.1}s`,
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    border: '3px solid #fff', boxShadow: '0 0 0 4px #eff6ff, 0 8px 24px rgba(37,99,235,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 20px',
                  }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{s.n}</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: F, margin: '12px 0 8px' }}>{s.title}</h4>
                  <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Branchen */}
        <section style={{ background: 'linear-gradient(155deg, #08091a 0%, #0d1229 100%)', padding: '80px 28px' }}>
          <div ref={branchen.ref} style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28 }}>
              Spezialisiert auf technische Fachberufe
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              {[
                { icon: <IcoLightning />, label: 'Elektrotechnik', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', bd: 'rgba(251,191,36,0.3)' },
                { icon: <IcoBuilding />, label: 'TGA', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', bd: 'rgba(96,165,250,0.3)' },
                { icon: <IcoDroplet />,  label: 'SHK', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', bd: 'rgba(34,211,238,0.3)' },
                { icon: <IcoWrench />,   label: 'Mechatronik', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', bd: 'rgba(167,139,250,0.3)' },
              ].map((b, i) => (
                <div key={b.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: b.color, fontFamily: F,
                  background: b.bg, border: `1px solid ${b.bd}`, borderRadius: 14, padding: '14px 24px',
                  opacity: branchen.inView ? 1 : 0, transform: branchen.inView ? 'none' : 'translateY(20px)',
                  transition: 'all 0.5s ease', transitionDelay: `${i * 0.1}s`,
                }}>
                  <span style={{ fontSize: 22 }}>{b.icon}</span>{b.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#ffffff', padding: '100px 28px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 16px' }}>
            Bereit, Ihre nächste Fachkraft zu finden?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', fontFamily: F, margin: '0 0 40px' }}>
            In unter 3 Minuten registriert. Keine Kreditkarte. Sofort aktiv.
          </p>
          <Link to="/registrieren/unternehmen" className="ub-btn" style={{
            fontFamily: F, fontSize: 16, fontWeight: 700, color: '#fff', textDecoration: 'none',
            padding: '16px 36px', borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Kostenlos registrieren →
          </Link>
        </section>

        <footer style={{ background: '#08091a', padding: '28px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: '#334155', fontFamily: F, textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        </footer>
      </div>
    </>
  )
}
