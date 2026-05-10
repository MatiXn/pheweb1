// AdminLoginPage — Separater Admin-Login
// Route: /admin

import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { LoginForm } from '../features/auth/components/LoginForm'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

export default function AdminLoginPage() {
  const { user, isLoading } = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()

  if (isLoading || profileLoading) return null

  // If already logged in as admin, redirect to admin dashboard
  if (user && profile?.role === 'admin') {
    return <Navigate to="/admin/monitoring" replace />
  }

  // If logged in but not admin, redirect to regular dashboard
  if (user && profile) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: F, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 480, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo + Admin badge */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#f1f5f9', fontFamily: F }}>
              phe<span style={{ color: '#60a5fa' }}>web</span>
            </span>
          </Link>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 99, padding: '4px 14px', marginTop: 12,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5', fontFamily: F, letterSpacing: '0.05em' }}>
              ADMIN-BEREICH
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#ffffff', borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 32px 64px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.03em' }}>
            Administrator-Login
          </h1>
          <p style={{ fontSize: 14, color: '#475569', margin: '0 0 28px', lineHeight: 1.5 }}>
            Nur für autorisierte Administratoren. Nach der Anmeldung ist eine TOTP-Verifizierung erforderlich.
          </p>

          {/* Reuse LoginForm — it handles auth and navigation */}
          <LoginForm />

          <div style={{
            marginTop: 20, padding: '12px 16px',
            background: '#fefce8', border: '1px solid #fde68a',
            borderRadius: 10, fontSize: 12, color: '#92400e', fontFamily: F,
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <span>Dieser Bereich ist ausschließlich für Systemadministratoren. Unbefugter Zugriff wird protokolliert.</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/" style={{
            fontSize: 13, color: 'rgba(148,163,184,0.6)',
            display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none',
          }}>
            <span style={{ fontSize: 14 }}>←</span> Zurück zur Startseite
          </Link>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(148,163,184,0.4)', fontFamily: F }}>
          © {new Date().getFullYear()} pheweb — Fachkräfte-Plattform
        </p>
      </div>
    </div>
  )
}
