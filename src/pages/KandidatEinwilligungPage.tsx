import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { DsgvoConsentPage } from '../features/candidates'

export default function KandidatEinwilligungPage() {
  const { profile, isLoading } = useCurrentUser()

  if (isLoading) return null

  // Kein Profil nach dem Laden (unerwarteter Fehler-Zustand) → Login
  if (!profile) return <Navigate to="/login" replace />

  // Nicht-Kandidat → Dashboard
  if (profile && profile.role !== 'kandidat') {
    return <Navigate to="/dashboard" replace />
  }

  // Einwilligung bereits erteilt → Dashboard
  if (profile && profile.dsgvo_consent_at) {
    return <Navigate to="/dashboard" replace />
  }

  return <DsgvoConsentPage />
}
