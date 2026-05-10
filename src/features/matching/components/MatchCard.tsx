// MatchCard — Premium Redesign (hireez-inspired)
// Anonymisierte Kandidatenkarte mit Score-Gauge, Hover-Lift, Gradient-Accents

import { useEffect, useRef, useState } from 'react'
import type { CandidateCard, CandidateAvailability, InteractionStatus } from '../types'
import { useInteractionTransition } from '../hooks/useInteractionTransition'
import { useShortlistToggle } from '../hooks/useShortlistToggle'
import { InterestButton } from './InterestButton'
import { RevealedCandidateCard } from './RevealedCandidateCard'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:   '#2563eb',
  accentBg: '#eff6ff',
  accentDk: '#1d4ed8',
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
  purple:   '#7c3aed',
  purpleBg: '#f5f3ff',
  purpleBd: '#ddd6fe',
}

const CATEGORY: Record<string, { bg: string; color: string; bd: string; label: string; dot: string }> = {
  top_match:   { bg: C.greenBg,  color: C.green,  bd: C.greenBd,  label: 'Top Match',    dot: '#10b981' },
  good_match:  { bg: C.accentBg, color: C.accent,  bd: '#bfdbfe',  label: 'Guter Match',  dot: '#3b82f6' },
  interesting: { bg: C.amberBg,  color: C.amber,   bd: C.amberBd,  label: 'Interessant',  dot: '#f59e0b' },
}

const AVAILABILITY: Record<CandidateAvailability, string> = {
  immediate:  'Sofort verfügbar',
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
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? C.accent : '#f59e0b'
  const bg    = pct >= 70 ? C.greenBg : pct >= 45 ? C.accentBg : C.amberBg
  const label = pct >= 70 ? 'Stark' : pct >= 45 ? 'Gut' : 'Schwach'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `conic-gradient(from -90deg, ${color} ${deg}deg, #e2e8f0 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 0 3px ${bg}`,
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', backgroundColor: '#ffffff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: F, lineHeight: 1 }}>
            {pct}
          </span>
        </div>
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, color: color,
        letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: F,
        background: bg, borderRadius: 4, padding: '1px 5px',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Score Bars ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct   = Math.min(100, Math.max(0, Math.round(value)))
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? C.accent : '#f59e0b'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: C.faint, fontFamily: F, width: 84, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 99, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 99,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      <span style={{ fontSize: 11, color: C.muted, fontFamily: F, width: 28, textAlign: 'right', flexShrink: 0, fontWeight: 600 }}>
        {pct}%
      </span>
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
  const [hovered, setHovered] = useState(false)

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
  const isTopMatch = card.category === 'top_match'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: C.white,
        borderRadius:    16,
        border:          `1px solid ${hovered ? '#cbd5e1' : C.border}`,
        borderTop:       isTopMatch ? `3px solid ${C.green}` : `1px solid ${hovered ? '#cbd5e1' : C.border}`,
        boxShadow:       hovered
          ? '0 20px 48px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.08)'
          : '0 2px 8px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)',
        padding:         '20px',
        display:         'flex',
        flexDirection:   'column',
        gap:             16,
        fontFamily:      F,
        transition:      'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.2s',
        transform:       hovered ? 'translateY(-3px)' : 'translateY(0)',
        minWidth:        0,
        cursor:          'default',
      }}>

      {/* Header: Category + New badge + Score gauge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {/* Category badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 700,
              backgroundColor: cat.bg, color: cat.color,
              border: `1px solid ${cat.bd}`,
              padding: '3px 10px', borderRadius: 99,
              letterSpacing: '0.02em',
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                backgroundColor: cat.dot, flexShrink: 0,
              }} />
              {cat.label}
            </span>

            {/* New/Seen badge */}
            <span style={{
              fontSize: 11, fontWeight: 600,
              backgroundColor: isNew ? '#eff6ff' : C.bg,
              color:           isNew ? C.accent : C.faint,
              border:          `1px solid ${isNew ? '#bfdbfe' : C.border}`,
              padding:         '3px 10px', borderRadius: 99,
            }}>
              {isNew ? '✦ Neu' : 'Gesehen'}
            </span>
          </div>

          <div style={{
            fontSize: 15, fontWeight: 700, color: C.text,
            lineHeight: 1.35, letterSpacing: '-0.01em',
          }}>
            {card.professionalTitle}
          </div>
        </div>
        <ScoreGauge score={card.score} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: '#f1f5f9' }} />

      {/* Info grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px',
      }}>
        {[
          { label: 'Standort',   value: card.locationCity },
          { label: 'Erfahrung',  value: `${card.experienceYears} Jahre` },
          { label: 'Bildung',    value: EDUCATION[card.educationType] ?? card.educationType },
          { label: 'Verfügbar',  value: AVAILABILITY[card.availability] ?? card.availability },
        ].map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Salary chip */}
      {card.salaryExpectation != null && (
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            backgroundColor: C.purpleBg, color: C.purple,
            border: `1px solid ${C.purpleBd}`,
            borderRadius: 99, padding: '4px 12px',
          }}>
            {card.salaryExpectation.toLocaleString('de-DE')} {card.salaryCurrency}/Jahr
          </span>
        </div>
      )}

      {/* Score breakdown */}
      <div style={{
        background: C.bg, borderRadius: 10, padding: '12px 14px',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: C.faint,
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
        }}>
          Match-Aufschlüsselung
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
              backgroundColor: i === 0 ? C.accentBg : C.bg,
              color:           i === 0 ? C.accentDk : C.muted,
              border:          `1px solid ${i === 0 ? '#bfdbfe' : C.border}`,
              borderRadius:    6, padding: '3px 9px',
            }}>
              {skill.name}
            </span>
          ))}
          {(card.skills ?? []).length > 5 && (
            <span style={{ fontSize: 11, color: C.faint, padding: '3px 0', alignSelf: 'center' }}>
              +{(card.skills ?? []).length - 5} weitere
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, paddingTop: 4, borderTop: `1px solid ${C.border}`,
      }}>
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
              background: isShortlisted ? '#fefce8' : 'none',
              border: isShortlisted ? '1px solid #fde68a' : 'none',
              borderRadius: 6,
              cursor: isToggling ? 'not-allowed' : 'pointer',
              padding: '3px 7px', fontSize: 15,
              color: isShortlisted ? '#d97706' : C.faint,
              opacity: isToggling ? 0.4 : 1, lineHeight: 1,
              transition: 'all 0.15s',
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
