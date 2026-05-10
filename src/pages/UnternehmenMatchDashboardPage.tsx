// UnternehmenMatchDashboardPage — Premium Redesign (hireez-inspired)
// Route: /unternehmen/matches

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useCompanyMatches } from '../features/matching/hooks/useCompanyMatches'
import { MatchCard } from '../features/matching/components/MatchCard'
import { AppShell } from '../components/AppShell'
import { Link } from 'react-router-dom'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:   '#2563eb',
  accentBg: '#eff6ff',
  text:     '#0f172a',
  muted:    '#475569',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
  bg:       '#f8fafc',
  green:    '#059669',
  greenBg:  '#ecfdf5',
  greenBd:  '#a7f3d0',
  amber:    '#d97706',
  amberBg:  '#fefce8',
  amberBd:  '#fde68a',
}

export default function UnternehmenMatchDashboardPage() {
  const { user } = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const { data, isLoading: matchesLoading, error, refetch } = useCompanyMatches()
  const [showShortlistOnly, setShowShortlistOnly] = useState(false)

  if (profileLoading) return null
  if (!user || !profile) return <Navigate to="/login" replace />
  if (profile.role !== 'unternehmen') return <Navigate to="/dashboard" replace />

  const totalMatches = data.reduce((sum, job) => sum + job.topCandidates.length, 0)
  const newMatches   = data.reduce((sum, job) => sum + job.topCandidates.filter(c => c.currentStatus === null || c.currentStatus === 'new').length, 0)
  const topMatches   = data.reduce((sum, job) => sum + job.topCandidates.filter(c => c.category === 'top_match').length, 0)

  const displayJobs = showShortlistOnly
    ? data.map(job => ({ ...job, topCandidates: job.topCandidates.filter(c => c.isShortlisted) })).filter(job => job.topCandidates.length > 0)
    : data

  return (
    <AppShell>

      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em',
              marginBottom: 6, fontFamily: F, lineHeight: 1.15,
              background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Ihre Matches
            </h1>
            <p style={{ fontSize: 14, color: C.muted, fontFamily: F }}>
              Anonymisierte Kandidaten-Empfehlungen für Ihre aktiven Stellenausschreibungen.
            </p>
          </div>

          {/* Stats row */}
          {!matchesLoading && data.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <StatBadge label="Gesamt" value={totalMatches} icon="👤" />
              {topMatches > 0 && <StatBadge label="Top Match" value={topMatches} icon="⭐" color="green" />}
              {newMatches > 0 && <StatBadge label="Neu" value={newMatches} icon="✦" color="blue" />}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {!matchesLoading && data.length > 0 && (
        <div style={{
          display: 'flex', gap: 2, marginBottom: 32,
          backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4,
          width: 'fit-content', border: `1px solid ${C.border}`,
        }}>
          {[
            { key: false, label: 'Alle Kandidaten' },
            { key: true,  label: '★ Vorgemerkt'   },
          ].map(tab => (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setShowShortlistOnly(tab.key)}
              style={{
                fontFamily: F, fontSize: 13,
                fontWeight: showShortlistOnly === tab.key ? 700 : 500,
                color:      showShortlistOnly === tab.key ? C.accent : C.muted,
                background: showShortlistOnly === tab.key
                  ? C.white
                  : 'transparent',
                border:      'none', borderRadius: 9, padding: '9px 20px',
                cursor:      'pointer',
                boxShadow:   showShortlistOnly === tab.key
                  ? '0 1px 4px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)'
                  : 'none',
                transition:  'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeleton */}
      {matchesLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {[1, 2].map(i => <SkeletonSection key={i} />)}
        </div>
      )}

      {/* Error */}
      {!matchesLoading && error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, padding: '20px 24px',
          color: '#dc2626', fontFamily: F, fontSize: 14,
        }}>
          Fehler beim Laden: {error}
        </div>
      )}

      {/* Empty state — keine Stellen */}
      {!matchesLoading && !error && data.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Noch keine Matches"
          desc="Sobald aktive Kandidaten zu Ihren Stellenausschreibungen passen, erscheinen sie hier — vollständig anonymisiert."
          action={<Link to="/unternehmen/stelle-anlegen" style={btnStyle}>Erste Stelle anlegen</Link>}
        />
      )}

      {/* Empty state — Shortlist leer */}
      {!matchesLoading && !error && data.length > 0 && showShortlistOnly && displayJobs.length === 0 && (
        <EmptyState
          icon="★"
          title="Keine vorgemerkten Kandidaten"
          desc="Klicken Sie auf den Stern in einer Kandidatenkarte, um Kandidaten vorzumerken."
        />
      )}

      {/* Match sections */}
      {!matchesLoading && !error && displayJobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
          {displayJobs.map(overview => (
            <section key={overview.jobId}>
              {/* Section header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginBottom: 20, paddingBottom: 16,
                borderBottom: `2px solid #f1f5f9`,
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: 18, fontWeight: 700, color: C.text,
                    fontFamily: F, margin: 0, letterSpacing: '-0.02em',
                  }}>
                    {overview.jobTitle}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontFamily: F, fontSize: 12, fontWeight: 700,
                    padding: '4px 12px', borderRadius: 99,
                    backgroundColor: overview.jobStatus === 'active' ? C.greenBg : C.amberBg,
                    color:           overview.jobStatus === 'active' ? C.green : C.amber,
                    border:          `1px solid ${overview.jobStatus === 'active' ? C.greenBd : C.amberBd}`,
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      backgroundColor: overview.jobStatus === 'active' ? C.green : C.amber,
                    }} />
                    {overview.jobStatus === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </span>
                  <span style={{
                    fontFamily: F, fontSize: 12, fontWeight: 600,
                    padding: '4px 12px', borderRadius: 99,
                    backgroundColor: C.accentBg, color: C.accent,
                    border: '1px solid #bfdbfe',
                  }}>
                    {overview.topCandidates.length} {overview.topCandidates.length === 1 ? 'Kandidat' : 'Kandidaten'}
                  </span>
                </div>
              </div>

              {/* Cards grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 16,
              }}>
                {overview.topCandidates.map(card => (
                  <MatchCard key={card.matchId} card={card} onRefetch={refetch} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatBadge({
  label, value, icon, color,
}: {
  label: string; value: number; icon: string; color?: 'green' | 'blue'
}) {
  const styles = {
    green: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    blue:  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    default: { bg: '#f8fafc', text: '#0f172a', border: '#e2e8f0' },
  }
  const s = styles[color ?? 'default']
  return (
    <div style={{
      fontFamily: F, fontSize: 13,
      padding: '8px 16px', borderRadius: 12,
      backgroundColor: s.bg, color: s.text,
      fontWeight: 600, border: `1px solid ${s.border}`,
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
    }}>
      <span>{icon}</span>
      <span style={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
    </div>
  )
}

function EmptyState({ icon, title, desc, action }: {
  icon: string; title: string; desc: string; action?: React.ReactNode
}) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: 20,
      border: '1px solid #e2e8f0', padding: '64px 40px',
      textAlign: 'center', maxWidth: 520, margin: '0 auto',
      boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
        border: '1px solid #ddd6fe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, margin: '0 auto 20px',
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8, fontFamily: F, letterSpacing: '-0.02em' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: action ? 28 : 0, fontFamily: F }}>
        {desc}
      </p>
      {action}
    </div>
  )
}

function SkeletonSection() {
  const pulse: React.CSSProperties = {
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    backgroundColor: '#f1f5f9', borderRadius: 8,
  }
  return (
    <div>
      <div style={{ ...pulse, height: 26, width: 260, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ ...pulse, height: 360, borderRadius: 16 }} />)}
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  display: 'inline-block', padding: '11px 28px', borderRadius: 12,
  background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
  color: '#fff', fontWeight: 700, fontFamily: F, fontSize: 14,
  textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
}
