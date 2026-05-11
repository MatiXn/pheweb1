// FuerKandidatenPage — Für Kandidaten
// Route: /fuer-kandidaten

import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav'
import {
  IcoFree, IcoLock, IcoCheck, IcoCheckCircle, IcoPin, IcoChart,
  IcoPhone, IcoSearch, IcoShield,
} from '../components/icons'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const Styles = () => (
  <style>{`
    @keyframes fadeInUp { from{opacity:0;transform:translateY(36px);}to{opacity:1;transform:translateY(0);} }
    @keyframes fadeIn   { from{opacity:0;}to{opacity:1;} }
    @keyframes floatB   { 0%,100%{transform:translate(0,0);}50%{transform:translate(-22px,-18px);} }
    @keyframes gradientMove { 0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;} }
    .kb-card { transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important; }
    .kb-card:hover { transform: translateY(-5px) !important; box-shadow: 0 24px 56px rgba(15,23,42,0.12), 0 4px 16px rgba(124,58,237,0.12) !important; border-color: #ddd6fe !important; }
    .kb-btn { transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease !important; }
    .kb-btn:hover { transform: translateY(-2px) !important; filter: brightness(1.1) !important; box-shadow: 0 8px 24px rgba(124,58,237,0.5) !important; }
  `}</style>
)

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null); const [inView, setInView] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold }); obs.observe(el); return () => obs.disconnect() }, [threshold])
  return { ref, inView }
}

