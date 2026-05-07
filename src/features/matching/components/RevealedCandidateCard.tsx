// RevealedCandidateCard — 2030 Redesign
// Zeigt Recruiter-Kontakt + Prozess-Status nach Interesse-Signal

import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useRevealedCandidate } from '../hooks/useRevealedCandidate'
import { useInteractionTransition } from '../hooks/useInteractionTransition'
import type { CandidateCard, InteractionStatus } from '../types'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:   '#3b72b8',
  accentBg: '#eff6ff',
  text:     '#0f172a',
  muted:    '#64748b',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
  bg:       '#f8fafc',
  green:    '#10b981',
  greenBg:  '#ecfdf5',
  greenBd:  '#a7f3d0',
  blue:     '#2563eb',
  blueBg:   '#eff6ff',
  blueBd:   '#bfdbfe',
  gray:     '#6b7280',
  grayBg:   '#f3f4f6',
  grayBd:   '#d1d5db',
}

const STATUS_BADGE: Partial<Record<InteractionStatus, { label: string; color: string; bg: string; bd: string }>> = {
  interested:         { label: 'Interesse bekundet',      color: C.green, bg: C.greenBg, bd: C.greenBd },
  token_sent:         { label: 'Kontakt hergestellt',     color: C.blue,  bg: C.blueBg,  bd: C.blueBd  },
  candidate_approved: { label: 'Kandidat zugestimmt',     color: C.blue,  bg: C.blueBg,  bd: C.blueBd  },
  interview_planned:  { label: 'Interview geplant',        color: C.blue,  bg: C.blueBg,  bd: C.blueBd  },
  interview_done:     { label: 'Interview abgeschlossen', color: C.green, bg: C.greenBg, bd: C.greenBd },
  hired:              { label: 'Eingestellt',             color: C.green, bg: C.greenBg, bd: C.greenBd },
  not_hired:          { label: 'Absage erteilt',          color: C.gray,  bg: C.grayBg,  bd: C.grayBd  },
  candidate_declined: { label: 'Abgelehnt',               color: C.gray,  bg: C.grayBg,  bd: C.grayBd  },
  candidate_timeout:  { label: 'Keine Rückmeldung',       color: C.gray,  bg: C.grayBg,  bd: C.grayBd  },
}

const PROCESS_STATUSES: InteractionStatus[] = [
  'interested', 'token_sent', 'candidate_approved', 'interview_planned',
]

interface Props {
  card: CandidateCard
  onRefetch: () => void
}

