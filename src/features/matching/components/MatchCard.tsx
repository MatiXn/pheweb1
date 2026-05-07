// MatchCard — 2030 Redesign
// Anonymisierte Kandidatenkarte mit Score-Gauge, sauberer Datenhierarchie, modernem Layout

import { useEffect, useRef } from 'react'
import type { CandidateCard, CandidateAvailability, InteractionStatus } from '../types'
import { useInteractionTransition } from '../hooks/useInteractionTransition'
import { useShortlistToggle } from '../hooks/useShortlistToggle'
import { InterestButton } from './InterestButton'
import { RevealedCandidateCard } from './RevealedCandidateCard'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:   '#3b72b8',
  accentBg: '#eff6ff',
  accentDk: '#2558a0',
  text:     '#0f172a',
  muted:    '#64748b',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
  bg:       '#f8fafc',
  green:    '#10b981',
  greenBg:  '#ecfdf5',
  greenBd:  '#a7f3d0',
  amber:    '#f59e0b',
  amberBg:  '#fefce8',
  amberBd:  '#fde68a',
}

const CATEGORY: Record<string, { bg: string; color: string; bd: string; label: string }> = {
  top_match:   { bg: '#ecfdf5', color: '#059669', bd: '#a7f3d0', label: 'Top Match'    },
  good_match:  { bg: '#eff6ff', color: '#2563eb', bd: '#bfdbfe', label: 'Guter Match'  },
  interesting: { bg: '#fefce8', color: '#ca8a04', bd: '#fde68a', label: 'Interessant'  },
}

const AVAILABILITY: Record<CandidateAvailability, string> = {
  immediate:  'Sofort',
  '1_month':  'In 1 Monat',
  '3_months': 'In 3 Monaten',
  '6_months': 'In 6 Monaten',
  flexible:   'Flexibel',
}

const EDUCATION: Record<string, string> = {
  none:       'Kein Abschluss',
  ausbildung: 'Ausbildung',
  studium:    'Studium',
}

const REVEALED: InteractionStatus[] = [
  'interested', 'token_sent', 'candidate_approved', 'candidate_declined',
  'candidate_timeout', 'interview_planned', 'interview_done', 'hired', 'not_hired',
]

// ── Score Donut Gauge ─────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const pct   = Math.min(100, Math.max(0, Math.round(score)))
  const deg   = pct * 3.6
  const color = pct >= 70 ? C.green : pct >= 45 ? C.accent : C.amber
  const bg    = pct >= 70 ? C.greenBg : pct >= 45 ? C.accentBg : C.amberBg

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div style={{
        width:        58,
        height:       58,
        borderRadius: '50%',
        background:   `conic-gradient(from -90deg, ${color} ${deg}deg, #e2e8f0 0deg)`,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width:           42,
          height:          42,
          borderRadius:    '50%',
          backgroundColor: bg,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          <span style={{ fontSize: 15, fontWeight: 800, color, fontFamily: F, lineHeight: 1 }}>
            {pct}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.faint, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: F }}>
        Score
      </span>
    </div>
  )
}

// ── Score Bars ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct   = Math.min(100, Math.max(0, Math.round(value)))
  const color = pct >= 70 ? C.green : pct >= 45 ? C.accent : C.amber

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: C.faint, fontFamily: F, width: 80, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 2, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 10, color: C.faint, fontFamily: F, width: 26, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  )
}

// ── Info Row ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: C.faint, fontFamily: F, minWidth: 68, flexShrink: 0, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.text, fontFamily: F, fontWeight: 600 }}>{value}</span>
    </div>
  )
}

// ── MatchCard ─────────────────────────────────────────────────────────────────

interface MatchCardProps {
  card: CandidateCard
  onRefetch: () => void
}