export default function FuerKandidatenPage() {
  const benefits = useInView(); const steps = useInView(); const faq = useInView()

  return (
    <>
      <Styles />
      <div style={{ minHeight: '100vh', fontFamily: F, overflowX: 'hidden' }}>
        <PublicNav />

        {/* Hero */}
        <section style={{ background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)', padding: '140px 28px 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', animation: 'floatB 16s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px)`, backgroundSize: '52px 52px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 20%, transparent 100%)' }} />
          </div>

          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 32, animation: 'fadeIn 0.6s ease forwards' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c4b5fd' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd', fontFamily: F }}>Für Kandidaten — 100 % kostenlos</span>
            </div>

            <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', color: '#f1f5f9', fontFamily: F, margin: '0 0 10px', animation: 'fadeInUp 0.7s ease 0.15s both' }}>Ihre nächste Stelle</h1>
            <h1 style={{ fontSize: 'clamp(38px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.045em', fontFamily: F, margin: '0 0 28px', background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #818cf8 100%)', backgroundSize: '200% 200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'fadeInUp 0.7s ease 0.2s both, gradientMove 5s ease infinite' }}>
              findet Sie.
            </h1>

            <p style={{ fontSize: 18, color: '#94a3b8', fontFamily: F, maxWidth: 580, margin: '0 0 48px', lineHeight: 1.75, animation: 'fadeInUp 0.7s ease 0.3s both' }}>
              Erstellen Sie einmalig Ihr Profil. Erfahrene Recruiter stellen Sie passenden Unternehmen vor — <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>anonym, kostenlos und ohne aktive Jobsuche.</strong>
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease 0.4s both' }}>
              <Link to="/kandidat/anfrage" className="kb-btn" style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Jetzt vermitteln lassen →
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 24, marginTop: 48, animation: 'fadeIn 0.8s ease 0.6s both' }}>
              {['✓ Kostenlos für immer', '✓ Anonym bis zur Einwilligung', '✓ Sie behalten die Kontrolle'].map(t => (
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
                Warum Kandidaten pheweb wählen
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F, maxWidth: 480, margin: '0 auto' }}>
                Kein Bewerbungsstress. Keine Überraschungen. Nur relevante Chancen.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
              {[
                { icon: <IcoFree />,       title: '100 % kostenlos', desc: 'Für Kandidaten ist pheweb kostenlos — ohne Tricks, ohne versteckte Gebühren, ohne Abo. Immer.' },
                { icon: <IcoLock />,       title: 'Anonym bis Sie zustimmen', desc: 'Kein Arbeitgeber sieht Ihren Namen oder Ihre Kontaktdaten, bevor Sie explizit einwilligen. Datenschutz als Grundprinzip.' },
                { icon: <IcoCheck />,      title: 'Professionelle Recruiter', desc: 'Erfahrene externe Recruiter betreuen Sie aktiv und präsentieren Sie optimal — kein Cold-Call-Spam, echte Beziehungen.' },
                { icon: <IcoCheckCircle />, title: 'Ihr Tempo, Ihre Kontrolle', desc: 'Sofort, in einem Monat, oder flexibel — Sie geben die Verfügbarkeit vor. Sie können jederzeit pausieren.' },
                { icon: <IcoPin />,        title: 'Nur passende Regionen', desc: 'Nur Unternehmen in Ihrer Wunschregion sehen Ihr Profil. Keine bundesweiten Anfragen, wenn Sie lokal suchen.' },
                { icon: <IcoChart />,      title: 'Sehen Sie Ihre Matches', desc: 'Transparenz auf beiden Seiten: Sie sehen, wie gut Ihr Profil zu offenen Stellen passt — mit aufgeschlüsselten Scores.' },
              ].map((b, i) => (
                <div key={b.title} className="kb-card" style={{ background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0', padding: '26px 22px', opacity: benefits.inView ? 1 : 0, transform: benefits.inView ? 'none' : 'translateY(24px)', transition: 'opacity 0.5s ease, transform 0.5s ease', transitionDelay: `${i * 0.07}s` }}>
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
                In 4 Schritten zur neuen Stelle
              </h2>
              <p style={{ fontSize: 16, color: '#64748b', fontFamily: F }}>Einmal einrichten, dauerhaft profitieren.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '01', icon: <IcoPhone />,       title: 'Kurzes Kennenlerngespräch', desc: 'Anfrage absenden. Wir rufen Sie innerhalb von 24h an — ein 15–25 Min. Gespräch, um Sie und Ihre Wünsche kennenzulernen.' },
                { n: '02', icon: <IcoSearch />,      title: 'Recruiter nimmt Sie auf', desc: 'Ein erfahrener Recruiter prüft Ihr Profil, nimmt Sie in seine Pipeline auf und bereitet Ihre Vorstellung aktiv vor.' },
                { n: '03', icon: <IcoShield />,      title: 'Anonymes Matching', desc: 'Ihr Profil wird anonymisiert passenden Unternehmen präsentiert — ohne Namen, ohne Foto, ohne Kontaktdaten.' },
                { n: '04', icon: <IcoCheckCircle />, title: 'Einwilligung & Vorstellungsgespräch', desc: 'Wenn ein Unternehmen Interesse bekundet und Sie zustimmen, werden Ihre Kontaktdaten freigegeben. Sie haben das letzte Wort.' },
              ].map((s, i) => (
                <div key={s.n} style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '22px 26px', display: 'flex', gap: 20, alignItems: 'flex-start', opacity: steps.inView ? 1 : 0, transform: steps.inView ? 'none' : 'translateY(20px)', transition: 'all 0.5s ease', transitionDelay: `${i * 0.1}s` }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>{s.icon}</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 6, padding: '3px 8px', fontFamily: 'monospace' }}>{s.n}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', fontFamily: F }}>{s.title}</span>
                    </div>
                    <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.65 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CV Generator Teaser */}
        <section style={{ background: '#f8fafc', padding: '80px 28px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 55%, #7c3aed 100%)',
              borderRadius: 24, padding: '52px 52px', overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32,
            }}>
              {/* BG orb */}
              <div style={{ position: 'absolute', top: '-40%', right: '-5%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, padding: '5px 14px', marginBottom: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(233,213,255,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: F }}>
                    Neues Feature · Kostenlos
                  </span>
                </div>
                <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px' }}>
                  Lebenslauf in 5 Minuten erstellen
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(196,181,253,0.85)', fontFamily: F, margin: '0 0 28px', lineHeight: 1.7 }}>
                  Unser kostenloser Lebenslauf-Generator führt Sie Schritt für Schritt durch alle Abschnitte — mit Live-Vorschau und direktem PDF-Download. Kein Konto nötig.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                  <Link
                    to="/lebenslauf-erstellen"
                    style={{
                      fontFamily: F, fontSize: 14, fontWeight: 700, color: '#6d28d9',
                      textDecoration: 'none', background: '#fff',
                      padding: '12px 24px', borderRadius: 12,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      display: 'inline-block',
                    }}
                  >
                    Lebenslauf erstellen →
                  </Link>
                </div>
              </div>
              {/* Mini CV mock */}
              <div style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                background: '#fff', borderRadius: 12, padding: '20px 22px', width: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}>
                <div style={{ height: 10, background: '#6d28d9', borderRadius: 4, marginBottom: 8, width: '80%' }} />
                <div style={{ height: 7, background: '#a78bfa', borderRadius: 3, marginBottom: 16, width: '55%' }} />
                {['Berufserfahrung', 'Ausbildung', 'Fähigkeiten'].map(s => (
                  <div key={s} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 5, paddingBottom: 3, borderBottom: '1.5px solid #ede9fe', fontFamily: F }}>{s}</div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, marginBottom: 4, width: '90%' }} />
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, width: '70%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: '#ffffff', padding: '100px 28px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div ref={faq.ref} style={{ textAlign: 'center', marginBottom: 56, opacity: faq.inView ? 1 : 0, transform: faq.inView ? 'none' : 'translateY(30px)', transition: 'all 0.6s ease' }}>
              <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 14px' }}>Häufige Fragen</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { q: 'Ist pheweb wirklich kostenlos?', a: 'Ja, vollständig. Für Kandidaten entstehen keine Kosten — weder jetzt noch in Zukunft. Die Plattform finanziert sich durch Recruiter-Provisionen bei erfolgreichen Einstellungen.' },
                { q: 'Wer sieht mein Profil?', a: 'Nur zugelassene externe Recruiter und — nach Ihrem expliziten OK — die jeweiligen Unternehmen. Bis zu Ihrer Einwilligung sind alle persönlichen Daten vollständig anonym.' },
                { q: 'Kann ich jederzeit aufhören?', a: 'Natürlich. Sie können Ihren Status jederzeit auf "nicht verfügbar" setzen oder Ihr Profil löschen. Kein Vertrag, keine Frist.' },
                { q: 'Welche Branchen sind abgedeckt?', a: 'pheweb spezialisiert sich auf Elektrotechnik, TGA, SHK und Mechatronik — also genau die technischen Fachbereiche, in denen der Fachkräftemangel am größten ist.' },
              ].map((item, i) => (
                <div key={i} style={{ background: '#f8fafc', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 22px', opacity: faq.inView ? 1 : 0, transform: faq.inView ? 'none' : 'translateY(16px)', transition: 'all 0.4s ease', transitionDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', fontFamily: F, marginBottom: 8 }}>{item.q}</div>
                  <div style={{ fontSize: 14, color: '#64748b', fontFamily: F, lineHeight: 1.65 }}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', padding: '100px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 16px' }}>
              Ihre nächste Stelle wartet.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(196,181,253,0.85)', fontFamily: F, margin: '0 0 44px' }}>Anfrage in 2 Minuten. Kein Account. Kein Risiko.</p>
            <Link to="/kandidat/anfrage" className="kb-btn" style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: '#7c3aed', textDecoration: 'none', padding: '16px 36px', borderRadius: 14, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Jetzt vermitteln lassen →
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
