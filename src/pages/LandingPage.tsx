// LandingPage — Next-generation redesign
// Route: /

import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

// ── CSS Animations ─────────────────────────────────────────────────────────────

const Styles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(36px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes floatA {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
      33%      { transform: translate(20px, -30px) rotate(3deg) scale(1.04); }
      66%      { transform: translate(-15px, 15px) rotate(-2deg) scale(0.97); }
    }
    @keyframes floatB {
      0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
      50%      { transform: translate(-25px, -18px) rotate(5deg); }
    }
    @keyframes floatC {
      0%, 100% { transform: translate(0px, 0px); }
      40%      { transform: translate(18px, 22px); }
      80%      { transform: translate(-10px, -8px); }
    }
    @keyframes gradientMove {
      0%, 100% { background-position: 0% 50%; }
      50%      { background-position: 100% 50%; }
    }
    @keyframes badgePulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
      50%       { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
    }
    @keyframes cardFloat {
      0%, 100% { transform: rotate(3deg) translateY(0px); }
      50%      { transform: rotate(3deg) translateY(-12px); }
    }
    @keyframes lineGrow {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes orbRotate {
      from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes borderGlow {
      0%, 100% { border-color: rgba(37,99,235,0.3); }
      50%       { border-color: rgba(99,102,241,0.6); }
    }
    .landing-card-hover {
      transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease !important;
    }
    .landing-card-hover:hover {
      transform: translateY(-6px) !important;
      box-shadow: 0 32px 64px rgba(0,0,0,0.25), 0 8px 20px rgba(37,99,235,0.15) !important;
    }
    .nav-link-hover {
      transition: color 0.15s ease, background 0.15s ease !important;
    }
    .nav-link-hover:hover {
      color: #2563eb !important;
      background: rgba(37,99,235,0.08) !important;
    }
    .btn-primary-hover {
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease !important;
    }
    .btn-primary-hover:hover {
      transform: translateY(-2px) !important;
      filter: brightness(1.1) !important;
      box-shadow: 0 8px 24px rgba(37,99,235,0.5) !important;
    }
    .btn-ghost-hover {
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease !important;
    }
    .btn-ghost-hover:hover {
      background: rgba(255,255,255,0.12) !important;
      border-color: rgba(255,255,255,0.3) !important;
    }
    .feature-card-hover {
      transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease !important;
    }
    .feature-card-hover:hover {
      background: rgba(255,255,255,0.06) !important;
      border-color: rgba(37,99,235,0.4) !important;
      transform: translateY(-3px) !important;
    }
    ::selection {
      background: rgba(37,99,235,0.3);
      color: #f8fafc;
    }
  `}</style>
)

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function useCounter(target: number, duration = 1800, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(target * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, active])
  return val
}

// ── Navigation ─────────────────────────────────────────────────────────────────

function Nav() {
  const scrolled = useScrolled()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? 'rgba(8,12,26,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 28px',
        height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em',
            fontFamily: F, color: '#f1f5f9',
          }}>
            phe<span style={{ color: '#60a5fa' }}>web</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { to: '/fuer-unternehmen', label: 'Für Unternehmen' },
            { to: '/fuer-kandidaten',  label: 'Für Kandidaten'  },
            { to: '/fuer-recruiter',   label: 'Für Recruiter'   },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link-hover"
              style={{
                fontFamily: F, fontSize: 14, fontWeight: 500,
                color: 'rgba(203,213,225,0.85)',
                textDecoration: 'none',
                padding: '8px 14px', borderRadius: 8,
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            to="/login"
            className="nav-link-hover"
            style={{
              fontFamily: F, fontSize: 14, fontWeight: 600,
              color: 'rgba(148,163,184,0.8)',
              textDecoration: 'none', padding: '8px 16px', borderRadius: 8,
            }}
          >
            Anmelden
          </Link>
          <Link
            to="/registrieren/unternehmen"
            className="btn-primary-hover"
            style={{
              fontFamily: F, fontSize: 14, fontWeight: 700,
              color: '#fff', textDecoration: 'none',
              padding: '9px 22px', borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              boxShadow: '0 2px 12px rgba(37,99,235,0.4)',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            Kostenlos starten
          </Link>
        </div>
      </div>
    </nav>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function MockCard() {
  return (
    <div style={{
      background: '#ffffff', borderRadius: 18,
      padding: '20px',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(37,99,235,0.2)',
      border: '1px solid rgba(226,232,240,0.9)',
      width: 300, fontFamily: F,
      animation: 'cardFloat 5s ease-in-out infinite',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 9px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              Top Match
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: 99 }}>
              ✦ Neu
            </span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Senior Elektroingenieur</div>
        </div>
        {/* Mini gauge */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'conic-gradient(from -90deg, #10b981 313deg, #e2e8f0 0deg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>87</span>
            </div>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#10b981', background: '#ecfdf5', borderRadius: 4, padding: '1px 5px' }}>STARK</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#f1f5f9', marginBottom: 12 }} />

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 10px', marginBottom: 12 }}>
        {[
          { label: 'Standort', value: 'München' },
          { label: 'Erfahrung', value: '8 Jahre' },
          { label: 'Bildung', value: 'Studium' },
          { label: 'Verfügbar', value: 'Sofort' },
        ].map(i => (
          <div key={i.label}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{i.label}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{i.value}</div>
          </div>
        ))}
      </div>

      {/* Score bars */}
      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
        {[
          { label: 'Skills', pct: 92 },
          { label: 'Region', pct: 100 },
          { label: 'Gehalt', pct: 78 },
        ].map(b => (
          <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: '#94a3b8', width: 46, flexShrink: 0 }}>{b.label}</span>
            <div style={{ flex: 1, height: 3, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ width: `${b.pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #10b98166, #10b981)' }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', width: 26, textAlign: 'right' }}>{b.pct}%</span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 14 }}>
        {['SPS', 'AutoCAD', 'IEC 61131'].map((s, i) => (
          <span key={s} style={{ fontSize: 10, fontWeight: 500, background: i === 0 ? '#eff6ff' : '#f8fafc', color: i === 0 ? '#2563eb' : '#64748b', border: '1px solid #e2e8f0', borderRadius: 5, padding: '2px 7px' }}>{s}</span>
        ))}
        <span style={{ fontSize: 10, color: '#94a3b8', alignSelf: 'center' }}>+4</span>
      </div>

      {/* CTA */}
      <button style={{
        width: '100%', padding: '10px', borderRadius: 9, border: 'none',
        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
        color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        fontFamily: F, boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
      }}>
        Interesse bekunden
      </button>
    </div>
  )
}

function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      background: 'linear-gradient(155deg, #08091a 0%, #0d1229 45%, #080c1f 100%)',
      position: 'relative', overflow: 'hidden', paddingTop: 68,
    }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '8%', right: '12%',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(79,70,229,0.12) 40%, transparent 70%)',
          animation: 'floatA 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '5%',
          width: 420, height: 420, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          animation: 'floatB 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '55%', right: '30%',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          animation: 'floatC 10s ease-in-out infinite',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 64, alignItems: 'center' }}>

          {/* Left: content */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(37,99,235,0.15)',
              border: '1px solid rgba(96,165,250,0.25)',
              borderRadius: 99, padding: '6px 16px', marginBottom: 36,
              animation: 'fadeIn 0.6s ease forwards',
              animationDelay: '0.1s', opacity: 0,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#60a5fa', animation: 'badgePulse 2.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', fontFamily: F, letterSpacing: '0.02em' }}>
                KI-gestütztes Fachkräfte-Matching für Deutschland
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.045em',
              color: '#f1f5f9', fontFamily: F, margin: '0 0 10px',
              animation: 'fadeInUp 0.7s ease forwards',
              animationDelay: '0.2s', opacity: 0,
            }}>
              Schluss mit
            </h1>
            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.045em',
              fontFamily: F, margin: '0 0 10px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              animation: 'fadeInUp 0.7s ease forwards, gradientMove 5s ease infinite',
              animationDelay: '0.25s, 0s', opacity: 0,
            }}>
              monatelanger Suche.
            </h1>
            <h1 style={{
              fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800,
              lineHeight: 1.08, letterSpacing: '-0.045em',
              color: '#e2e8f0', fontFamily: F, margin: '0 0 28px',
              animation: 'fadeInUp 0.7s ease forwards',
              animationDelay: '0.3s', opacity: 0,
            }}>
              Willkommen bei pheweb.
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 18, color: '#94a3b8', fontFamily: F,
              maxWidth: 540, margin: '0 0 48px', lineHeight: 1.75,
              animation: 'fadeInUp 0.7s ease forwards',
              animationDelay: '0.4s', opacity: 0,
            }}>
              Die spezialisierte Plattform für <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>Elektro, TGA, SHK und Mechatronik</strong> —
              mit präzisem Matching, vollständiger Anonymität und transparenten Scores.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              animation: 'fadeInUp 0.7s ease forwards',
              animationDelay: '0.5s', opacity: 0,
            }}>
              <Link
                to="/registrieren/unternehmen"
                className="btn-primary-hover"
                style={{
                  fontFamily: F, fontSize: 15, fontWeight: 700,
                  color: '#fff', textDecoration: 'none',
                  padding: '14px 28px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.45)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <span>Als Unternehmen starten</span>
                <span style={{ fontSize: 16 }}>→</span>
              </Link>
              <Link
                to="/registrieren/kandidat"
                className="btn-ghost-hover"
                style={{
                  fontFamily: F, fontSize: 15, fontWeight: 600,
                  color: '#cbd5e1', textDecoration: 'none',
                  padding: '14px 28px', borderRadius: 12,
                  border: '1px solid rgba(203,213,225,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                <span>Als Kandidat bewerben</span>
              </Link>
            </div>

            {/* Trust icons */}
            <div style={{
              display: 'flex', gap: 24, marginTop: 44, alignItems: 'center', flexWrap: 'wrap',
              animation: 'fadeIn 0.8s ease forwards',
              animationDelay: '0.7s', opacity: 0,
            }}>
              {[
                { icon: '🛡️', text: 'DSGVO-konform' },
                { icon: '🔒', text: 'Vollständig anonym' },
                { icon: '🇩🇪', text: 'Made in Germany' },
              ].map(t => (
                <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 14 }}>{t.icon}</span>
                  <span style={{ fontSize: 13, color: '#475569', fontFamily: F, fontWeight: 500 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: floating mockup */}
          <div style={{
            flexShrink: 0,
            animation: 'fadeIn 1s ease forwards',
            animationDelay: '0.6s', opacity: 0,
          }}>
            <MockCard />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(to bottom, transparent, #f8fafc)',
        pointerEvents: 'none',
      }} />
    </section>
  )
}

// ── Stats ──────────────────────────────────────────────────────────────────────

function Stats() {
  const { ref, inView } = useInView(0.3)
  const c1 = useCounter(500, 1600, inView)
  const c2 = useCounter(98, 1400, inView)
  const c3 = useCounter(32, 1200, inView)
  const c4 = useCounter(3, 1000, inView)

  return (
    <section style={{ background: '#f8fafc', padding: '64px 28px', borderBottom: '1px solid #e2e8f0' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
        {[
          { n: `${c1}+`, label: 'Vorqualifizierte Kandidaten', color: '#2563eb' },
          { n: `${c2} %`, label: 'Ø Match-Rate',               color: '#059669' },
          { n: `${c3} %`, label: 'Schnellere Besetzung',        color: '#7c3aed' },
          { n: `${c4}×`,  label: 'Mehr relevante Bewerbungen',  color: '#d97706' },
        ].map((s, i) => (
          <div
            key={s.label}
            style={{
              textAlign: 'center',
              animation: inView ? `countUp 0.6s ease forwards` : 'none',
              animationDelay: `${i * 0.1}s`, opacity: inView ? undefined : 0,
            }}
          >
            <div style={{
              fontSize: 44, fontWeight: 800, fontFamily: F,
              letterSpacing: '-0.04em', lineHeight: 1, color: s.color,
            }}>
              {s.n}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontFamily: F, marginTop: 6, fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Audience Section ───────────────────────────────────────────────────────────

function AudienceCard({
  delay, icon, title, tagline, color, colorBg, colorBd, bullets, primary, primaryTo, secondary, secondaryTo,
}: {
  delay: number; icon: string; title: string; tagline: string
  color: string; colorBg: string; colorBd: string; bullets: string[]
  primary: string; primaryTo: string; secondary: string; secondaryTo: string
}) {
  const { ref, inView } = useInView(0.15)

  return (
    <div
      ref={ref}
      className="landing-card-hover"
      style={{
        background: '#ffffff', borderRadius: 24,
        border: `1px solid ${colorBd}`,
        padding: '36px 30px',
        boxShadow: `0 4px 24px rgba(15,23,42,0.07), 0 0 0 1px ${colorBd}33`,
        display: 'flex', flexDirection: 'column',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        transitionDelay: `${delay}s`,
      }}
    >
      {/* Icon ring */}
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: `linear-gradient(135deg, ${colorBg}, ${colorBd}66)`,
        border: `1.5px solid ${colorBd}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, marginBottom: 22,
        boxShadow: `0 4px 12px ${color}20`,
      }}>
        {icon}
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 24, fontWeight: 800, color: '#0f172a',
        fontFamily: F, margin: '0 0 6px', letterSpacing: '-0.025em',
      }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: color, fontFamily: F, fontWeight: 600, margin: '0 0 22px' }}>
        {tagline}
      </p>

      {/* Bullets */}
      <ul style={{ margin: '0 0 30px', padding: 0, listStyle: 'none', flex: 1 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 11, fontSize: 14, color: '#475569', fontFamily: F, lineHeight: 1.5, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, marginTop: 3,
              width: 16, height: 16, borderRadius: '50%',
              background: colorBg, border: `1.5px solid ${colorBd}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Link
          to={primaryTo}
          className="btn-primary-hover"
          style={{
            flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
            color: '#fff', textDecoration: 'none',
            padding: '12px 16px', borderRadius: 11, textAlign: 'center',
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            boxShadow: `0 3px 10px ${color}40`,
          }}
        >
          {primary}
        </Link>
        <Link
          to={secondaryTo}
          style={{
            fontFamily: F, fontSize: 14, fontWeight: 600,
            color: color, textDecoration: 'none',
            padding: '12px 16px', borderRadius: 11,
            background: colorBg, border: `1px solid ${colorBd}`,
            whiteSpace: 'nowrap',
            transition: 'filter 0.2s ease',
          }}
        >
          {secondary}
        </Link>
      </div>
    </div>
  )
}

function AudienceSection() {
  const { ref, inView } = useInView(0.1)

  return (
    <section style={{ background: '#f8fafc', padding: '100px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div
          ref={ref}
          style={{
            textAlign: 'center', marginBottom: 64,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#2563eb', fontFamily: F,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 99, padding: '5px 14px', display: 'inline-block', marginBottom: 20,
          }}>
            Drei Nutzergruppen · Eine Plattform
          </span>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px',
          }}>
            Für wen ist pheweb?
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', fontFamily: F, maxWidth: 520, margin: '0 auto' }}>
            Ob Sie einstellen, eingestellt werden oder vermitteln wollen — pheweb deckt alle drei Seiten des Markts ab.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <AudienceCard
            delay={0}
            icon="🏢" title="Unternehmen" tagline="Matches, die wirklich passen."
            color="#2563eb" colorBg="#eff6ff" colorBd="#bfdbfe"
            bullets={[
              'Score-basierte Kandidaten-Empfehlungen für jede Stelle',
              'Vollständig anonymisiert bis zur beidseitigen Einwilligung',
              'Aufgeschlüsselte Match-Scores — transparent und nachvollziehbar',
              'Shortlist, filtern, Interesse bekunden — alles in einem Dashboard',
            ]}
            primary="Stelle anlegen" primaryTo="/registrieren/unternehmen"
            secondary="Mehr erfahren" secondaryTo="/fuer-unternehmen"
          />
          <AudienceCard
            delay={0.1}
            icon="👤" title="Kandidaten" tagline="Ihre nächste Stelle findet Sie."
            color="#7c3aed" colorBg="#f5f3ff" colorBd="#ddd6fe"
            bullets={[
              '100 % kostenlos — immer und für alle Kandidaten',
              'Profil anlegen und von Recruitern entdeckt werden',
              'Anonym bis Sie explizit zustimmen — keine Überraschungen',
              'Verfügbarkeit selbst bestimmen: sofort, in Monaten oder flexibel',
            ]}
            primary="Profil erstellen" primaryTo="/registrieren/kandidat"
            secondary="Mehr erfahren" secondaryTo="/fuer-kandidaten"
          />
          <AudienceCard
            delay={0.2}
            icon="🔍" title="Recruiter" tagline="Skalieren Sie ohne Festkosten."
            color="#059669" colorBg="#ecfdf5" colorBd="#a7f3d0"
            bullets={[
              'Kandidaten hochladen und automatisch matchen lassen',
              'Provision nur bei erfolgreicher Einstellung — kein Fixkostenrisiko',
              'Pipeline-Dashboard für alle Kandidaten und laufende Matches',
              'Echtzeit-Benachrichtigungen bei jedem Interesse-Signal',
            ]}
            primary="Recruiter werden" primaryTo="/registrieren/recruiter"
            secondary="Mehr erfahren" secondaryTo="/fuer-recruiter"
          />
        </div>
      </div>
    </section>
  )
}

// ── How It Works ───────────────────────────────────────────────────────────────

function HowItWorks() {
  const { ref, inView } = useInView(0.1)

  const steps = [
    { n: '01', icon: '✏️', title: 'Profil anlegen', desc: 'Unternehmen erfassen offene Stellen, Kandidaten ihr Profil — Recruiter laden vorqualifizierte Talente hoch. In Minuten.' },
    { n: '02', icon: '⚡', title: 'Automatisches Matching', desc: 'Unser Algorithmus berechnet Scores für Skills, Erfahrung, Standort, Verfügbarkeit und Gehalt — vollautomatisch.' },
    { n: '03', icon: '🔒', title: 'Anonymes Browsing', desc: 'Unternehmen sehen Kandidaten-Karten ohne persönliche Daten. DSGVO-konform by design, kein Risiko.' },
    { n: '04', icon: '🤝', title: 'Einwilligung & Kontakt', desc: 'Bei Interesse wird der Recruiter informiert, holt die Kandidaten-Einwilligung ein und koordiniert das erste Gespräch.' },
  ]

  return (
    <section style={{ background: '#ffffff', padding: '100px 28px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div
          ref={ref}
          style={{
            textAlign: 'center', marginBottom: 72,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#7c3aed', fontFamily: F,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            background: '#f5f3ff', border: '1px solid #ddd6fe',
            borderRadius: 99, padding: '5px 14px', display: 'inline-block', marginBottom: 20,
          }}>
            Der Prozess
          </span>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
            letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px',
          }}>
            Von null auf Vorstellungsgespräch
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', fontFamily: F, maxWidth: 480, margin: '0 auto' }}>
            Vier Schritte. Kein Chaos. Maximale Transparenz.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute', top: 52, left: '12.5%', right: '12.5%', height: 2,
            background: 'linear-gradient(90deg, #eff6ff, #2563eb 50%, #eff6ff)',
            zIndex: 0,
            transformOrigin: 'left',
            animation: inView ? 'lineGrow 1s ease forwards' : 'none',
            animationDelay: '0.3s',
          }} />

          {steps.map((s, i) => (
            <div
              key={s.n}
              style={{
                textAlign: 'center', padding: '0 20px',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                transitionDelay: `${0.1 + i * 0.12}s`,
                position: 'relative', zIndex: 1,
              }}
            >
              {/* Step circle */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                border: '3px solid #ffffff',
                boxShadow: '0 0 0 4px #eff6ff, 0 8px 24px rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: 22,
              }}>
                {s.icon}
              </div>

              <span style={{
                fontSize: 11, fontWeight: 800, color: '#2563eb', fontFamily: 'monospace',
                background: '#eff6ff', border: '1px solid #bfdbfe',
                borderRadius: 6, padding: '3px 8px', marginBottom: 12, display: 'inline-block',
              }}>
                {s.n}
              </span>
              <h4 style={{
                fontSize: 17, fontWeight: 700, color: '#0f172a',
                fontFamily: F, margin: '10px 0 10px', letterSpacing: '-0.015em',
              }}>
                {s.title}
              </h4>
              <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, lineHeight: 1.65, margin: 0 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features (dark) ────────────────────────────────────────────────────────────

function FeaturesSection() {
  const { ref, inView } = useInView(0.1)

  const features = [
    { icon: '🎯', title: 'Präzises KI-Matching', desc: 'Fünf-dimensionaler Algorithmus: Skills, Erfahrung, Region, Verfügbarkeit, Gehalt. Kein Raten — nur Daten.' },
    { icon: '🛡️', title: 'DSGVO by Design', desc: 'Anonymisierung ist kein Feature — es ist die Architektur. Bis zur beidseitigen Zustimmung bleiben Kandidaten unsichtbar.' },
    { icon: '📊', title: 'Transparente Scores', desc: 'Jede Empfehlung kommt mit aufgeschlüsseltem Match-Score. Volle Nachvollziehbarkeit statt Black Box.' },
    { icon: '⚡', title: 'Echtzeit-Signale', desc: 'Interesse bekundet? Der Recruiter weiß es sofort. Kein Postfach-Chaos, kein Warten, keine vergessenen Kandidaten.' },
    { icon: '🏭', title: 'Spezialisiert, nicht generisch', desc: 'Elektro, TGA, SHK, Mechatronik. Kein Monster-Jobboard mit Millionen Kandidaten — sondern Qualität statt Quantität.' },
    { icon: '💶', title: 'Erfolgsbasierte Abrechnung', desc: 'Recruiter zahlen nichts bis zur Einstellung. Unternehmen investieren nur wenn es klappt. Win-win-win.' },
    { icon: '⭐', title: 'Shortlist & Pipeline', desc: 'Kandidaten vormerken, filtern, Status tracken — alles in einem übersichtlichen Dashboard ohne Excel-Hölle.' },
    { icon: '🔔', title: 'Smarte Benachrichtigungen', desc: 'Nur relevante Benachrichtigungen. Kein Spam. Sie werden informiert, wenn es zählt.' },
    { icon: '🤝', title: 'Strukturierter Prozess', desc: 'Von der Einwilligung bis zum Hiring — alles dokumentiert, nachvollziehbar und revisionssicher auf der Plattform.' },
  ]

  return (
    <section style={{
      background: 'linear-gradient(160deg, #08091a 0%, #0d1229 60%, #080c1f 100%)',
      padding: '100px 28px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)', animation: 'floatA 16s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', animation: 'floatB 20s ease-in-out infinite' }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div
          ref={ref}
          style={{
            textAlign: 'center', marginBottom: 72,
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#34d399', fontFamily: F,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            background: 'rgba(5,150,105,0.15)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 99, padding: '5px 14px', display: 'inline-block', marginBottom: 20,
          }}>
            Warum pheweb?
          </span>
          <h2 style={{
            fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#f1f5f9',
            letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 14px',
          }}>
            Gebaut für den Ernst des Lebens
          </h2>
          <p style={{ fontSize: 17, color: '#64748b', fontFamily: F, maxWidth: 480, margin: '0 auto' }}>
            Nicht noch eine Job-Plattform. Eine Infrastruktur für professionelle Personalvermittlung.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card-hover"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '24px 22px',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: `${0.05 * i}s`,
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 12 }}>{f.icon}</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
                {f.title}
              </h4>
              <p style={{ fontSize: 13, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Branchen ───────────────────────────────────────────────────────────────────

function BranchenBanner() {
  const { ref, inView } = useInView(0.2)

  return (
    <section style={{ background: '#f8fafc', padding: '64px 28px', borderTop: '1px solid #e2e8f0' }}>
      <div ref={ref} style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#94a3b8', fontFamily: F,
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 28,
        }}>
          Spezialisiert auf technische Fachberufe
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          {[
            { icon: '⚡', label: 'Elektrotechnik', color: '#d97706', bg: '#fefce8', bd: '#fde68a' },
            { icon: '🏗️', label: 'TGA', color: '#2563eb', bg: '#eff6ff', bd: '#bfdbfe' },
            { icon: '💧', label: 'SHK', color: '#0891b2', bg: '#ecfeff', bd: '#a5f3fc' },
            { icon: '🔧', label: 'Mechatronik', color: '#7c3aed', bg: '#f5f3ff', bd: '#ddd6fe' },
          ].map((b, i) => (
            <div
              key={b.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 15, fontWeight: 600, color: b.color, fontFamily: F,
                background: b.bg, border: `1px solid ${b.bd}`,
                borderRadius: 14, padding: '14px 24px',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              <span style={{ fontSize: 22 }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────

function CTABanner() {
  const { ref, inView } = useInView(0.2)

  return (
    <section style={{ background: '#ffffff', padding: '100px 28px' }}>
      <div
        ref={ref}
        style={{
          maxWidth: 860, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 40%, #4f46e5 100%)',
          borderRadius: 28, padding: '72px 48px',
          boxShadow: '0 32px 80px rgba(37,99,235,0.4), 0 4px 20px rgba(37,99,235,0.2)',
          position: 'relative', overflow: 'hidden',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(40px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {/* Decoration */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-5%', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'rgba(191,219,254,0.9)', fontFamily: F,
            textTransform: 'uppercase', letterSpacing: '0.12em',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 99, padding: '5px 14px', display: 'inline-block', marginBottom: 24,
          }}>
            Jetzt loslegen
          </span>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#ffffff',
            letterSpacing: '-0.035em', fontFamily: F, margin: '0 0 16px',
          }}>
            Bereit für Personalvermittlung <br />der nächsten Generation?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(191,219,254,0.85)', fontFamily: F, margin: '0 0 44px', lineHeight: 1.65 }}>
            Registrieren Sie sich in unter 3 Minuten. Keine Kreditkarte, kein Risiko, kein Kleingedrucktes.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link
              to="/registrieren/unternehmen"
              className="btn-primary-hover"
              style={{
                fontFamily: F, fontSize: 15, fontWeight: 700,
                color: '#1d4ed8', textDecoration: 'none',
                padding: '14px 28px', borderRadius: 12,
                background: '#ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Für Unternehmen starten
            </Link>
            <Link
              to="/registrieren/kandidat"
              className="btn-ghost-hover"
              style={{
                fontFamily: F, fontSize: 15, fontWeight: 600,
                color: '#ffffff', textDecoration: 'none',
                padding: '14px 28px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.1)',
              }}
            >
              Kandidaten-Profil anlegen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      background: '#08091a',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '64px 28px 36px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 40, marginBottom: 56, flexWrap: 'wrap' }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.05em', fontFamily: F, color: '#f1f5f9' }}>
                phe<span style={{ color: '#60a5fa' }}>web</span>
              </span>
            </Link>
            <p style={{ fontSize: 14, color: '#475569', fontFamily: F, margin: '16px 0 0', lineHeight: 1.7, maxWidth: 280 }}>
              Deutschlands spezialisierte Plattform für technische Fachkräfte. DSGVO-konform, transparent, effizient.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['DSGVO', 'Made in DE', 'SSL'].map(b => (
                <span key={b} style={{ fontSize: 11, fontWeight: 700, color: '#334155', fontFamily: F, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 10px' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          <FooterCol title="Plattform" links={[
            { label: 'Für Unternehmen', to: '/fuer-unternehmen' },
            { label: 'Für Kandidaten',  to: '/fuer-kandidaten'  },
            { label: 'Für Recruiter',   to: '/fuer-recruiter'   },
          ]} />
          <FooterCol title="Konto" links={[
            { label: 'Anmelden',              to: '/login'                    },
            { label: 'Unternehmen registrieren', to: '/registrieren/unternehmen' },
            { label: 'Kandidat registrieren',   to: '/registrieren/kandidat'    },
            { label: 'Recruiter registrieren',  to: '/registrieren/recruiter'   },
          ]} />
          <FooterCol title="Branchen" links={[
            { label: 'Elektrotechnik', to: '/fuer-unternehmen' },
            { label: 'TGA',            to: '/fuer-unternehmen' },
            { label: 'SHK',            to: '/fuer-unternehmen' },
            { label: 'Mechatronik',    to: '/fuer-unternehmen' },
          ]} />
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 28,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: '#334155', fontFamily: F }}>
            © {new Date().getFullYear()} pheweb GmbH — Alle Rechte vorbehalten
          </span>
          <Link to="/admin" style={{ fontSize: 12, color: '#1e293b', fontFamily: F, textDecoration: 'none', opacity: 0.4 }}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        {title}
      </div>
      {links.map(l => (
        <Link
          key={l.to + l.label}
          to={l.to}
          style={{ display: 'block', fontSize: 14, color: '#334155', fontFamily: F, textDecoration: 'none', marginBottom: 10, transition: 'color 0.15s ease' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#60a5fa')}
          onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Styles />
      <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
        <Nav />
        <Hero />
        <Stats />
        <AudienceSection />
        <HowItWorks />
        <FeaturesSection />
        <BranchenBanner />
        <CTABanner />
        <Footer />
      </div>
    </>
  )
}
