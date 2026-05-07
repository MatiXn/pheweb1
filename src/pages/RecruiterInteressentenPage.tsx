// RecruiterInteressentenPage — Story 6.3 + Story 6.4 — 2030 Redesign
// Route: /recruiter/interessenten

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useRecruiterInterests } from '../features/matching/hooks/useRecruiterInterests'
import { useInteractionTransition } from '../features/matching/hooks/useInteractionTransition'
import { useRecruiterBlockAction } from '../features/matching/hooks/useRecruiterBlockAction'
import { AppShell } from '../components/AppShell'
import type { RecruiterInterestMatch } from '../features/matching/types'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:  '#3b72b8',
  text:    '#0f172a',
  muted:   '#64748b',
  faint:   '#94a3b8',
  border:  '#e2e8f0',
  white:   '#ffffff',
  bg:      '#f8fafc',
}

type PendingAction = { matchId: string; action: 'decline' | 'block'; companyId: string } | null

// ── Category Badge ─────────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: RecruiterInterestMatch['category'] }) {
  const cfg = {
    top_match:   { bg: '#ecfdf5', color: '#059669', bd: '#a7f3d0', label: 'Top Match'   },
    good_match:  { bg: '#eff6ff', color: '#2563eb', bd: '#bfdbfe', label: 'Guter Match' },
    interesting: { bg: '#fefce8', color: '#ca8a04', bd: '#fde68a', label: 'Interessant' },
  }[category]

  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.01em',
      backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.bd}`,
      padding: '3px 10px', borderRadius: 99,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Interest Card ──────────────────────────────────────────────────────────────

interface CardProps {
  match:         RecruiterInterestMatch
  isPaused:      boolean
  isPending:     boolean
  isConfirming:  boolean
  confirmAction: 'decline' | 'block' | null
  isActing:      boolean
  actionError:   string | null
  onDecline:     () => void
  onBlock:       () => void
  onConfirm:     () => void
  onCancel:      () => void
}

function InterestCard({ match, isPaused, isPending, isConfirming, confirmAction, isActing, actionError, onDecline, onBlock, onConfirm, onCancel }: CardProps) {
  const matchedDate = new Date(match.matchedAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })
  const disabled    = isPending || isActing

  const btnBase: CSSProperties = {
    borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, fontFamily: F,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, border: 'none',
  }

  return (
    <div style={{
      backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
      boxShadow: '0 1px 3px rgba(15,23,42,0.05)', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: 14, fontFamily: F,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, letterSpacing: '0.05em', marginBottom: 4 }}>
            Kandidat {match.anonymousId}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.01em' }}>
            {match.professionalTitle}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <CategoryBadge category={match.category} />
          <span style={{
            fontSize: 12, fontWeight: 700, fontFamily: F,
            backgroundColor: '#eff6ff', color: C.accent, border: '1px solid #bfdbfe',
            padding: '3px 10px', borderRadius: 99,
          }}>
            {Math.round(match.score)}%
          </span>
        </div>
      </div>

      {/* Match info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 13, color: C.muted }}>
          <strong style={{ color: C.text, fontWeight: 600 }}>{match.companyName}</strong>
          {' '}sucht{' '}
          <span style={{ fontStyle: 'normal', color: C.muted }}>{match.jobTitle}</span>
        </div>
        <div style={{ fontSize: 12, color: C.faint }}>Gematcht am {matchedDate}</div>
      </div>

      {/* Status / Paused badge */}
      {isPaused ? (
        <div>
          <span style={{
            fontSize: 11, fontWeight: 600, backgroundColor: C.bg, color: C.faint,
            border: `1px solid ${C.border}`, padding: '4px 10px', borderRadius: 99,
          }}>
            Vorübergehend pausiert
          </span>
          <p style={{ fontSize: 12, color: C.faint, margin: '6px 0 0', lineHeight: 1.5 }}>
            Dieser Prozess wurde aufgrund eines technischen Umstands auf Unternehmensseite pausiert.
          </p>
        </div>
      ) : (
        !isConfirming && (
          <span style={{
            alignSelf: 'flex-start', fontSize: 11, fontWeight: 600,
            backgroundColor: '#fefce8', color: '#ca8a04', border: '1px solid #fde68a',
            padding: '4px 10px', borderRadius: 99,
          }}>
            Interesse signalisiert — Kontaktaufnahme ausstehend
          </span>
        )
      )}

      {/* Action buttons */}
      {!isPaused && !isConfirming && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={onDecline} disabled={disabled}
            style={{ ...btnBase, backgroundColor: 'transparent', border: '1px solid #fecaca', color: '#dc2626' }}>
            Ablehnen
          </button>
          <button type="button" onClick={onBlock} disabled={disabled}
            style={{ ...btnBase, backgroundColor: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>
            Blockieren
          </button>
        </div>
      )}

      {/* Decline confirmation */}
      {!isPaused && isConfirming && confirmAction === 'decline' && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, margin: '0 0 4px', fontFamily: F }}>Ablehnen bestätigen?</p>
          <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 12px', fontFamily: F, lineHeight: 1.5 }}>
            Der Match wechselt zu "abgelehnt" und verschwindet aus dieser Liste.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={isActing} onClick={onConfirm}
              style={{ ...btnBase, backgroundColor: '#dc2626', color: '#fff' }}>
              {isActing ? 'Wird abgelehnt…' : 'Ja, ablehnen'}
            </button>
            <button type="button" disabled={isActing} onClick={onCancel}
              style={{ ...btnBase, backgroundColor: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>
              Abbrechen
            </button>
          </div>
          {actionError && <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', fontFamily: F }}>{actionError}</p>}
        </div>
      )}

      {/* Block confirmation */}
      {!isPaused && isConfirming && confirmAction === 'block' && (
        <div style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: '#92400e', fontWeight: 600, margin: '0 0 4px', fontFamily: F }}>Unternehmen dauerhaft blockieren?</p>
          <p style={{ fontSize: 12, color: '#b45309', margin: '0 0 12px', fontFamily: F, lineHeight: 1.5 }}>
            {match.companyName} wird aus allen zukünftigen Matches dieses Kandidaten ausgeschlossen.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" disabled={isActing} onClick={onConfirm}
              style={{ ...btnBase, backgroundColor: '#d97706', color: '#fff' }}>
              {isActing ? 'Wird blockiert…' : 'Ja, blockieren'}
            </button>
            <button type="button" disabled={isActing} onClick={onCancel}
              style={{ ...btnBase, backgroundColor: 'transparent', border: `1px solid ${C.border}`, color: C.muted }}>
              Abbrechen
            </button>
          </div>
          {actionError && <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', fontFamily: F }}>{actionError}</p>}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RecruiterInteressentenPage() {
  const { user }    = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const { matches, isLoading: matchesLoading, error, refetch } = useRecruiterInterests()
  const { transitionToCandidateDeclined } = useInteractionTransition()
  const { blockCompany }                  = useRecruiterBlockAction()

  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionError, setActionError]     = useState<string | null>(null)
  const [isActing, setIsActing]           = useState(false)

  if (profileLoading) return null
  if (!user || !profile) return <Navigate to="/login" replace />
  if (profile.role !== 'recruiter') return <Navigate to="/dashboard" replace />

  function handleInitDecline(match: RecruiterInterestMatch) {
    setActionError(null)
    setPendingAction({ matchId: match.matchId, action: 'decline', companyId: match.companyId })
  }

  function handleInitBlock(match: RecruiterInterestMatch) {
    setActionError(null)
    setPendingAction({ matchId: match.matchId, action: 'block', companyId: match.companyId })
  }

  function handleCancel() { setPendingAction(null); setActionError(null) }

  async function handleConfirm() {
    if (!pendingAction) return
    setIsActing(true)
    setActionError(null)
    const ok = pendingAction.action === 'decline'
      ? await transitionToCandidateDeclined(pendingAction.matchId)
      : await blockCompany(pendingAction.matchId, pendingAction.companyId)
    if (ok) { setPendingAction(null); refetch() }
    else setActionError(`${pendingAction.action === 'decline' ? 'Ablehnen' : 'Blockieren'} fehlgeschlagen.`)
    setIsActing(false)
  }

  return (
    <AppShell>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F }}>
          Interessenten
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', fontFamily: F }}>
          Kandidaten, für die ein Unternehmen Interesse signalisiert hat.
        </p>
      </div>

      {/* Loading */}
      {matchesLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 24, height: 140 }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!matchesLoading && error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', color: '#dc2626', fontFamily: F, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!matchesLoading && !error && matches.length === 0 && (
        <div style={{
          backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: '64px 40px', textAlign: 'center', maxWidth: 480, margin: '0 auto',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>—</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8, fontFamily: F }}>Noch keine Interessenten</h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, fontFamily: F }}>
            Sobald ein Unternehmen Interesse an einem Ihrer Kandidaten signalisiert, erscheint er hier.
          </p>
        </div>
      )}

      {/* List */}
      {!matchesLoading && !error && matches.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {matches.map(match => {
            const isThisPending    = pendingAction?.matchId === match.matchId
            const thisConfirmAction = isThisPending ? pendingAction!.action : null
            return (
              <InterestCard
                key={match.matchId}
                match={match}
                isPaused={match.currentStatus === 'paused'}
                isPending={!!pendingAction && !isThisPending}
                isConfirming={isThisPending}
                confirmAction={thisConfirmAction}
                isActing={isActing}
                actionError={isThisPending ? actionError : null}
                onDecline={() => handleInitDecline(match)}
                onBlock={() => handleInitBlock(match)}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
