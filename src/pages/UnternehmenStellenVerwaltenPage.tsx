// UnternehmenStellenVerwaltenPage — [Story 4.4]
// Route: /unternehmen/stellen-verwalten

import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { JobListingsManagementList } from '../features/companies'
import { AppShell } from '../components/AppShell'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"

export default function UnternehmenStellenVerwaltenPage() {
  const { user } = useAuthContext()
  const { profile, isLoading } = useCurrentUser()

  if (isLoading) return null
  if (!user || !profile) return <Navigate to="/login" replace />
  if (profile.role !== 'unternehmen') return <Navigate to="/dashboard" replace />

  return (
    <AppShell>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F }}>
          Meine Stellen
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', fontFamily: F }}>
          Übersicht und Verwaltung Ihrer Stellenausschreibungen.
        </p>
      </div>
      <JobListingsManagementList />
    </AppShell>
  )
}
