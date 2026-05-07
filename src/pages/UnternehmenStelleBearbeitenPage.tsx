import { useParams, Navigate, useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { JobListingForm } from '../features/companies'
import { AppShell } from '../components/AppShell'

// [Story 4.4] Edit-Seite für eine bestehende Stellenausschreibung

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const C = {
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  accent: '#3b72b8', accentBg: '#eef4ff',
  border: 'rgba(15,22,35,0.08)',
}

export default function UnternehmenStelleBearbeitenPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthContext()
  const { profile, isLoading } = useCurrentUser()
  const navigate = useNavigate()

  if (isLoading) return null

  if (!user || !profile) {
    return <Navigate to="/login" replace />
  }

  if (profile.role !== 'unternehmen') {
    return <Navigate to="/dashboard" replace />
  }

  // Missing route param — redirect to list
  if (!id) {
    return <Navigate to="/unternehmen/stellen-verwalten" replace />
  }

  const handleSaveSuccess = () => {
    navigate('/unternehmen/stellen-verwalten')
  }

  return (
    <AppShell maxWidth={800}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/unternehmen/stellen-verwalten" style={{
          fontFamily: F, fontSize: 13, color: C.accent, fontWeight: 600,
          textDecoration: 'none',
        }}>
          ← Zurück zur Übersicht
        </Link>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#0f172a',
          letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F,
        }}>
          Stelle bearbeiten
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', fontFamily: F }}>
          Aktualisieren Sie die Anforderungen Ihrer Stellenausschreibung.
        </p>
      </div>

      <JobListingForm listingId={id} onSaveSuccess={handleSaveSuccess} />
    </AppShell>
  )
}
