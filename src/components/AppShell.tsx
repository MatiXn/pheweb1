// AppShell — Shared layout shell: TopNav + page wrapper
// Used by all authenticated pages (Unternehmen, Admin, Recruiter)

import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useAuthContext } from '../features/auth'
import { supabase } from '../lib/supabaseClient'

const C = {
  bg:       '#f7f8fc',
  white:    '#ffffff',
  accent:   '#3b72b8',
  accentDk: '#2558a0',
  accentBg: '#eef4ff',
  text:     '#111827',
  muted:    '#6b7280',
  border:   '#e5e7eb',
  shadow:   '0 1px 3px rgba(0,0,0,0.08)',
}
const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"

// ── Nav link configs per role ────────────────────────────────────────────────

const UNTERNEHMEN_LINKS = [
  { to: '/unternehmen/matches',          label: 'Matches' },
  { to: '/unternehmen/stellen-verwalten', label: 'Stellen' },
  { to: '/unternehmen/profil',           label: 'Profil' },
  { to: '/unternehmen/abonnement',       label: 'Abonnement' },
]

const ADMIN_LINKS = [
  { to: '/admin/monitoring',    label: 'Monitoring' },
  { to: '/admin/verifizierung', label: 'Kandidaten' },
  { to: '/admin/unternehmen',   label: 'Unternehmen' },
  { to: '/admin/skills',        label: 'Skills' },
]

const RECRUITER_LINKS = [
  { to: '/recruiter/interessenten', label: 'Interessenten' },
]

function getLinks(role: string | undefined) {
  if (role === 'unternehmen') return UNTERNEHMEN_LINKS
  if (role === 'admin') return ADMIN_LINKS
  if (role === 'recruiter') return RECRUITER_LINKS
  return []
}

// ── TopNav ───────────────────────────────────────────────────────────────────

function TopNav() {
  const { profile } = useCurrentUser()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const links = getLinks(profile?.role)

  const displayName =
    profile?.role === 'unternehmen' ? profile.company_name ?? profile.email
    : profile?.role === 'admin'     ? 'Admin'
    : profile?.role === 'recruiter' ? profile.full_name ?? profile.email
    : profile?.email ?? ''

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header style={{
      position:        'sticky',
      top:             0,
      zIndex:          50,
      backgroundColor: C.white,
      borderBottom:    `1px solid ${C.border}`,
      boxShadow:       C.shadow,
    }}>
      <div style={{
        maxWidth:       1200,
        margin:         '0 auto',
        padding:        '0 24px',
        height:         64,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        gap:            16,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{
          fontFamily:     F,
          fontSize:       22,
          fontWeight:     800,
          color:          C.text,
          textDecoration: 'none',
          letterSpacing:  '-0.03em',
          flexShrink:     0,
        }}>
          phe<span style={{ color: C.accent }}>web</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(link => {
            const isActive = pathname === link.to || pathname.startsWith(link.to + '/')
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily:      F,
                  fontSize:        14,
                  fontWeight:      isActive ? 600 : 500,
                  color:           isActive ? C.accent : C.muted,
                  textDecoration:  'none',
                  padding:         '6px 14px',
                  borderRadius:    8,
                  backgroundColor: isActive ? C.accentBg : 'transparent',
                  transition:      'all 0.15s',
                  whiteSpace:      'nowrap',
                }}
              >
                {link.label}
              </Link>
            )
          })}
          {/* Quick action for Unternehmen */}
          {profile?.role === 'unternehmen' && (
            <Link
              to="/unternehmen/stelle-anlegen"
              style={{
                fontFamily:      F,
                fontSize:        13,
                fontWeight:      600,
                color:           C.white,
                textDecoration:  'none',
                padding:         '6px 14px',
                borderRadius:    8,
                backgroundColor: C.accent,
                marginLeft:      8,
                whiteSpace:      'nowrap',
              }}
            >
              + Stelle anlegen
            </Link>
          )}
        </nav>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{
            fontFamily: F,
            fontSize:   13,
            color:      C.muted,
            fontWeight: 500,
            maxWidth:   180,
            overflow:   'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              fontFamily:      F,
              fontSize:        13,
              fontWeight:      500,
              color:           C.muted,
              backgroundColor: 'transparent',
              border:          `1px solid ${C.border}`,
              borderRadius:    8,
              padding:         '6px 14px',
              cursor:          'pointer',
            }}
          >
            Abmelden
          </button>
        </div>
      </div>
    </header>
  )
}

// ── AppShell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode
  maxWidth?: number
}

export function AppShell({ children, maxWidth = 1200 }: AppShellProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.bg, fontFamily: F }}>
      <TopNav />
      <main style={{ maxWidth, margin: '0 auto', padding: '40px 24px' }}>
        {children}
      </main>
    </div>
  )
}

export { C as shellColors, F as shellFont }