export function MatchCard({ card, onRefetch }: MatchCardProps) {
  const { transitionToNew } = useInteractionTransition()
  const { isShortlisted, toggle: toggleShortlist, isToggling } = useShortlistToggle(card.matchId, card.isShortlisted)
  const transitionedRef = useRef(false)

  useEffect(() => {
    if (card.currentStatus === null && !transitionedRef.current) {
      transitionedRef.current = true
      transitionToNew(card.matchId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.matchId, card.currentStatus])

  if (card.currentStatus && REVEALED.includes(card.currentStatus)) {
    return <RevealedCandidateCard card={card} onRefetch={onRefetch} />
  }

  const cat   = CATEGORY[card.category] ?? CATEGORY.interesting
  const isNew = card.currentStatus === null || card.currentStatus === 'new'

  return (
    <div style={{
      backgroundColor: C.white,
      borderRadius:    16,
      border:          '1px solid #e2e8f0',
      boxShadow:       '0 1px 3px rgba(15,23,42,0.05)',
      padding:         '20px',
      display:         'flex',
      flexDirection:   'column',
      gap:             16,
      fontFamily:      F,
      transition:      'box-shadow 0.2s',
      minWidth:        0,
    }}>

      {/* Header: Category + New badge + Score gauge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{
              fontSize:        11, fontWeight: 700,
              backgroundColor: cat.bg, color: cat.color,
              border:          `1px solid ${cat.bd}`,
              padding:         '3px 10px', borderRadius: 99,
              letterSpacing:   '0.01em',
            }}>
              {cat.label}
            </span>
            <span style={{
              fontSize:        11, fontWeight: 600,
              backgroundColor: isNew ? '#eff6ff' : C.bg,
              color:           isNew ? C.accent : C.faint,
              border:          `1px solid ${isNew ? '#bfdbfe' : C.border}`,
              padding:         '3px 10px', borderRadius: 99,
            }}>
              {isNew ? 'Neu' : 'Gesehen'}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.35, letterSpacing: '-0.01em' }}>
            {card.professionalTitle}
          </div>
        </div>
        <ScoreGauge score={card.score} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#f1f5f9', margin: '0 -4px' }} />

      {/* Info Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <InfoRow label="Standort"  value={card.locationCity} />
        <InfoRow label="Erfahrung" value={`${card.experienceYears} Jahre`} />
        <InfoRow label="Bildung"   value={EDUCATION[card.educationType] ?? card.educationType} />
      </div>

      {/* Availability + Salary */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11, fontWeight: 600,
          backgroundColor: '#eff6ff', color: C.accentDk,
          border: '1px solid #bfdbfe', borderRadius: 8, padding: '4px 10px',
        }}>
          {AVAILABILITY[card.availability] ?? card.availability}
        </span>
        {card.salaryExpectation != null && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            backgroundColor: C.bg, color: C.muted,
            border: `1px solid ${C.border}`, borderRadius: 8, padding: '4px 10px',
          }}>
            {card.salaryExpectation.toLocaleString('de-DE')} {card.salaryCurrency}/Jahr
          </span>
        )}
      </div>

      {/* Score breakdown */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
          Aufschlüsselung
        </div>
        <ScoreBar label="Skills"        value={card.skillScore} />
        <ScoreBar label="Erfahrung"     value={card.experienceScore} />
        <ScoreBar label="Region"        value={card.locationScore} />
        <ScoreBar label="Verfügbarkeit" value={card.availabilityScore} />
        <ScoreBar label="Gehalt"        value={card.salaryScore} />
      </div>

      {/* Skills */}
      {(card.skills ?? []).length > 0 && (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(card.skills ?? []).slice(0, 5).map((skill, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 500,
              backgroundColor: C.bg, color: C.text,
              border: `1px solid ${C.border}`, borderRadius: 6, padding: '3px 8px',
            }}>
              {skill.name}
            </span>
          ))}
          {(card.skills ?? []).length > 5 && (
            <span style={{ fontSize: 11, color: C.faint, padding: '3px 0', alignSelf: 'center' }}>
              +{(card.skills ?? []).length - 5}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: C.faint, fontFamily: F, letterSpacing: '0.03em' }}>
            {card.anonymousId}
          </span>
          <button
            type="button"
            onClick={toggleShortlist}
            disabled={isToggling}
            aria-label={isShortlisted ? 'Vormerken aufheben' : 'Kandidat vormerken'}
            style={{
              background: 'none', border: 'none',
              cursor:   isToggling ? 'not-allowed' : 'pointer',
              padding:  '2px 6px', fontSize: 15,
              color:    isShortlisted ? '#f59e0b' : C.faint,
              opacity:  isToggling ? 0.4 : 1, lineHeight: 1,
            }}
          >
            {isShortlisted ? '★' : '☆'}
          </button>
        </div>
        <InterestButton matchId={card.matchId} currentStatus={card.currentStatus} onSuccess={onRefetch} />
      </div>
    </div>
  )
}
