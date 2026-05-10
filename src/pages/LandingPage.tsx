// LandingPage — Hauptseite / Marketing-Startseite
// Route: /

import { useState } from 'react'
import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:   '#2563eb',
  accentDk: '#1d4ed8',
  text:     '#0f172a',
  muted:    '#475569',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
  bg:       '#f8fafc',
  navy:     '#0f172a',
  green:    '#059669',
  greenBg:  '#ecfdf5',
}

// ── Nav ────────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      borderBottom: `1px solid ${C.border}`,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1140, margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F, color: C.navy }}>
            phe<span style={{ color: C.accent }}>web</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: F }}>
          <NavLink to="/fuer-unternehmen" label="Für Unternehmen" />
          <NavLink to="/fuer-kandidaten"  label="Für Kandidaten"  />
          <NavLink to="/fuer-recruiter"   label="Für Recruiter"   />
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{
            fontFamily: F, fontSize: 14, fontWeight: 600,
            color: C.muted, textDecoration: 'none',
            padding: '8px 16px',
          }}>
            Anmelden
          </Link>
          <Link to="/registrieren/unternehmen" style={{
            fontFamily: F, fontSize: 14, fontWeight: 700,
            color: C.white, textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`,
            boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
          }}>
            Kostenlos starten
          </Link>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, label }: { to: string; label: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: F, fontSize: 14, fontWeight: 500,
        color: hovered ? C.accent : C.muted,
        textDecoration: 'none',
        padding: '8px 14px', borderRadius: 8,
        background: hovered ? '#eff6ff' : 'transparent',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </Link>
  )
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section style={{
      paddingTop: 128, paddingBottom: 96,
      background: `linear-gradient(160deg, ${C.navy} 0%, #1e293b 50%, #0f172a 100%)`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decoration orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-8%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }} />
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1, textAlign: 'center' }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.3)',
          borderRadius: 99, padding: '6px 16px', marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#93c5fd', fontFamily: F, letterSpacing: '0.02em' }}>
            Digitale Fachkräfte-Vermittlung für Deutschland
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800,
          lineHeight: 1.1, letterSpacing: '-0.04em',
          color: '#f1f5f9', fontFamily: F,
          margin: '0 0 24px',
        }}>
          Die Plattform für<br />
          <span style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            qualifizierte Fachkräfte
          </span>
        </h1>

        <p style={{
          fontSize: 18, color: '#94a3b8', fontFamily: F,
          maxWidth: 580, margin: '0 auto 48px', lineHeight: 1.7,
        }}>
          Elektro, TGA, SHK und Mechatronik — pheweb verbindet Unternehmen,
          vorqualifizierte Kandidaten und externe Recruiter auf einer digitalen Plattform.
          Automatisches Matching, vollständig DSGVO-konform.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/registrieren/unternehmen" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700,
            color: C.white, textDecoration: 'none',
            padding: '14px 28px', borderRadius: 12,
            background: `linear-gradient(135deg, ${C.accent} 0%, #3b82f6 100%)`,
            boxShadow: '0 4px 16px rgba(37,99,235,0.4)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Als Unternehmen starten
          </Link>
          <Link to="/registrieren/kandidat" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700,
            color: '#e2e8f0', textDecoration: 'none',
            padding: '14px 28px', borderRadius: 12,
            border: '1px solid rgba(226,232,240,0.2)',
            background: 'rgba(255,255,255,0.06)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Als Kandidat bewerben
          </Link>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 48,
          marginTop: 72, flexWrap: 'wrap',
        }}>
          {[
            { value: '500+', label: 'Aktive Kandidaten' },
            { value: '98 %', label: 'Match-Rate' },
            { value: '3×',   label: 'Schnellere Besetzung' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', fontFamily: F, letterSpacing: '-0.04em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', fontFamily: F, marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Audience Cards ─────────────────────────────────────────────────────────────

function AudienceCards() {
  return (
    <section style={{ background: C.bg, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontSize: 36, fontWeight: 800, color: C.text,
            letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px',
          }}>
            Für wen ist pheweb?
          </h2>
          <p style={{ fontSize: 16, color: C.muted, fontFamily: F, margin: 0 }}>
            Drei Nutzergruppen — eine integrierte Plattform.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          <AudienceCard
            icon="🏢"
            title="Unternehmen"
            color={C.accent}
            colorBg="#eff6ff"
            colorBd="#bfdbfe"
            bullets={[
              'Anonymisierte Kandidaten-Empfehlungen',
              'Score-basiertes Matching für Ihre Stellen',
              'Interesse bekunden — Recruiter kontaktiert Sie',
              'Transparente Kosten, kein Risiko',
            ]}
            cta="Stellen anlegen"
            ctaTo="/registrieren/unternehmen"
            detail="/fuer-unternehmen"
          />
          <AudienceCard
            icon="👤"
            title="Kandidaten"
            color="#7c3aed"
            colorBg="#f5f3ff"
            colorBd="#ddd6fe"
            bullets={[
              'Kostenlose Registrierung & Profil-Erstellung',
              'Vorqualifizierung durch erfahrene Recruiter',
              'Anonymität bis zur beidseitigen Zustimmung',
              'Aktive Stellenangebote in Ihrer Region',
            ]}
            cta="Profil erstellen"
            ctaTo="/registrieren/kandidat"
            detail="/fuer-kandidaten"
          />
          <AudienceCard
            icon="🔍"
            title="Recruiter"
            color={C.green}
            colorBg={C.greenBg}
            colorBd="#a7f3d0"
            bullets={[
              'Kandidaten hochladen und verwalten',
              'Provisionsbasiert bei erfolgreicher Einstellung',
              'Automatisches Matching auf Unternehmensstellen',
              'Dashboard zur Pipeline-Verwaltung',
            ]}
            cta="Als Recruiter starten"
            ctaTo="/registrieren/recruiter"
            detail="/fuer-recruiter"
          />
        </div>
      </div>
    </section>
  )
}

function AudienceCard({
  icon, title, color, colorBg, colorBd, bullets, cta, ctaTo, detail,
}: {
  icon: string; title: string; color: string; colorBg: string; colorBd: string
  bullets: string[]; cta: string; ctaTo: string; detail: string
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.white, borderRadius: 20,
        border: `1px solid ${hovered ? colorBd : C.border}`,
        padding: '32px 28px',
        boxShadow: hovered
          ? `0 20px 48px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)`
          : '0 2px 8px rgba(15,23,42,0.05)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: colorBg, border: `1px solid ${colorBd}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, marginBottom: 20,
      }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: 22, fontWeight: 800, color: C.text,
        fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.02em',
      }}>
        {title}
      </h3>

      {/* Bullets */}
      <ul style={{ margin: '0 0 28px', padding: 0, listStyle: 'none', flex: 1 }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 14, color: C.muted, fontFamily: F,
            marginBottom: 10, lineHeight: 1.5,
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: colorBg, border: `1px solid ${colorBd}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Link to={ctaTo} style={{
          flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
          color: C.white, textDecoration: 'none',
          padding: '11px 16px', borderRadius: 10, textAlign: 'center',
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          boxShadow: `0 2px 8px ${color}40`,
        }}>
          {cta}
        </Link>
        <Link to={detail} style={{
          fontFamily: F, fontSize: 14, fontWeight: 600,
          color: color, textDecoration: 'none',
          padding: '11px 14px', borderRadius: 10,
          background: colorBg, border: `1px solid ${colorBd}`,
          whiteSpace: 'nowrap',
        }}>
          Mehr erfahren
        </Link>
      </div>
    </div>
  )
}

// ── How it works ───────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      n: '01', title: 'Registrieren & Profil anlegen',
      desc: 'Unternehmen legen Stellen an, Kandidaten erstellen ihr Profil, Recruiter laden vorqualifizierte Talente hoch.',
      icon: '✏️',
    },
    {
      n: '02', title: 'Automatisches Matching',
      desc: 'Unser Algorithmus berechnet Kompatibilitäts-Scores für Fähigkeiten, Erfahrung, Standort und Verfügbarkeit.',
      icon: '⚡',
    },
    {
      n: '03', title: 'Anonymes Browsing',
      desc: 'Unternehmen sehen anonymisierte Kandidatenkarten — vollständig DSGVO-konform, ohne persönliche Daten.',
      icon: '🛡️',
    },
    {
      n: '04', title: 'Interesse bekunden & Kontakt',
      desc: 'Bei Interesse wird der Recruiter benachrichtigt und koordiniert das erste Gespräch — einfach, schnell, transparent.',
      icon: '🤝',
    },
  ]

  return (
    <section style={{ background: C.white, padding: '80px 24px' }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontSize: 36, fontWeight: 800, color: C.text,
            letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px',
          }}>
            So funktioniert pheweb
          </h2>
          <p style={{ fontSize: 16, color: C.muted, fontFamily: F, margin: 0 }}>
            Von der Registrierung bis zur erfolgreichen Einstellung — in 4 Schritten.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: 24,
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: C.bg, borderRadius: 16,
              border: `1px solid ${C.border}`,
              padding: '28px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: C.accent,
                  background: '#eff6ff', border: '1px solid #bfdbfe',
                  borderRadius: 8, padding: '4px 10px', fontFamily: 'monospace',
                }}>
                  {s.n}
                </span>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
              </div>
              <h4 style={{
                fontSize: 16, fontWeight: 700, color: C.text,
                fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.01em',
              }}>
                {s.title}
              </h4>
              <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: 0, lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Features ───────────────────────────────────────────────────────────────────

function Features() {
  const features = [
    { icon: '🎯', title: 'Präzises Matching', desc: 'Score-basierter Algorithmus für Skills, Erfahrung, Region, Verfügbarkeit und Gehaltsvorstellung.' },
    { icon: '🔒', title: 'DSGVO by Design', desc: 'Kandidaten bleiben bis zur beidseitigen Einwilligung vollständig anonym. Datenschutz als Kern-Feature.' },
    { icon: '📊', title: 'Transparente Scores', desc: 'Jede Kandidatenkarte zeigt aufgeschlüsselte Match-Scores — klare Grundlage für Entscheidungen.' },
    { icon: '⚡', title: 'Echtzeit-Benachrichtigungen', desc: 'Recruiter und Unternehmen werden sofort benachrichtigt, wenn Interesse bekundet wird.' },
    { icon: '🏭', title: 'Fokus auf Fachberufe', desc: 'Spezialisiert auf Elektro, TGA, SHK und Mechatronik — keine generische Job-Plattform.' },
    { icon: '💳', title: 'Erfolgsbasierte Abrechnung', desc: 'Keine monatlichen Fixkosten für Recruiter. Provision nur bei erfolgreicher Einstellung.' },
  ]

  return (
    <section style={{ background: C.navy, padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontSize: 36, fontWeight: 800, color: '#f1f5f9',
            letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px',
          }}>
            Warum pheweb?
          </h2>
          <p style={{ fontSize: 16, color: '#64748b', fontFamily: F, margin: 0 }}>
            Speziell entwickelt für die Anforderungen des deutschen Fachkräftemarkts.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '24px 22px',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h4 style={{
                fontSize: 16, fontWeight: 700, color: '#f1f5f9',
                fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.01em',
              }}>
                {f.title}
              </h4>
              <p style={{ fontSize: 14, color: '#64748b', fontFamily: F, margin: 0, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ─────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section style={{ background: C.bg, padding: '80px 24px' }}>
      <div style={{
        maxWidth: 720, margin: '0 auto', textAlign: 'center',
        background: `linear-gradient(135deg, ${C.accent} 0%, #1d4ed8 100%)`,
        borderRadius: 24, padding: '56px 40px',
        boxShadow: '0 20px 60px rgba(37,99,235,0.35)',
      }}>
        <h2 style={{
          fontSize: 32, fontWeight: 800, color: C.white,
          letterSpacing: '-0.03em', fontFamily: F, margin: '0 0 12px',
        }}>
          Bereit für den nächsten Schritt?
        </h2>
        <p style={{
          fontSize: 16, color: 'rgba(255,255,255,0.8)',
          fontFamily: F, margin: '0 0 36px', lineHeight: 1.6,
        }}>
          Registrieren Sie sich in wenigen Minuten und entdecken Sie,
          wie pheweb Ihre Personalsuche transformiert.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/registrieren/unternehmen" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700,
            color: C.accent, textDecoration: 'none',
            padding: '13px 28px', borderRadius: 12,
            background: C.white,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            Für Unternehmen
          </Link>
          <Link to="/registrieren/kandidat" style={{
            fontFamily: F, fontSize: 15, fontWeight: 700,
            color: C.white, textDecoration: 'none',
            padding: '13px 28px', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.4)',
            background: 'rgba(255,255,255,0.12)',
          }}>
            Für Kandidaten
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{
      background: C.navy, borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '48px 24px 32px',
    }}>
      <div style={{ maxWidth: 1140, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>

          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.04em', fontFamily: F, color: '#f1f5f9' }}>
                phe<span style={{ color: '#60a5fa' }}>web</span>
              </span>
            </Link>
            <p style={{ fontSize: 13, color: '#64748b', fontFamily: F, margin: '12px 0 0', lineHeight: 1.6 }}>
              Digitale Fachkräfte-Vermittlung für Deutschland. DSGVO-konform, transparent, effizient.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <FooterCol title="Plattform" links={[
              { label: 'Für Unternehmen', to: '/fuer-unternehmen' },
              { label: 'Für Kandidaten',  to: '/fuer-kandidaten'  },
              { label: 'Für Recruiter',   to: '/fuer-recruiter'   },
            ]} />
            <FooterCol title="Konto" links={[
              { label: 'Anmelden',            to: '/login'                      },
              { label: 'Als Unternehmen reg.', to: '/registrieren/unternehmen'  },
              { label: 'Als Kandidat reg.',    to: '/registrieren/kandidat'      },
              { label: 'Als Recruiter reg.',   to: '/registrieren/recruiter'     },
            ]} />
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span style={{ fontSize: 13, color: '#475569', fontFamily: F }}>
            © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
          </span>
          <Link to="/admin" style={{ fontSize: 12, color: '#334155', fontFamily: F, textDecoration: 'none' }}>
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
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
        {title}
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} style={{
          display: 'block', fontSize: 14, color: '#64748b', fontFamily: F,
          textDecoration: 'none', marginBottom: 8,
        }}>
          {l.label}
        </Link>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />
      <Hero />
      <AudienceCards />
      <HowItWorks />
      <Features />
      <CTABanner />
      <Footer />
    </div>
  )
}
