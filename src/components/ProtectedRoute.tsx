import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'

// Routes exempt from the DSGVO consent redirect (AC3: candidates may still use these without consent)
const CONSENT_EXEMPT_PATHS = ['/kandidat/einwilligung', '/kandidat/dokumente', '/kandidat/onboarding', '/kandidat/profil']

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const { pathname } = useLocation()

  // AAL (Authenticator Assurance Level) für Admin-TOTP-Check
  const [adminAal, setAdminAal] = useState<string | null>(null)

  // Initial AAL-Check wenn Admin-User geladen
  useEffect(() => {
    if (!user || !profile || profile.role !== 'admin') return
    supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
      setAdminAal(data?.currentLevel ?? 'aal1')
    })
  }, [user, profile?.role])

  // AAL bei Auth-State-Änderungen neu prüfen (z.B. nach TOTP-Verifikation)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'TOKEN_REFRESHED' ||
        event === 'MFA_CHALLENGE_VERIFIED' ||
        event === 'SIGNED_IN'
      ) {
        setAdminAal(null) // loading state bis AAL bekannt
        supabase.auth.mfa.getAuthenticatorAssuranceLevel().then(({ data }) => {
          setAdminAal(data?.currentLevel ?? 'aal1')
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // AAL noch nicht geladen für Admin → kurz warten
  const isAdminAalPending = !!user && profile?.role === 'admin' && adminAal === null

  // Auth-State noch nicht geladen
  if (authLoading || (user && profileLoading) || isAdminAalPending) {
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

  // Admin: AAL2 (TOTP) erforderlich
  if (profile.role === 'admin') {
    if (adminAal !== 'aal2' && pathname !== '/admin/totp-verify' && pathname !== '/admin/totp-einrichten') {
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
