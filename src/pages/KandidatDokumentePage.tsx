import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { DocumentUpload } from '../features/candidates'

export default function KandidatDokumentePage() {
  const { profile, isLoading } = useCurrentUser()

  if (isLoading || (profile === null && !isLoading)) return null

  // Nicht-Kandidat → Dashboard
  if (profile && profile.role !== 'kandidat') {
    return <Navigate to="/dashboard" replace />
  }

  return <DocumentUpload />
}
