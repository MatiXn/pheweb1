// UnternehmenMatchDashboardPage — Match-Übersicht für Unternehmen
// Route: /unternehmen/matches

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useCompanyMatches } from '../features/matching/hooks/useCompanyMatches'
import { MatchCard } from '../features/matching/components/MatchCard'
import { AppShell } from '../components/AppShell'
import { Link } from 'react-router-dom'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:   '#3b72b8',
  accentBg: '#eef4ff',
  text:     '#111827',
  muted:    '#6b7280',
  faint:    '#9ca3af',
  border:   '#e5e7eb',
  white:    '#ffffff',
  green:    '#16a34a',
  greenBg:  '#f0fdf4',
  greenBd:  '#bbf7d0',
  amber:    '#d97706',
  amberBg:  '#fffbeb',
  amberBd:  '#fde68a',
  shadow:   '0 1px 3px rgba(0,0,0,0.08)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.08)',
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

  const displayJobs = showShortlistOnly
    ? data.map(job => ({ ...job, topCandidates: job.topCandidates.filter(c => c.isShortlisted) })).filter(job => job.topCandidates.length > 0)
    : data

  return (
    <AppShell>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F }}>
              Ihre Matches
            </h1>
            <p style={{ fontSize: 14, color: C.muted, fontFamily: F }}>
              Anonymisierte Kandidaten-Empfehlungen für Ihre aktiven Stellenausschreibungen.
            </p>
          </div>

          {/* Stats */}
          {!matchesLoading && data.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <StatBadge label="Gesamt" value={totalMatches} />
              {newMatches > 0 && <StatBadge label="Neu" value={newMatches} highlight />}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {!matchesLoading && data.length > 0 && (
        <div style={{
          display:         'flex',
          gap:             2,
          marginBottom:    32,
          backgroundColor: '#f3f4f6',
          borderRadius:    10,
          padding:         4,
          width:           'fit-content',
        }}>
          {[
            { key: false, label: 'Alle Kandidaten' },
            { key: true,  label: '★  Vorgemerkt' },
          ].map(tab => (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => setShowShortlistOnly(tab.key)}
              style={{
                fontFamily:      F,
                fontSize:        13,
                fontWeight:      showShortlistOnly === tab.key ? 600 : 500,
                color:           showShortlistOnly === tab.key ? C.text : C.muted,
                backgroundColor: showShortlistOnly === tab.key ? C.white : 'transparent',
                border:          'none',
                borderRadius:    8,
                padding:         '8px 18px',
                cursor:          'pointer',
                boxShadow:       showShortlistOnly === tab.key ? C.shadow : 'none',
                transition:      'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {matchesLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[1, 2].map(i => (
            <SkeletonSection key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {!matchesLoading && error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border:          '1px solid #fecaca',
          borderRadius:    12,
          padding:         '20px 24px',
          color:           '#dc2626',
          fontFamily:      F,
          fontSize:        14,
        }}>
          Fehler beim Laden: {error}
        </div>
      )}

      {/* Empty state — keine Stellen / keine Matches */}
      {!matchesLoading && !error && data.length === 0 && (
        <EmptyState
          icon="🎯"
          title="Noch keine Matches"
          desc="Sobald aktive Kandidaten zu Ihren Stellenausschreibungen passen, erscheinen sie hier — vollständig anonymisiert."
          action={<Link to="/unternehmen/stelle-anlegen" style={btnStyle(C)}>Erste Stelle anlegen</Link>}
        />
      )}

      {/* Empty state — Vorgemerkt-Filter leer */}
      {!matchesLoading && !error && data.length > 0 && showShortlistOnly && displayJobs.length === 0 && (
        <EmptyState
          icon="★"
          title="Keine vorgemerkten Kandidaten"
          desc="Klicken Sie auf den Stern in einer Kandidatenkarte, um Kandidaten vorzumerken."
        />
      )}

      {/* Match sections */}
      {!matchesLoading && !error && displayJobs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {displayJobs.map(overview => (
            <section key={overview.jobId}>
              {/* Section header */}
              <div style={{
                display:        'flex',
                alignItems:     'center',
                gap:            12,
                marginBottom:   20,
                paddingBottom:  16,
                borderBottom:   `1px solid ${C.border}`,
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize:     18,
                    fontWeight:   700,
                    color:        C.text,
                    fontFamily:   F,
                    margin:       0,
                    letterSpacing: '-0.01em',
                  }}>
                    {overview.jobTitle}
                  </h2>
                </div>
                <span style={{
                  fontFamily:      F,
                  fontSize:        12,
                  fontWeight:      600,
                  padding:         '4px 12px',
                  borderRadius:    20,
                  backgroundColor: overview.jobStatus === 'active' ? C.greenBg : C.amberBg,
                  color:           overview.jobStatus === 'active' ? C.green : C.amber,
                  border:          `1px solid ${overview.jobStatus === 'active' ? C.greenBd : C.amberBd}`,
                }}>
                  {overview.topCandidates.length} {overview.topCandidates.length === 1 ? 'Kandidat' : 'Kandidaten'}
                </span>
              </div>

              {/* Cards grid */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap:                 16,
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

function StatBadge({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div style={{
      fontFamily:      F,
      fontSize:        13,
      padding:         '8px 16px',
      borderRadius:    10,
      backgroundColor: highlight ? '#eef4ff' : '#f3f4f6',
      color:           highlight ? '#3b72b8' : '#374151',
      fontWeight:      600,
      border:          highlight ? '1px solid #bfdbfe' : '1px solid #e5e7eb',
    }}>
      <span style={{ fontSize: 18, fontWeight: 800 }}>{value}</span>
      {' '}{label}
    </div>
  )
}

function EmptyState({ icon, title, desc, action }: { icon: string; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius:    16,
      border:          '1px solid #e5e7eb',
      padding:         '64px 40px',
      textAlign:       'center',
      maxWidth:        520,
      margin:          '0 auto',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>{icon}</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8, fontFamily: F }}>{title}</h2>
      <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: action ? 24 : 0, fontFamily: F }}>{desc}</p>
      {action}
    </div>
  )
}

function SkeletonSection() {
  const pulse = { animation: 'pulse 1.5s ease-in-out infinite', backgroundColor: '#f3f4f6', borderRadius: 8 }
  return (
    <div>
      <div style={{ ...pulse, height: 24, width: 240, marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ ...pulse, height: 280, borderRadius: 12 }} />)}
      </div>
    </div>
  )
}

function btnStyle(C: { accent: string; white: string }) {
  return {
    display:         'inline-block',
    padding:         '10px 24px',
    borderRadius:    10,
    backgroundColor: C.accent,
    color:           C.white,
    fontWeight:      600,
    fontFamily:      F,
    fontSize:        14,
    textDecoration:  'none',
    border:          'none',
    cursor:          'pointer',
  } as const
}
