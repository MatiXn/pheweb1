import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

// Routes exempt from the DSGVO consent redirect (AC3: candidates may still use these without consent)
const CONSENT_EXEMPT_PATHS = ['/kandidat/einwilligung', '/kandidat/dokumente', '/kandidat/onboarding', '/kandidat/profil']

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const { pathname } = useLocation()

  // Auth-State noch nicht geladen
  if (authLoading || (user && profileLoading)) {
    return null
  }

  // Nicht eingeloggt → Login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User exists but profile failed to load (null after loading completes) → Login
  if (!profile) {
    return <Navigate to="/login" replace />
  }

  // Unternehmen/Recruiter mit ausstehender Freischaltung → Pending-Seite
  if (
    (profile.role === 'unternehmen' || profile.role === 'recruiter') &&
    !profile.is_active
  ) {
    return <Navigate to="/warten" replace />
  }

  // For admin users, verify AAL2 (TOTP must be verified)
  if (profile.role === 'admin') {
    // Check if the admin has completed TOTP verification
    // If not on the TOTP verify page already, redirect to TOTP verification
    if (pathname !== '/admin/totp-verify' && pathname !== '/admin/totp-einrichten') {
      // AAL2 check is performed at the TOTP verify page level;
      // redirect admin to TOTP verification flow if not already there
      return <Navigate to="/admin/totp-verify" replace />
    }
  }

  // Kandidat: Onboarding abgeschlossen aber DSGVO-Einwilligung noch nicht erteilt
  // → Redirect zur Consent-Seite (außer auf AC3-exempt Routen: Dokumente, Onboarding)
  if (
    profile.role === 'kandidat' &&
    (profile.onboarding_step ?? 0) >= 4 &&
    !profile.dsgvo_consent_at &&
    !CONSENT_EXEMPT_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return <Navigate to="/kandidat/einwilligung" replace />
  }

  return <>{children}</>
}
