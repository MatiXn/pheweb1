import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'

export default function DashboardPage() {
  const { profile, isLoading } = useCurrentUser()
  if (isLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role === 'admin')       return <Navigate to="/admin/monitoring" replace />
  if (profile.role === 'unternehmen') return <Navigate to="/unternehmen/matches" replace />
  if (profile.role === 'recruiter')   return <Navigate to="/recruiter/interessenten" replace />
  if (profile.role === 'kandidat')    return <Navigate to="/kandidat/profil" replace />
  return <Navigate to="/login" replace />
}
