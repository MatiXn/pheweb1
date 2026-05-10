// PrivacyConsentModal — Story 10.4: Datenschutzerklärung Zustimmungsprozess
// Shown when profile.privacy_policy_consented_version is null or outdated
// User must accept before accessing the app

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const CURRENT_PRIVACY_VERSION = '2026-05-01'

interface PrivacyConsentModalProps {
  onAccepted: () => void
}

export function PrivacyConsentModal({ onAccepted }: PrivacyConsentModalProps) {
  const [accepting, setAccepting] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleAccept() {
    setError(null)
    setAccepting(true)
    const { error: rpcError } = await supabase.rpc('consent_privacy_policy', {
      p_version: CURRENT_PRIVACY_VERSION,
    })
    setAccepting(false)
    if (rpcError) {
      setError('Fehler beim Speichern. Bitte versuchen Sie es erneut.')
      return
    }
    onAccepted()
  }

  async function handleDecline() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 16, maxWidth: 520, width: '100%',
        padding: '40px 40px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        fontFamily: F,
      }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>
          Datenschutzerklärung
        </h2>
        <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 20px' }}>
          Unsere Datenschutzerklärung wurde aktualisiert (Stand: {CURRENT_PRIVACY_VERSION}).
          Bitte lesen und akzeptieren Sie die aktuelle Version, um fortzufahren.
        </p>

        <div style={{
          backgroundColor: '#f7f8fc', borderRadius: 8, padding: '16px 20px',
          marginBottom: 24, fontSize: 14, color: '#374151', lineHeight: 1.7,
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Wichtige Informationen:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Ihre personenbezogenen Daten werden gemäß DSGVO verarbeitet</li>
            <li>Sie können Ihre Daten jederzeit einsehen oder löschen lassen</li>
            <li>Ihre Daten werden nicht ohne Einwilligung an Dritte weitergegeben</li>
            <li>Bei inaktiven Konten erfolgt eine Löschung nach 12 Monaten</li>
          </ul>
          <p style={{ margin: '12px 0 0' }}>
            <a
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#3b72b8', fontWeight: 500 }}
            >
              Vollständige Datenschutzerklärung lesen →
            </a>
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleAccept}
            disabled={accepting}
            style={{
              flex: 1, minWidth: 160, padding: '12px 24px', borderRadius: 8,
              fontSize: 15, fontWeight: 600, fontFamily: F,
              backgroundColor: '#3b72b8', color: '#fff', border: 'none',
              cursor: accepting ? 'not-allowed' : 'pointer',
              opacity: accepting ? 0.7 : 1,
            }}
          >
            {accepting ? 'Wird gespeichert…' : 'Akzeptieren & fortfahren'}
          </button>
          <button
            onClick={handleDecline}
            disabled={accepting}
            style={{
              padding: '12px 20px', borderRadius: 8, fontSize: 15, fontWeight: 500,
              fontFamily: F, backgroundColor: 'transparent', color: '#6b7280',
              border: '1px solid #e5e7eb', cursor: 'pointer',
            }}
          >
            Ablehnen & abmelden
          </button>
        </div>
      </div>
    </div>
  )
}

export { CURRENT_PRIVACY_VERSION }
