// PublicNav — Shared navigation for all public marketing pages
// Used by: LandingPage, FuerUnternehmenPage, FuerKandidatenPage, FuerRecruiterPage

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../features/auth'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

export default function PublicNav() {
  const scrolled = useScrolled()
  const { user } = useAuthContext()

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
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em',
            fontFamily: F, color: '#f1f5f9',
          }}>
            phe<span style={{ color: '#60a5fa' }}>web</span>
          </span>
        </Link>

        {/* Page links */}
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

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <Link
              to="/dashboard"
              className="btn-primary-hover"
              style={{
                fontFamily: F, fontSize: 14, fontWeight: 700,
                color: '#fff', textDecoration: 'none',
                padding: '9px 22px', borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                boxShadow: '0 2px 12px rgba(37,99,235,0.4)',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              Zum Dashboard
            </Link>
          ) : (
            <>
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
                  display: 'inline-flex', alignItems: 'center',
                }}
              >
                Kostenlos starten
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
