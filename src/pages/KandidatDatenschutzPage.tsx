// KandidatDatenschutzPage — Story 10.1 (Konto löschen) + 10.3 (Daten exportieren)
// Route: /kandidat/datenschutz
// DSGVO Art. 17 (Recht auf Löschung) + Art. 20 (Datenübertragbarkeit)

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'
import { AppShell, shellColors as C, shellFont as F } from '../components/AppShell'

export default function KandidatDatenschutzPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const navigate = useNavigate()

  const [deleteStep,    setDeleteStep]    = useState<'idle' | 'confirm' | 'deleting' | 'done'>('idle')
  const [exporting,     setExporting]     = useState(false)
  const [deleteError,   setDeleteError]   = useState<string | null>(null)
  const [exportError,   setExportError]   = useState<string | null>(null)
  const [confirmText,   setConfirmText]   = useState('')

  if (profileLoading) return null
  if (!profile)       return <Navigate to="/login" replace />

  // Allow kandidat, recruiter, unternehmen — all roles may request deletion
  async function handleDeleteAccount() {
    setDeleteError(null)
    setDeleteStep('deleting')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setDeleteError('Sitzung abgelaufen. Bitte neu anmelden.'); setDeleteStep('confirm'); return }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setDeleteError(body.error ?? 'Fehler beim Löschen. Bitte kontaktieren Sie support@phe-perm.de.')
      setDeleteStep('confirm')
      return
    }

    setDeleteStep('done')
    // Auth token now invalid — navigate after brief delay
    setTimeout(() => navigate('/login', { replace: true }), 3000)
  }

  async function handleExportData() {
    setExportError(null)
    setExporting(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setExportError('Sitzung abgelaufen.'); setExporting(false); return }

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-user-data`,
      {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      }
    )

    setExporting(false)

    if (!res.ok) {
      setExportError('Export fehlgeschlagen. Bitte versuchen Sie es erneut.')
      return
    }

    // Trigger browser download
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `phe-daten-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (deleteStep === 'done') {
    return (
      <AppShell maxWidth={640}>
        <div style={{
          backgroundColor: '#fff', borderRadius: 16, border: `1px solid ${C.border}`,
          padding: '60px 40px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: F, margin: '0 0 12px' }}>
            Konto erfolgreich gelöscht
          </h2>
          <p style={{ fontSize: 15, color: C.muted, fontFamily: F, lineHeight: 1.6 }}>
            Alle Ihre Daten wurden gemäß DSGVO Art. 17 gelöscht oder pseudonymisiert.
            Sie werden automatisch abgemeldet.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell maxWidth={640}>
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.02em',
        margin: '0 0 8px', fontFamily: F,
      }}>
        Datenschutz & Meine Daten
      </h1>
      <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: '0 0 40px' }}>
        Verwalten Sie Ihre Daten gemäß DSGVO.
      </p>

      {/* Data Export — Art. 20 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, border: `1px solid ${C.border}`,
        padding: '28px 32px', marginBottom: 20,
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: F, margin: '0 0 8px' }}>
          Meine Daten exportieren
        </h2>
        <p style={{ fontSize: 14, color: C.muted, fontFamily: F, lineHeight: 1.6, margin: '0 0 20px' }}>
          Laden Sie eine Kopie aller bei uns gespeicherten Daten herunter (DSGVO Art. 20 —
          Recht auf Datenübertragbarkeit). Die Datei wird als JSON bereitgestellt.
        </p>
        {exportError && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: '#dc2626', fontFamily: F, marginBottom: 16,
          }}>
            {exportError}
          </div>
        )}
        <button
          onClick={handleExportData}
          disabled={exporting}
          style={{
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            fontFamily: F, cursor: exporting ? 'not-allowed' : 'pointer',
            backgroundColor: C.accent, color: '#fff', border: 'none',
            opacity: exporting ? 0.7 : 1,
          }}
        >
          {exporting ? 'Wird exportiert…' : 'Daten herunterladen'}
        </button>
      </div>

      {/* Account Deletion — Art. 17 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, border: '1px solid #fecaca',
        padding: '28px 32px',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#dc2626', fontFamily: F, margin: '0 0 8px' }}>
          Konto löschen
        </h2>
        <p style={{ fontSize: 14, color: C.muted, fontFamily: F, lineHeight: 1.6, margin: '0 0 20px' }}>
          Ihr Konto und alle personenbezogenen Daten werden unwiderruflich gelöscht (DSGVO Art. 17).
          Aktive Vermittlungsanfragen werden automatisch pausiert.
        </p>

        {deleteError && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '10px 14px', fontSize: 13, color: '#dc2626', fontFamily: F, marginBottom: 16,
          }}>
            {deleteError}
          </div>
        )}

        {deleteStep === 'idle' && (
          <button
            onClick={() => setDeleteStep('confirm')}
            style={{
              padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              fontFamily: F, cursor: 'pointer', backgroundColor: 'transparent',
              color: '#dc2626', border: '1px solid #fecaca',
            }}
          >
            Konto löschen
          </button>
        )}

        {(deleteStep === 'confirm' || deleteStep === 'deleting') && (
          <div>
            <p style={{ fontSize: 14, color: C.text, fontFamily: F, marginBottom: 16 }}>
              Geben Sie zur Bestätigung <strong>LÖSCHEN</strong> ein:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="LÖSCHEN"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14,
                fontFamily: F, border: `1px solid ${C.border}`, marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'LÖSCHEN' || deleteStep === 'deleting'}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
                  fontFamily: F,
                  cursor: confirmText !== 'LÖSCHEN' || deleteStep === 'deleting' ? 'not-allowed' : 'pointer',
                  backgroundColor: confirmText === 'LÖSCHEN' ? '#dc2626' : '#f1f5f9',
                  color: confirmText === 'LÖSCHEN' ? '#fff' : '#94a3b8',
                  border: 'none',
                  opacity: deleteStep === 'deleting' ? 0.7 : 1,
                }}
              >
                {deleteStep === 'deleting' ? 'Wird gelöscht…' : 'Endgültig löschen'}
              </button>
              <button
                onClick={() => { setDeleteStep('idle'); setConfirmText(''); setDeleteError(null) }}
                disabled={deleteStep === 'deleting'}
                style={{
                  padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                  fontFamily: F, cursor: 'pointer', backgroundColor: 'transparent',
                  color: C.muted, border: `1px solid ${C.border}`,
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
