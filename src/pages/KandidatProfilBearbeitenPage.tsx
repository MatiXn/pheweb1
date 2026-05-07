import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { CandidateProfileEdit } from '../features/candidates'

export default function KandidatProfilBearbeitenPage() {
  const { profile, isLoading } = useCurrentUser()

  if (isLoading) return null

  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'kandidat') return <Navigate to="/dashboard" replace />
  if (profile.profile_status === 'gesperrt') return <Navigate to="/warten" replace />
  if ((profile.onboarding_step ?? 0) < 4) return <Navigate to="/kandidat/onboarding" replace />

  return <CandidateProfileEdit />
}
