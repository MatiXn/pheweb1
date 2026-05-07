import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { OnboardingWizard } from '../features/candidates'

export default function KandidatOnboardingPage() {
  const { profile, isLoading } = useCurrentUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && profile) {
      // Wizard abgeschlossen (onboarding_step >= 4) → Dashboard
      if ((profile.onboarding_step ?? 0) >= 4) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [profile, isLoading, navigate])

  // Auth noch nicht geladen
  if (isLoading) return null
  if (!profile) return <Navigate to="/login" replace />

  // Onboarding abgeschlossen aber Redirect noch nicht gefeuert → nichts rendern
  if ((profile.onboarding_step ?? 0) >= 4) return null

  // Nicht-Kandidat → Dashboard
  if (profile.role !== 'kandidat') {
    return <Navigate to="/dashboard" replace />
  }

  // Wizard rendern; initialStep aus onboarding_step (nächster Schritt = aktuell + 1, max 4)
  const savedStep = profile?.onboarding_step ?? 0
  const initialStep = Math.max(1, Math.min(savedStep + 1, 3))

  return <OnboardingWizard initialStep={initialStep} initialJobField={profile?.job_field ?? ''} />
}
