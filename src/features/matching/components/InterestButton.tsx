// InterestButton — Premium Redesign (hireez-inspired)
// Gradient-Button mit Bestätigungs-Dialog, kein window.confirm

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { useInteractionTransition } from '../hooks/useInteractionTransition'
import type { InteractionStatus } from '../types'

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

const C = {
  accent:   '#2563eb',
  accentDk: '#1d4ed8',
  accentBg: '#eff6ff',
  text:     '#0f172a',
  muted:    '#475569',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
}

interface InterestButtonProps {
  matchId: string
  currentStatus: InteractionStatus | null
  onSuccess: () => void
}

export function InterestButton({ matchId, currentStatus, onSuccess }: InterestButtonProps) {
  const { transitionToInterested } = useInteractionTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading]     = useState(false)

  const isDisabled = currentStatus === null || isLoading

  async function handleConfirm() {
    setIsLoading(true)
    const success = await transitionToInterested(matchId)
    setIsLoading(false)
    setShowConfirm(false)
    if (success) onSuccess()
  }

  const buttonStyle: CSSProperties = {
    fontFamily:  F,
    fontSize:    13,
    fontWeight:  700,
    color:       isDisabled ? C.faint : C.white,
    background:  isDisabled
      ? C.accentBg
      : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    border:      isDisabled ? `1px solid #bfdbfe` : 'none',
    borderRadius: 10,
    padding:     '9px 16px',
    cursor:      isDisabled ? 'not-allowed' : 'pointer',
    transition:  'all 0.2s',
    letterSpacing: '-0.01em',
    boxShadow:   isDisabled ? 'none' : '0 2px 8px rgba(37,99,235,0.3)',
  }

  const overlayStyle: CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15,23,42,0.5)',
    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
  }

  const dialogStyle: CSSProperties = {
    background:   C.white,
    borderRadius: 20,
    padding:      '32px 36px',
    maxWidth:     440,
    width:        '90%',
    fontFamily:   F,
    boxShadow:    '0 24px 64px rgba(15,23,42,0.2), 0 8px 24px rgba(15,23,42,0.10)',
    border:       '1px solid rgba(226,232,240,0.8)',
  }

  return (
    <>
      <button type="button" style={buttonStyle} disabled={isDisabled} onClick={() => setShowConfirm(true)}>
        {isLoading ? 'Wird gesendet…' : 'Interesse bekunden'}
      </button>

      {showConfirm && (
        <div style={overlayStyle} onClick={() => setShowConfirm(false)}>
          <div style={dialogStyle} onClick={e => e.stopPropagation()}>

            {/* Icon */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: C.accentBg, border: '2px solid #bfdbfe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 20,
            }}>
              💬
            </div>

            <h3 style={{
              margin: '0 0 10px', fontSize: 20, fontWeight: 800,
              color: C.text, letterSpacing: '-0.03em',
            }}>
              Interesse bekunden?
            </h3>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
              Durch diesen Schritt wird der zuständige Recruiter benachrichtigt.
              Sie erhalten dann die Kontaktdaten des Recruiters, der diesen Kandidaten betreut.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 600,
                  color: C.muted, background: '#f8fafc',
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: '11px 16px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                  color: C.white,
                  background: isLoading ? C.accentBg : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                  border: 'none', borderRadius: 12, padding: '11px 16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.35)',
                  transition: 'all 0.2s', letterSpacing: '-0.01em',
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
