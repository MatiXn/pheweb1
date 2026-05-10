// AppShell — Premium Sidebar Layout
// Dark sidebar + light content area, fully responsive

import { type ReactNode, type ReactElement, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'
import { PrivacyConsentModal, CURRENT_PRIVACY_VERSION } from './PrivacyConsentModal'

// ── Design Tokens ─────────────────────────────────────────────────────────────

export const DS = {
  // Sidebar
  sidebar: '#0f172a',
  sidebarHover: 'rgba(255,255,255,0.07)',
  sidebarActiveBg: 'rgba(59,130,246,0.18)',
  sidebarBorder: 'rgba(255,255,255,0.06)',
  sidebarText: '#94a3b8',
  sidebarTextHover: '#e2e8f0',
  sidebarTextActive: '#ffffff',
  sidebarAccent: '#3b82f6',
  sidebarW: 256,

  // Content
  bg: '#f8fafc',
  white: '#ffffff',

  // Brand
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  accentLight: '#eff6ff',
  accentBorder: '#bfdbfe',

  // Text
  text: '#0f172a',
  textMd: '#1e293b',
  textSm: '#475569',
  textXs: '#94a3b8',

  // UI
  border: '#e2e8f0',
  borderDk: '#cbd5e1',
  inputBg: '#f8fafc',

  // Status
  success: '#059669',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',
  successText: '#065f46',

  warning: '#d97706',
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',
  warningText: '#92400e',

  error: '#dc2626',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
  errorText: '#991b1b',

  // Shadows
  shadowSm: '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
  shadowMd: '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
  shadowLg: '0 20px 40px rgba(15,23,42,0.10), 0 8px 16px rgba(15,23,42,0.06)',
  shadowXl: '0 32px 64px rgba(15,23,42,0.14)',

  // Radius
  radius: 12,
  radiusSm: 8,
  radiusXs: 6,
  radiusFull: 9999,

  // Font
  font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
}

// Re-export as shellColors / shellFont for backward compat with pages that import them
export const shellColors = {
  bg:       DS.bg,
  white:    DS.white,
  accent:   DS.accent,
  accentDk: DS.accentHover,
  accentBg: DS.accentLight,
  text:     DS.text,
  muted:    DS.textSm,
  faint:    DS.textXs,
  border:   DS.border,
  shadow:   DS.shadowSm,
  shadowMd: DS.shadowMd,
}
export const shellFont = DS.font

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const Ic = {
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="12.01"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Card: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Chart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="3" y1="20" x2="21" y2="20"/>
    </svg>
  ),
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  Tag: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
}

// ── Nav link configs per role ─────────────────────────────────────────────────

type NavLink = { to: string; label: string; Icon: () => ReactElement }

const UNTERNEHMEN_LINKS: NavLink[] = [
  { to: '/unternehmen/matches',           label: 'Matches',    Icon: Ic.Grid      },
  { to: '/unternehmen/stellen-verwalten', label: 'Stellen',    Icon: Ic.Briefcase },
  { to: '/unternehmen/profil',            label: 'Profil',     Icon: Ic.User      },
  { to: '/unternehmen/abonnement',        label: 'Abonnement', Icon: Ic.Card      },
]

const ADMIN_LINKS: NavLink[] = [
  { to: '/admin/monitoring',    label: 'Monitoring',  Icon: Ic.Chart    },
  { to: '/admin/verifizierung', label: 'Kandidaten',  Icon: Ic.Shield   },
  { to: '/admin/unternehmen',   label: 'Unternehmen', Icon: Ic.Building },
  { to: '/admin/skills',        label: 'Skills',      Icon: Ic.Tag      },
]

const RECRUITER_LINKS: NavLink[] = [
  { to: '/recruiter/kandidaten',    label: 'Kandidaten',    Icon: Ic.Users },
  { to: '/recruiter/interessenten', label: 'Interessenten', Icon: Ic.Heart },
  { to: '/recruiter/profil',        label: 'Profil',        Icon: Ic.User  },
]

