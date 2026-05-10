// RecruiterKandidatenPage — Premium Redesign (hireez-inspired)
// Route: /recruiter/kandidaten

import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'
import { AppShell, shellColors as C, shellFont as F } from '../components/AppShell'

interface RecruiterCandidate {
  candidate_id:       string
  anonymous_id:       string
  professional_title: string
  location_city:      string
  status:             string
  availability:       string
  match_count:        number
  active_match_count: number
  hired_count:        number
  created_at:         string
}

const STATUS_LABEL: Record<string, string> = {
  active:                   'Aktiv',
  inactive:                 'Nicht verfügbar',
  placed:                   'Vermittelt',
  ausstehend_verifizierung: 'Ausstehend',
  dokumente_erforderlich:   'Dokumente erforderlich',
  gesperrt:                 'Gesperrt',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  active:                   { bg: '#ecfdf5', color: '#059669', dot: '#10b981' },
  inactive:                 { bg: '#f8fafc', color: '#64748b', dot: '#94a3b8' },
  placed:                   { bg: '#f5f3ff', color: '#7c3aed', dot: '#8b5cf6' },
  ausstehend_verifizierung: { bg: '#fefce8', color: '#854d0e', dot: '#f59e0b' },
  dokumente_erforderlich:   { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
  gesperrt:                 { bg: '#fef2f2', color: '#dc2626', dot: '#ef4444' },
}

const AVAILABILITY_LABEL: Record<string, string> = {
  immediate:  'Sofort verfügbar',
  '1_month':  'In 1 Monat',
  '3_months': 'In 3 Monaten',
  '6_months': 'In 6 Monaten',
  flexible:   'Flexibel',
}

function StatBox({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      textAlign: 'center', padding: '12px 16px',
      background: accent && value > 0 ? '#eff6ff' : '#f8fafc',
      borderRadius: 10, border: `1px solid ${accent && value > 0 ? '#bfdbfe' : '#e2e8f0'}`,
      minWidth: 64,
    }}>
      <div style={{
        fontSize: 22, fontWeight: 800, fontFamily: F, lineHeight: 1,
        color: accent && value > 0 ? C.accent : C.text,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: C.faint, fontFamily: F, marginTop: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}

export default function RecruiterKandidatenPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const [candidates,      setCandidates]      = useState<RecruiterCandidate[]>([])
  const [isLoading,       setIsLoading]       = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [settingInactive, setSettingInactive] = useState<string | null>(null)
  const [hoveredId,       setHoveredId]       = useState<string | null>(null)

  useEffect(() => {
    if (!profile || profile.role !== 'recruiter') return
    setIsLoading(true)
    setError(null)
    supabase.rpc('get_recruiter_candidates').then(({ data, error: rpcError }) => {
      setIsLoading(false)
      if (rpcError) { setError('Kandidaten konnten nicht geladen werden.'); return }
      setCandidates((data ?? []) as RecruiterCandidate[])
    })
  }, [profile])

  if (profileLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'recruiter') return <Navigate to="/dashboard" replace />

  async function handleSetInactive(candidateId: string) {
    setSettingInactive(candidateId)
    const { error: rpcError } = await supabase.rpc('set_candidate_inactive', { p_candidate_id: candidateId })
    setSettingInactive(null)
    if (rpcError) { setError('Fehler: ' + rpcError.message); return }
    setCandidates(prev => prev.map(c => c.candidate_id === candidateId ? { ...c, status: 'inactive' } : c))
  }

  const activeCount = candidates.filter(c => c.status === 'active').length
  const placedCount = candidates.filter(c => c.status === 'placed').length

  return (
    <AppShell maxWidth={960}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{
            fontSize: 30, fontWeight: 800, letterSpacing: '-0.035em',
            margin: '0 0 6px', fontFamily: F, lineHeight: 1.15,
            background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Meine Kandidaten
          </h1>
          <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: 0 }}>
            {!isLoading && candidates.length > 0
              ? `${candidates.length} Kandidat${candidates.length !== 1 ? 'en' : ''} in Ihrer Pipeline`
              : 'Ihre Kandidaten-Pipeline'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {!isLoading && candidates.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <StatBox label="Aktiv" value={activeCount} accent />
              <StatBox label="Vermittelt" value={placedCount} />
              <StatBox label="Gesamt" value={candidates.length} />
            </div>
          )}
          <Link to="/recruiter/kandidat-hochladen" style={{
            padding: '11px 22px', borderRadius: 12, fontSize: 14, fontWeight: 700,
            fontFamily: F, textDecoration: 'none',
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: '#fff', whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Kandidat hochladen
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#dc2626',
          fontFamily: F, marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              height: 100, borderRadius: 14,
              background: '#f1f5f9',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 20, border: `1px solid ${C.border}`,
          padding: '64px 32px', textAlign: 'center',
          boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
            border: '1px solid #ddd6fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 20px',
          }}>
            👤
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: F, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Noch keine Kandidaten
          </h2>
          <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: '0 0 28px', lineHeight: 1.7 }}>
            Laden Sie Ihren ersten vorqualifizierten Kandidaten hoch.
          </p>
          <Link to="/recruiter/kandidat-hochladen" style={{
            display: 'inline-block', padding: '11px 28px', borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: F,
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            Kandidat hochladen
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {candidates.map(c => {
            const statusStyle = STATUS_STYLE[c.status] ?? STATUS_STYLE.inactive
            const isSettingThisInactive = settingInactive === c.candidate_id
            const canDeactivate = c.status === 'active' || c.status === 'ausstehend_verifizierung'
            const isHovered = hoveredId === c.candidate_id

            return (
              <div
                key={c.candidate_id}
                onMouseEnter={() => setHoveredId(c.candidate_id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: '#fff', borderRadius: 14,
                  border: `1px solid ${isHovered ? '#cbd5e1' : C.border}`,
                  padding: '18px 24px',
                  display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
                  transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                  boxShadow: isHovered
                    ? '0 8px 24px rgba(15,23,42,0.10), 0 2px 6px rgba(15,23,42,0.05)'
                    : '0 1px 4px rgba(15,23,42,0.05)',
                  transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                {/* Left: avatar + title + meta */}
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Avatar placeholder */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #eff6ff, #ddd6fe)',
                    border: '1px solid #bfdbfe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    👤
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: F }}>
                        {c.professional_title}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99,
                        backgroundColor: statusStyle.bg, color: statusStyle.color, fontFamily: F,
                        display: 'inline-flex', alignItems: 'center', gap: 4, border: `1px solid ${statusStyle.bg}`,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: statusStyle.dot }} />
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 12, color: C.muted, fontFamily: F, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>{c.location_city}</span>
                      <span style={{ color: C.faint }}>·</span>
                      <span>{AVAILABILITY_LABEL[c.availability] ?? c.availability}</span>
                      <span style={{ color: C.faint }}>·</span>
                      <span style={{ fontSize: 10, color: C.faint, fontFamily: 'monospace' }}>{c.anonymous_id}</span>
                    </div>
                  </div>
                </div>

                {/* Center: match stats */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <StatBox label="Matches" value={c.match_count} />
                  <StatBox label="Aktiv"   value={c.active_match_count} accent />
                  <StatBox label="Hired"   value={c.hired_count} />
                </div>

                {/* Right: action */}
                <div style={{ flexShrink: 0 }}>
                  {canDeactivate && (
                    <button
                      onClick={() => handleSetInactive(c.candidate_id)}
                      disabled={settingInactive !== null}
                      style={{
                        padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        fontFamily: F, cursor: settingInactive !== null ? 'not-allowed' : 'pointer',
                        border: '1px solid #fecaca', background: '#fef2f2',
                        color: isSettingThisInactive ? C.muted : '#dc2626',
                        opacity: settingInactive !== null && !isSettingThisInactive ? 0.5 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      {isSettingThisInactive ? 'Wird gesetzt…' : 'Nicht verfügbar'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