export function RevealedCandidateCard({ card, onRefetch }: Props) {
  const { contact, isLoading, error } = useRevealedCandidate(card.matchId, card.currentStatus)
  const { transitionToInterviewPlanned, transitionToNotHired } = useInteractionTransition()

  const [isActing, setIsActing]               = useState(false)
  const [confirmNotHired, setConfirmNotHired] = useState(false)
  const [actionError, setActionError]         = useState<string | null>(null)

  const badge = card.currentStatus
    ? (STATUS_BADGE[card.currentStatus] ?? STATUS_BADGE.interested!)
    : STATUS_BADGE.interested!

  const showActions       = card.currentStatus !== null && PROCESS_STATUSES.includes(card.currentStatus)
  const showInterviewBtn  = showActions && card.currentStatus !== 'interview_planned'

  async function handleInterviewPlanned() {
    if (isActing) return
    setIsActing(true)
    setActionError(null)
    const ok = await transitionToInterviewPlanned(card.matchId)
    setIsActing(false)
    if (ok) onRefetch()
    else setActionError('Status konnte nicht gesetzt werden.')
  }

  async function handleNotHiredConfirm() {
    if (isActing) return
    setIsActing(true)
    setActionError(null)
    const ok = await transitionToNotHired(card.matchId)
    setIsActing(false)
    if (ok) { setConfirmNotHired(false); onRefetch() }
    else setActionError('Status konnte nicht gesetzt werden.')
  }

  const cardStyle: CSSProperties = {
    backgroundColor: C.white,
    borderRadius:    16,
    border:          '1px solid #e2e8f0',
    boxShadow:       '0 1px 3px rgba(15,23,42,0.05)',
    padding:         20,
    fontFamily:      F,
    display:         'flex',
    flexDirection:   'column',
    gap:             16,
  }

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700,
          backgroundColor: badge!.bg, color: badge!.color, border: `1px solid ${badge!.bd}`,
          padding: '3px 10px', borderRadius: 99,
        }}>
          {badge!.label}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[100, 140, 80].map((w, i) => (
            <div key={i} style={{ height: 12, width: w, backgroundColor: C.bg, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={cardStyle}>

      {/* Status badge */}
      <span style={{
        display:         'inline-block',
        alignSelf:       'flex-start',
        fontSize:        11, fontWeight: 700,
        backgroundColor: badge!.bg, color: badge!.color,
        border:          `1px solid ${badge!.bd}`,
        padding:         '3px 10px', borderRadius: 99,
        letterSpacing:   '0.01em',
      }}>
        {badge!.label}
      </span>

      {/* Candidate summary */}
      <div style={{ paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3, letterSpacing: '-0.01em' }}>
          {card.professionalTitle}
        </div>
        <div style={{ fontSize: 12, color: C.faint }}>
          {card.locationCity} · {card.experienceYears} Jahre · {card.anonymousId}
        </div>
      </div>

      {/* Recruiter contact */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
          Recruiter-Kontakt
        </div>

        {error ? (
          <p style={{ fontSize: 13, color: C.faint, margin: 0 }}>Kontaktdaten konnten nicht geladen werden.</p>
        ) : contact ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ContactRow label="Name" value={`${contact.recruiterFirstName} ${contact.recruiterLastName}`} />
            <ContactRow label="E-Mail" value={contact.recruiterEmail} href={`mailto:${contact.recruiterEmail}`} />
            {contact.recruiterPhone && (
              <ContactRow label="Telefon" value={contact.recruiterPhone} href={`tel:${contact.recruiterPhone}`} />
            )}
          </div>
        ) : null}
      </div>

      {/* Process actions */}
      {showActions && (
        <div style={{ paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
            Prozess-Status
          </div>

          {!confirmNotHired ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {showInterviewBtn && (
                <button
                  type="button"
                  onClick={handleInterviewPlanned}
                  disabled={isActing}
                  style={actionBtn('#eff6ff', C.blue, '#bfdbfe', isActing)}
                >
                  Interview geplant
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmNotHired(true)}
                disabled={isActing}
                style={actionBtn('transparent', '#dc2626', '#fecaca', isActing)}
              >
                Absage erteilen
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <p style={{ fontSize: 13, color: '#991b1b', fontWeight: 600, margin: '0 0 6px', fontFamily: F }}>
                Absage wirklich erteilen?
              </p>
              <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 12px', fontFamily: F, lineHeight: 1.5 }}>
                Diese Aktion kann nicht rückgängig gemacht werden.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleNotHiredConfirm}
                  disabled={isActing}
                  style={actionBtn('#dc2626', '#fff', 'transparent', isActing, true)}
                >
                  {isActing ? 'Wird gespeichert…' : 'Ja, Absage erteilen'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmNotHired(false)}
                  disabled={isActing}
                  style={actionBtn('transparent', C.muted, C.border, isActing)}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}

          {actionError && (
            <p style={{ fontSize: 12, color: '#dc2626', margin: '8px 0 0', fontFamily: F }}>{actionError}</p>
          )}
        </div>
      )}
    </div>
  )
}

function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Inter', sans-serif", minWidth: 52, flexShrink: 0 }}>{label}</span>
      {href ? (
        <a href={href} style={{ fontSize: 13, fontWeight: 600, color: '#3b72b8', textDecoration: 'none', fontFamily: "'Inter', sans-serif" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: "'Inter', sans-serif" }}>{value}</span>
      )}
    </div>
  )
}

function actionBtn(bg: string, color: string, bd: string, disabled: boolean, solid = false): CSSProperties {
  return {
    backgroundColor: bg,
    color,
    border:          solid ? 'none' : `1px solid ${bd}`,
    borderRadius:    8,
    padding:         '7px 14px',
    fontSize:        12,
    fontWeight:      600,
    fontFamily:      F,
    cursor:          disabled ? 'not-allowed' : 'pointer',
    opacity:         disabled ? 0.5 : 1,
  }
}