function getLinks(role: string | undefined): NavLink[] {
  if (role === 'unternehmen') return UNTERNEHMEN_LINKS
  if (role === 'admin')       return ADMIN_LINKS
  if (role === 'recruiter')   return RECRUITER_LINKS
  return []
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    || '?'

  // deterministic hue from name
  const hue = (name.length > 0 ? name.charCodeAt(0) : 65) * 17 % 360

  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   '50%',
      background:     `hsl(${hue}, 55%, 52%)`,
      color:          '#fff',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      fontSize:       size * 0.38,
      fontWeight:     700,
      fontFamily:     DS.font,
      flexShrink:     0,
      letterSpacing:  '-0.01em',
    }}>
      {initials}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

function Sidebar({ onClose, isMobile }: SidebarProps) {
  const { profile } = useCurrentUser()
  const { pathname } = useLocation()
  const navigate     = useNavigate()

  const links = getLinks(profile?.role)

  const displayName =
    profile?.role === 'unternehmen' ? (profile.company_name ?? profile.email)
    : profile?.role === 'admin'     ? 'Admin'
    : profile?.role === 'recruiter' ? (profile.full_name ?? profile.email)
    : (profile?.email ?? '')

  const roleLabel =
    profile?.role === 'unternehmen' ? 'Unternehmen'
    : profile?.role === 'admin'     ? 'Administrator'
    : profile?.role === 'recruiter' ? 'Recruiter'
    : 'Kandidat'

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      background:    DS.sidebar,
      overflow:      'hidden',
    }}>

      {/* ── Logo header ── */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '20px 20px 16px',
        borderBottom:   `1px solid ${DS.sidebarBorder}`,
        flexShrink:     0,
      }}>
        <Link
          to="/dashboard"
          onClick={onClose}
          style={{
            fontFamily:    DS.font,
            fontSize:      22,
            fontWeight:    800,
            color:         '#f1f5f9',
            letterSpacing: '-0.04em',
            lineHeight:    1,
            display:       'flex',
            alignItems:    'center',
            gap:           2,
          }}
        >
          <span>phe</span>
          <span style={{
            color:      DS.sidebarAccent,
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>web</span>
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: DS.sidebarText, cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <Ic.Close />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div style={{ padding: '12px 20px 4px' }}>
        <span style={{
          display:      'inline-block',
          fontFamily:   DS.font,
          fontSize:     10,
          fontWeight:   700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:        DS.sidebarAccent,
          background:   'rgba(59,130,246,0.12)',
          padding:      '3px 8px',
          borderRadius: DS.radiusFull,
          border:       '1px solid rgba(59,130,246,0.2)',
        }}>
          {roleLabel}
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        flex:       1,
        padding:    '8px 12px',
        overflowY:  'auto',
        overflowX:  'hidden',
      }}>
        {links.map(link => {
          const isActive = pathname === link.to || pathname.startsWith(link.to + '/')
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            10,
                padding:        '10px 12px',
                borderRadius:   DS.radiusSm,
                marginBottom:   2,
                color:          isActive ? DS.sidebarTextActive : DS.sidebarText,
                background:     isActive ? DS.sidebarActiveBg   : 'transparent',
                fontFamily:     DS.font,
                fontSize:       14,
                fontWeight:     isActive ? 600 : 500,
                letterSpacing:  '-0.01em',
                borderLeft:     `3px solid ${isActive ? DS.sidebarAccent : 'transparent'}`,
                transition:     'all 0.15s ease',
                cursor:         'pointer',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.65, flexShrink: 0 }}>
                <link.Icon />
              </span>
              {link.label}
            </Link>
          )
        })}

        {/* Unternehmen quick-action */}
        {profile?.role === 'unternehmen' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${DS.sidebarBorder}` }}>
            <Link
              to="/unternehmen/stelle-anlegen"
              onClick={onClose}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            8,
                padding:        '10px 12px',
                borderRadius:   DS.radiusSm,
                background:     DS.sidebarAccent,
                color:          '#fff',
                fontFamily:     DS.font,
                fontSize:       13,
                fontWeight:     600,
                letterSpacing:  '-0.01em',
                cursor:         'pointer',
                transition:     'opacity 0.15s',
              }}
            >
              <Ic.Plus />
              Stelle anlegen
            </Link>
          </div>
        )}

        {/* Recruiter quick-action */}
        {profile?.role === 'recruiter' && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${DS.sidebarBorder}` }}>
            <Link
              to="/recruiter/kandidat-hochladen"
              onClick={onClose}
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            8,
                padding:        '10px 12px',
                borderRadius:   DS.radiusSm,
                background:     DS.sidebarAccent,
                color:          '#fff',
                fontFamily:     DS.font,
                fontSize:       13,
                fontWeight:     600,
                letterSpacing:  '-0.01em',
                cursor:         'pointer',
              }}
            >
              <Ic.Plus />
              Kandidat hochladen
            </Link>
          </div>
        )}
      </nav>

      {/* ── User section ── */}
      <div style={{
        padding:     '12px',
        borderTop:   `1px solid ${DS.sidebarBorder}`,
        flexShrink:  0,
      }}>
        {/* Datenschutz link */}
        <Link
          to="/kandidat/datenschutz"
          onClick={onClose}
          style={{
            display:    'block',
            textAlign:  'center',
            fontSize:   11,
            color:      'rgba(148,163,184,0.5)',
            fontFamily: DS.font,
            padding:    '4px 0 8px',
            letterSpacing: '0.02em',
          }}
        >
          Datenschutz
        </Link>

        {/* User info row */}
        <div style={{
          display:     'flex',
          alignItems:  'center',
          gap:         10,
          padding:     '10px 12px',
          borderRadius: DS.radiusSm,
          background:  DS.sidebarHover,
        }}>
          <Avatar name={displayName as string} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize:     13,
              fontWeight:   600,
              color:        '#e2e8f0',
              fontFamily:   DS.font,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
              lineHeight:   1.3,
            }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: DS.sidebarText, fontFamily: DS.font }}>
              {profile?.email}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Abmelden"
            style={{
              background: 'none', border: 'none',
              color:      DS.sidebarText,
              cursor:     'pointer',
              padding:    '4px',
              display:    'flex',
              alignItems: 'center',
              borderRadius: 6,
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
          >
            <Ic.Logout />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FrozenBanner ──────────────────────────────────────────────────────────────

function FrozenBanner() {
  return (
    <div style={{
      maxWidth:   600,
      margin:     '80px auto',
      padding:    '0 24px',
      fontFamily: DS.font,
    }}>
      <div style={{
        background:    DS.white,
        border:        `1.5px solid ${DS.errorBorder}`,
        borderRadius:  20,
        padding:       '48px 40px',
        boxShadow:     DS.shadowLg,
        textAlign:     'center',
      }}>
        <div style={{
          width:          64,
          height:         64,
          borderRadius:   '50%',
          background:     DS.errorBg,
          border:         `2px solid ${DS.errorBorder}`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 20px',
          fontSize:       28,
        }}>
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: '#dc2626' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{
          fontSize:   22,
          fontWeight: 700,
          color:      DS.text,
          marginBottom: 10,
          letterSpacing: '-0.02em',
        }}>
          Konto vorübergehend gesperrt
        </h2>
        <p style={{ fontSize: 15, color: DS.textSm, lineHeight: 1.7, marginBottom: 8 }}>
          Ihr Konto wurde aufgrund einer ausstehenden Zahlung eingefroren.
          Alle Funktionen sind bis zur Reaktivierung deaktiviert.
        </p>
        <p style={{ fontSize: 13, color: DS.textXs, marginBottom: 32 }}>
          Bitte erneuern Sie Ihr Abonnement, um wieder Zugang zu erhalten.
        </p>
        <Link
          to="/unternehmen/abonnement"
          style={{
            display:         'inline-flex',
            alignItems:      'center',
            gap:             8,
            background:      DS.accent,
            color:           '#fff',
            fontFamily:      DS.font,
            fontSize:        15,
            fontWeight:      600,
            padding:         '12px 28px',
            borderRadius:    DS.radius,
            letterSpacing:   '-0.01em',
          }}
        >
          Abonnement reaktivieren
        </Link>
        <p style={{ fontSize: 13, color: DS.textXs, marginTop: 24 }}>
          Bei Fragen:{' '}
          <a href="mailto:support@phe-perm.de" style={{ color: DS.accent }}>
            support@phe-perm.de
          </a>
        </p>
      </div>
    </div>
  )
}

// ── Mobile hook ───────────────────────────────────────────────────────────────

function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return mobile
}

