// FuerRecruiterPage — Für Recruiter
// Route: /fuer-recruiter

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const Styles = () => (
  <style>{`
    @keyframes fadeInUp { from{opacity:0;transform:translateY(36px);}to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
    @keyframes floatC   { 0%,100%{transform:translate(0,0);}40%{transform:translate(18px,22px);}80%{transform:translate(-10px,-8px);} }
    @keyframes gradientMove { 0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;} }
    .rb-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important; }
    .rb-card:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 56px rgba(15,23,42,0.12), 0 4px 16px rgba(5,150,105,0.12) !important; border-color: #a7f3d0 !important; }
    .rb-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease !important; }
    .rb-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.08) !important; box-shadow: 0 8px 24px rgba(5,150,105,0.45) !important; }
  `}</style>
)

function useScrolled(t = 20) {
  const [s, setS] = useState(false)
  useEffect(() => { const fn = () => setS(window.scrollY > t); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn) }, [t])
  return s
}
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null); const [inView, setInView] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return { ref, inView }
}

function Nav() {
  const scrolled = useScrolled()
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent', backdropFilter: scrolled ? 'blur(16px)' : 'none', borderBottom: scrolled ? '1px solid #e2e8f0' : 'none', transition: 'all 0.4s ease' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em', fontFamily: F, color: scrolled ? '#0f172a' : '#f1f5f9' }}>phe<span style={{ color: '#60a5fa' }}>web</span></span>
        </Link>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/login?from=recruiter" style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: scrolled ? '#64748b' : 'rgba(148,163,184,0.9)', textDecoration: 'none', padding: '8px 16px' }}>Anmelden</Link>
          <Link to="/registrieren/recruiter" className="rb-btn" style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '9px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 2px 12px rgba(5,150,105,0.4)' }}>
            Recruiter werden →
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function FuerRecruiterPage() {
  const benefits = useInView(); const steps = useInView(); const pricing = useInView()

  return (
    <>
      <Styles />
      <div style={{ minHeight: '100vh', fontFamily: F, overflowX: 'hidden' }}>
        <Nav />

        {/* Hero */}
        <section style={{ background: 'linear-gradient(155deg, #064e3b 0%, #065f46 50%, #047857 100%)', padding: '140px 28px 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.35) 0%, transparent 70%)', animation: 'floatC 14s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)`, backgroundSize: '52px 52px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)' }} />
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(5,150,105,0.2)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 32, animation: 'fadeIn 0.6s ease forwards' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7b7' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6ee7b7', fontFamily: F }}>Für externe Recruiter — Erfolgsbasiert, kein Risiko</span>
            </div>

            <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', color: '#f1f5f9', fontFamily: F, margin: '0 0 10px', animation: 'fadeInUp 0.7s ease 0.15s both' }}>
              Mehr Einstellungen.
            </h1>
            <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', fontFamily: F, margin: '0 0 28px', background: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 50%, #10b981 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeInUp 0.7s ease 0.2s both, gradientMove 5s ease infinite' }}>
              Weniger Festkosten.
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', fontFamily: F, maxWidth: 580, margin: '0 0 48px', lineHeight: 1.75, animation: 'fadeInUp 0.7s ease 0.3s both' }}>
              Laden Sie Ihre vorqualifizierten Kandidaten hoch und lassen Sie pheweb das Matching übernehmen. Sie verdienen bei jeder erfolgreichen Einstellung — <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>ohne monatliche Fixkosten.</strong>
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease 0.4s both' }}>
              <Link to="/registrieren/recruiter" className="rb-btn" style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 20px rgba(5,150,105,0.5)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Recruiter-Konto anlegen →
              </Link>
              <Link to="/login" style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: 'rgba(148,163,184,0.85)', textDecoration: 'none', padding: '14px 20px', display: 'inline-flex', alignItems: 'center' }}>
                Bereits registriert? Anmelden
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 48, animation: 'fadeIn 0.8s ease 0.6s both' }}>
              {['✓ Keine Fixkosten', '✓ ~32,5 % Provision', '✓ Automatisches Matching'].map(t => (
                <span key={t} style={{ fontSize: 13, color: '#475569', fontFamily: F, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ background: '#ffffff', padding: '100px 28px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div ref={benefits.ref} style={{ textAlign: 'center', marginBottom: 64, opacity: benefits.inView ? 1 : 0, transform: benefits.inView ? 'none' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px' }}>
                Was pheweb für Recruiter leistet
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F, maxWidth: 480, margin: '0 auto' }}>
                Weniger Administration. Mehr Abschlüsse. Volle Transparenz.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
              {[
                { icon: '💶', title: 'Erfolgsbasierte Provision', desc: 'Sie verdienen ~32,5 % des ersten Jahresgehalts bei erfolgreicher Einstellung — kein Fixkostenrisiko, keine monatliche Gebühr.' },
                { icon: '⚡', title: 'Automatisches Matching', desc: 'Kandidaten hochladen, fertig. pheweb matcht sie automatisch mit offenen Unternehmensstellen — 24/7, ohne Ihren Aufwand.' },
                { icon: '📊', title: 'Pipeline-Dashboard', desc: 'Alle Kandidaten, Matches, Statusupdates und Interessensbekundungen auf einem Blick. Kein Excel, keine E-Mail-Suche.' },
                { icon: '🔔', title: 'Echtzeit-Benachrichtigungen', desc: 'Sobald ein Unternehmen Interesse bekundet, werden Sie sofort informiert. Kein wochenlang warten, keine Reaktionszeit-Probleme.' },
                { icon: '🏭', title: 'Fokussierter Markt', desc: 'Elektro, TGA, SHK, Mechatronik — genau da, wo der Fachkräftemangel am stärksten ist und die Nachfrage am höchsten.' },
                { icon: '🤝', title: 'Strukturierter Closing-Prozess', desc: 'Von der Einwilligung bis zur Hiring-Bestätigung — alles dokumentiert auf der Plattform. Revisionssicher, nachvollziehbar.' },
              ].map((b, i) => (
                <div key={b.title} className="rb-card" style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '26px 22px', opacity: benefits.inView ? 1 : 0, transform: benefits.inView ? 'none' : 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease', transitionDelay: `${i * 0.07}s` }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{b.icon}</div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: F, margin: '0 0 8px' }}>{b.title}</h4>
                  <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.65 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section style={{ background: '#f8fafc', padding: '100px 28px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div ref={steps.ref} style={{ textAlign: 'center', marginBottom: 64, opacity: steps.inView ? 1 : 0, transform: steps.inView ? 'none' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px' }}>
                Ihr Recruiter-Workflow bei pheweb
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F }}>Von der Registrierung bis zur Provision in 4 klaren Schritten.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '01', icon: '✅', title: 'Registrieren & verifizieren', desc: 'Konto anlegen, kurze Prüfung durchlaufen. Nach Freischaltung haben Sie sofortigen Zugang zum Dashboard.' },
                { n: '02', icon: '⬆️', title: 'Kandidaten hochladen', desc: 'Berufsbezeichnung, Skills, Erfahrung, Standort, Verfügbarkeit und Gehaltsvorstellung eintragen. Einzeln oder in Batch.' },
                { n: '03', icon: '⚡', title: 'Automatisches Matching', desc: 'pheweb matcht Ihre Kandidaten mit offenen Unternehmensstellen. Bei Interesse erhalten Sie sofort eine Benachrichtigung.' },
                { n: '04', icon: '💶', title: 'Einwilligung einholen & Provision kassieren', desc: 'Sie holen die Kandidaten-Einwilligung ein, koordinieren das Gespräch — und erhalten bei erfolgreicher Einstellung Ihre Provision.' },
              ].map((s, i) => (
                <div key={s.n} style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start', opacity: steps.inView ? 1 : 0, transform: steps.inView ? 'none' : 'translateY(20px)', transition: 'all 0.5s ease', transitionDelay: `${i * 0.1}s` }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(5,150,105,0.35)' }}>{s.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{s.n}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: F }}>{s.title}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing highlight */}
        <section style={{ background: '#ffffff', padding: '100px 28px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div ref={pricing.ref} style={{ opacity: pricing.inView ? 1 : 0, transform: pricing.inView ? 'none' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0', borderRadius: 24, padding: '56px 48px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>💶</div>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px' }}>
                  ~32,5 % Provision
                </h2>
                <p style={{ fontSize: 16, color: '#047857', fontFamily: F, fontWeight: 600, margin: '0 0 24px' }}>
                  des ersten Jahresgehalts bei erfolgreicher Einstellung
                </p>
                <p style={{ fontSize: 15, color: '#64748b', fontFamily: F, margin: '0 0 40px', lineHeight: 1.7 }}>
                  Keine monatlichen Gebühren. Kein Risiko. Sie investieren nur Ihre Zeit — und verdienen, wenn es klappt.
                  Bei einem Jahresgehalt von 50.000 € entspricht das einer Provision von <strong style={{ color: '#059669' }}>16.250 €</strong> pro erfolgreicher Einstellung.
                </p>
                <Link to="/registrieren/recruiter" className="rb-btn" style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 4px 16px rgba(5,150,105,0.4)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Jetzt Recruiter werden →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', padding: '100px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 16px' }}>
              Starten Sie noch heute.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(110,231,183,0.8)', fontFamily: F, margin: '0 0 44px' }}>Konto anlegen dauert 3 Minuten. Kostenlos. Kein Risiko.</p>
            <Link to="/registrieren/recruiter" className="rb-btn" style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: '#059669', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Recruiter-Konto anlegen →
            </Link>
          </div>
        </section>

        <footer style={{ background: '#08091a', padding: '28px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: 13, color: '#334155', fontFamily: F, textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        </footer>
      </div>
    </>
  )
}
