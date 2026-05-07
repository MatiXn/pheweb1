// InterestButton — Story 6.2: Interesse-Signal Button mit Bestätigungs-Dialog
// Zeigt Bestätigungs-Overlay (kein window.confirm) vor dem Interesse-Signal

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useInteractionTransition } from '../hooks/useInteractionTransition'
import type { InteractionStatus } from '../types'

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"
const C = {
  accent:    '#3b72b8',
  accentDk:  '#2a5490',
  accentBg:  '#eef4ff',
  text:      '#0f1623',
  muted:     '#4b5675',
  border:    'rgba(15,22,35,0.08)',
  white:     '#ffffff',
  overlay:   'rgba(0,0,0,0.48)',
}

interface InterestButtonProps {
  matchId: string
  currentStatus: InteractionStatus | null
  onSuccess: () => void
}

export function InterestButton({ matchId, currentStatus, onSuccess }: InterestButtonProps) {
  const { transitionToInterested } = useInteractionTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)

  // Button ist disabled solange Match noch nicht als 'new' geloggt wurde
  const isDisabled = currentStatus === null || isLoading

  async function handleConfirm() {
    setIsLoading(true)
    const success = await transitionToInterested(matchId)
    setIsLoading(false)
    setShowConfirm(false)
    if (success) {
      onSuccess()
    }
  }

  const buttonStyle: CSSProperties = {
    fontFamily:    F,
    fontSize:      13,
    fontWeight:    600,
    color:         isDisabled ? C.muted : C.white,
    background:    isDisabled ? C.accentBg : C.accent,
    border:        `1px solid ${isDisabled ? 'rgba(59,114,184,0.25)' : C.accent}`,
    borderRadius:  10,
    padding:       '8px 16px',
    cursor:        isDisabled ? 'not-allowed' : 'pointer',
    transition:    'background 0.15s',
    width:         '100%',
    textAlign:     'center',
  }

  const overlayStyle: CSSProperties = {
    position:       'fixed',
    top:            0,
    left:           0,
    right:          0,
    bottom:         0,
    background:     C.overlay,
    zIndex:         1000,
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
  }

  const dialogStyle: CSSProperties = {
    background:   C.white,
    borderRadius: 14,
    padding:      '28px 32px',
    maxWidth:     420,
    width:        '90%',
    fontFamily:   F,
    boxShadow:    '0 16px 48px rgba(0,0,0,0.18)',
  }

  return (
    <>
      <button
        type="button"
        style={buttonStyle}
        disabled={isDisabled}
        onClick={() => setShowConfirm(true)}
      >
        {isLoading ? 'Wird gesendet…' : 'Interesse bekunden'}
      </button>

      {showConfirm && (
        <div style={overlayStyle} onClick={() => setShowConfirm(false)}>
          <div style={dialogStyle} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 700, color: C.text }}>
              Interesse bekunden?
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: C.muted, lineHeight: 1.55 }}>
              Durch diesen Schritt wird der zuständige Recruiter benachrichtigt.
              Sie erhalten dann die Kontaktdaten des Recruiters, der diesen Kandidaten betreut.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600,
                  color: C.muted, background: 'transparent',
                  border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '8px 16px', cursor: 'pointer',
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600,
                  color: C.white, background: isLoading ? C.accentBg : C.accent,
                  border: `1px solid ${C.accent}`, borderRadius: 8,
                  padding: '8px 16px', cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Wird gesendet…' : 'Ja, Interesse bekunden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