// ── AppShell ──────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode
  maxWidth?: number
}

export function AppShell({ children, maxWidth = 1200 }: AppShellProps) {
  const { profile }                = useCurrentUser()
  const [companyAccountStatus, setCompanyAccountStatus] = useState<string | null>(null)
  const [privacyAccepted, setPrivacyAccepted]           = useState(false)
  const [mobileOpen, setMobileOpen]                     = useState(false)
  const isMobile                                        = useIsMobile()

  useEffect(() => {
    if (profile?.role !== 'unternehmen') return
    supabase
      .from('companies')
      .select('account_status')
      .single()
      .then(({ data }) => {
        setCompanyAccountStatus((data as { account_status: string } | null)?.account_status ?? null)
      })
  }, [profile?.role])

  // Close mobile nav on route change
  const location = useLocation()
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const isFrozen =
    profile?.role === 'unternehmen' && companyAccountStatus === 'eingefroren'

  const needsPrivacyConsent =
    !privacyAccepted &&
    profile != null &&
    (profile as { privacy_policy_consented_version?: string | null }).privacy_policy_consented_version !== CURRENT_PRIVACY_VERSION

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: DS.font, background: DS.bg }}>

      {needsPrivacyConsent && (
        <PrivacyConsentModal onAccepted={() => setPrivacyAccepted(true)} />
      )}

      {/* ── Mobile overlay ── */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position:   'fixed',
            inset:      0,
            background: 'rgba(15,23,42,0.6)',
            zIndex:     200,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        position:   'fixed',
        top:        0,
        left:       0,
        bottom:     0,
        width:      DS.sidebarW,
        zIndex:     300,
        transform:  isMobile && !mobileOpen ? `translateX(-${DS.sidebarW}px)` : 'translateX(0)',
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:  isMobile && mobileOpen ? '4px 0 32px rgba(0,0,0,0.3)' : 'none',
      }}>
        <Sidebar onClose={() => setMobileOpen(false)} isMobile={isMobile} />
      </aside>

      {/* ── Main content ── */}
      <div style={{
        flex:       1,
        marginLeft: isMobile ? 0 : DS.sidebarW,
        minHeight:  '100vh',
        display:    'flex',
        flexDirection: 'column',
      }}>

        {/* Mobile topbar */}
        {isMobile && (
          <div style={{
            height:          56,
            background:      DS.white,
            borderBottom:    `1px solid ${DS.border}`,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'space-between',
            padding:         '0 16px',
            boxShadow:       DS.shadowSm,
            position:        'sticky',
            top:             0,
            zIndex:          100,
            flexShrink:      0,
          }}>
            <button
              type="button"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                background: 'none',
                border:     'none',
                color:      DS.text,
                cursor:     'pointer',
                padding:    '4px',
                display:    'flex',
                alignItems: 'center',
                borderRadius: 8,
              }}
            >
              <Ic.Menu />
            </button>
            <Link to="/dashboard" style={{
              fontFamily:    DS.font,
              fontSize:      20,
              fontWeight:    800,
              color:         DS.text,
              letterSpacing: '-0.04em',
            }}>
              phe<span style={{ color: DS.accent }}>web</span>
            </Link>
            <div style={{ width: 30 }} />
          </div>
        )}

        {/* Page content */}
        {isFrozen ? (
          <FrozenBanner />
        ) : (
          <main style={{
            flex:      1,
            maxWidth:  maxWidth + 80,
            width:     '100%',
            padding:   isMobile ? '24px 16px' : '40px 40px',
          }}>
            {children}
          </main>
        )}
      </div>
    </div>
  )
}
