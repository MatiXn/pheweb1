// MatchRejectionModal — Story 5.4: Match als „Nicht passend" markieren (Feedback-Loop)
// Feedback-Formular mit Mehrfachauswahl — wird von Story 6.1 (Match-Karten) integriert

import { useState } from 'react'
import { REJECTION_REASONS } from '../types'
import { useMatchRejection } from '../hooks/useMatchRejection'

interface MatchRejectionModalProps {
  matchId: string
  onSuccess: (matchId: string) => void
  onClose: () => void
}

export function MatchRejectionModal({ matchId, onSuccess, onClose }: MatchRejectionModalProps) {
  const [selected, setSelected] = useState<string[]>([])
  const { rejectMatch, loading, error } = useMatchRejection({ onSuccess })

  function toggleReason(reason: string) {
    setSelected((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason],
    )
  }

  async function handleConfirm() {
    const ok = await rejectMatch(matchId, selected)
    if (ok) onClose()
  }

  return (
    <div style={OVERLAY_STYLE}>
      <div style={MODAL_STYLE} role="dialog" aria-modal="true" aria-labelledby="rejection-title">
        <h3 id="rejection-title" style={{ margin: '0 0 8px', fontSize: 18, color: '#1a1a2e' }}>
          Kandidat als „Nicht passend" markieren
        </h3>
        <p style={{ marginBottom: 20, color: '#666', fontSize: 14, lineHeight: 1.5 }}>
          Optional: Warum passt dieser Kandidat nicht? (Mehrfachauswahl möglich)
        </p>

        <div style={{ marginBottom: 8 }}>
          {REJECTION_REASONS.map((reason) => (
            <label key={reason} style={CHECKBOX_ROW_STYLE}>
              <input
                type="checkbox"
                checked={selected.includes(reason)}
                onChange={() => toggleReason(reason)}
                disabled={loading}
                style={{ marginRight: 10, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14 }}>{reason}</span>
            </label>
          ))}
        </div>

        {error && (
          <p style={{ color: '#c00', fontSize: 13, marginTop: 8, marginBottom: 0 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button onClick={onClose} disabled={loading} style={SECONDARY_BTN_STYLE}>
            Abbrechen
          </button>
          <button onClick={handleConfirm} disabled={loading} style={PRIMARY_BTN_STYLE}>
            {loading ? 'Wird gespeichert…' : 'Bestätigen'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Inline-Styles — Projekt-Pattern: kein CSS-Framework, Design Tokens aus bestehenden Komponenten
import type { CSSProperties } from 'react'

const OVERLAY_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
}

const MODAL_STYLE: CSSProperties = {
  background: '#ffffff',
  borderRadius: 8,
  padding: 32,
  maxWidth: 480,
  width: '90%',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
}

const CHECKBOX_ROW_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: '10px 0',
  borderBottom: '1px solid #f0f0f0',
}

const PRIMARY_BTN_STYLE: CSSProperties = {
  background: '#1a1a2e',
  color: '#ffffff',
  border: 'none',
  borderRadius: 6,
  padding: '10px 20px',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 14,
}

const SECONDARY_BTN_STYLE: CSSProperties = {
  background: '#f5f5f5',
  color: '#333333',
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: '10px 20px',
  cursor: 'pointer',
  fontSize: 14,
}
