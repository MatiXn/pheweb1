// AdminVerifizierungsQueuePage — Story 7.1: Kandidaten-Verifizierungs-Queue
//                              — Story 7.2: Freischalten / Ablehnen
// Admin-only. Zeigt priorisierte Queue ausstehender Kandidaten-Verifizierungen.
// Sortierung: Wartezeit → Vollständigkeit → Subscription-Tier

import { useState, CSSProperties } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useVerificationQueue } from '../features/admin/hooks/useVerificationQueue'
import { useAdminCandidateAction } from '../features/admin/hooks/useAdminCandidateAction'
import type { AdminVerificationEntry, CandidateDocument, DocumentType, SubscriptionTier } from '../features/admin/types'
import { supabase } from '../lib/supabaseClient'
import { AppShell } from '../components/AppShell'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', red: '#dc2626', redBg: '#fef2f2',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// Storage-Bucket aus useDocumentUpload.ts (identischer Name)
const DOCUMENTS_BUCKET = 'documents'

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function daysSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'heute'
  if (days === 1) return '1 Tag'
  return `${days} Tage`
}

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  lebenslauf: 'Lebenslauf',
  zeugnis:    'Zeugnis',
  zertifikat: 'Zertifikat',
  sonstiges:  'Sonstiges',
}

const TIER_CONFIG: Record<SubscriptionTier, { label: string; bg: string; color: string; border: string }> = {
  enterprise:   { label: 'Enterprise',   bg: C.accentBg,  color: C.accent, border: C.accentBd },
  professional: { label: 'Professional', bg: C.greenBg,   color: C.green,  border: '#86efac' },
  basis:        { label: 'Basis',        bg: '#f1f5f9',   color: C.faint,  border: C.border },
}

const AVAIL_LABELS: Record<string, string> = {
  immediate:  'Sofort',
  '1_month':  '1 Monat',
  '3_months': '3 Monate',
  '6_months': '6 Monate',
  flexible:   'Flexibel',
}

const EDU_LABELS: Record<string, string> = {
  none:      'Keine Angabe',
  ausbildung: 'Ausbildung',
  studium:   'Studium',
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Dokument-Laden + Signed-URLs ───────────────────────────────────────────

interface DocumentWithUrl extends CandidateDocument {
  signedUrl: string | null
  urlError: boolean
}

async function loadDocumentsForCandidate(candidateId: string): Promise<DocumentWithUrl[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  // Signed URLs parallel generieren
  const withUrls = await Promise.all(
    (data as Array<{
      id: string
      candidate_id: string
      storage_path: string
      document_type: string
      original_filename: string | null
      file_size_bytes: number | null
      verified: boolean
      verified_at: string | null
      created_at: string
    }>).map(async (row) => {
      const { data: urlData } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrl(row.storage_path, 3600)

      const doc: DocumentWithUrl = {
        id:              row.id,
        candidateId:     row.candidate_id,
        storagePath:     row.storage_path,
        documentType:    row.document_type as DocumentType,
        originalFilename: row.original_filename,
        fileSizeBytes:   row.file_size_bytes,
        verified:        row.verified,
        verifiedAt:      row.verified_at,
        createdAt:       row.created_at,
        signedUrl:       urlData?.signedUrl ?? null,
        urlError:        !urlData?.signedUrl,
      }
      return doc
    })
  )

  return withUrls
}

// ── Hauptkomponente ────────────────────────────────────────────────────────

export default function AdminVerifizierungsQueuePage() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const { entries, isLoading, error, realtimeStatus, refetch } = useVerificationQueue()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docs, setDocs] = useState<DocumentWithUrl[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const { isProcessing, error: actionError, approve, reject, block } = useAdminCandidateAction()

  // Zugriffsprüfung
  if (userLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  const selectedEntry = entries.find(e => e.candidateId === selectedId) ?? null

  return (
    <AppShell maxWidth={1200}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Verifizierungs-Queue
          </h1>
          <p style={{ fontFamily: F, fontSize: 14, color: '#94a3b8', margin: 0 }}>
            Ausstehende Kandidaten-Verifizierungen — sortiert nach Wartezeit, Vollständigkeit und Subscription-Tier.
          </p>
        </div>
        {/* Realtime-Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingTop: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: realtimeStatus === 'connected' ? C.green : realtimeStatus === 'error' ? C.red : C.faint,
            display: 'inline-block',
          }} />
          <span style={{ fontFamily: F, fontSize: 12, color: C.faint }}>
            {realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'error' ? 'Offline' : 'Verbinde…'}
          </span>
        </div>
      </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorBox message={error} onRetry={refetch} />
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedEntry ? '1fr 420px' : '1fr', gap: 24, alignItems: 'start' }}>

            {/* Queue-Liste */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map(entry => (
                <QueueCard
                  key={entry.candidateId}
                  entry={entry}
                  isSelected={entry.candidateId === selectedId}
                  onClick={async () => {
                    if (selectedId === entry.candidateId) {
                      setSelectedId(null)
                      setDocs([])
                    } else {
                      setSelectedId(entry.candidateId)
                      setDocsLoading(true)
                      const loaded = await loadDocumentsForCandidate(entry.candidateId)
                      setDocs(loaded)
                      setDocsLoading(false)
                    }
                  }}
                />
              ))}
            </div>

            {/* Detail-Panel */}
            {selectedEntry && (
              <DetailPanel
                key={selectedEntry.candidateId}
                entry={selectedEntry}
                docs={docs}
                docsLoading={docsLoading}
                onClose={() => { setSelectedId(null); setDocs([]) }}
                approve={approve}
                reject={reject}
                block={block}
                isProcessing={isProcessing}
                actionError={actionError}
                onActionSuccess={() => { setSelectedId(null); setDocs([]) }}
              />
            )}
          </div>
        )}
    </AppShell>
  )
}

// ── Queue-Karte ────────────────────────────────────────────────────────────

function QueueCard({
  entry,
  isSelected,
  onClick,
}: {
  entry: AdminVerificationEntry
  isSelected: boolean
  onClick: () => void
}) {
  const tier = TIER_CONFIG[entry.subscriptionTier]
  const waitDays = daysSince(entry.createdAt)

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${isSelected ? C.accent : C.border}`,
        boxShadow: isSelected ? C.shadowMd : C.shadow,
        padding: '18px 22px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '4px 16px',
        alignItems: 'center',
      }}
    >
      {/* Links: Name + Titel */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: C.text }}>
            {entry.anonymousId}
          </span>
          <TierBadge tier={entry.subscriptionTier} />
        </div>
        <span style={{ fontFamily: F, fontSize: 13, color: C.muted }}>
          {entry.professionalTitle}
          {entry.locationCity && ` · ${entry.locationCity}`}
          {` · ${entry.experienceYears} J. Erfahrung`}
        </span>
      </div>

      {/* Rechts: Wartezeit + Dokumente */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
          {waitDays}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: C.faint }}>
          {entry.documentCount} {entry.documentCount === 1 ? 'Dokument' : 'Dokumente'}
        </div>
      </div>

      {/* Vollständigkeits-Bar */}
      <div style={{ gridColumn: '1 / -1', marginTop: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: F, fontSize: 11, color: C.faint }}>Vollständigkeit</span>
          <span style={{ fontFamily: F, fontSize: 11, color: C.faint }}>{entry.completenessScore}/8</span>
        </div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, (entry.completenessScore / 8) * 100)}%`,
            background: entry.completenessScore >= 6 ? C.green : entry.completenessScore >= 3 ? C.accent : C.faint,
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>
    </div>
  )
}

// ── Detail-Panel ───────────────────────────────────────────────────────────

const BLOCK_RED = '#991b1b'
const BLOCK_RED_BG = '#fee2e2'
const BLOCK_RED_BD = '#fca5a5'

function DetailPanel({
  entry,
  docs,
  docsLoading,
  onClose,
  approve,
  reject,
  block,
  isProcessing,
  actionError,
  onActionSuccess,
}: {
  entry: AdminVerificationEntry
  docs: DocumentWithUrl[]
  docsLoading: boolean
  onClose: () => void
  approve: (candidateId: string) => Promise<void>
  reject: (candidateId: string, feedback: string) => Promise<void>
  block: (candidateId: string, reason: string) => Promise<void>
  isProcessing: boolean
  actionError: string | null
  onActionSuccess: () => void
}) {
  const [rejectionMode, setRejectionMode] = useState(false)
  const [blockMode, setBlockMode] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [blockReasonText, setBlockReasonText] = useState('')

  const feedbackValid = feedbackText.trim().length >= 10
  const blockReasonValid = blockReasonText.trim().length >= 10

  return (
    <div style={{
      background: '#fff',
      borderRadius: 20,
      border: `1.5px solid ${C.border}`,
      boxShadow: C.shadowMd,
      padding: '24px 24px',
      position: 'sticky',
      top: 24,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: F, fontSize: 18, fontWeight: 800, color: C.text }}>
            {entry.anonymousId}
          </div>
          <div style={{ fontFamily: F, fontSize: 13, color: C.muted, marginTop: 2 }}>
            {entry.professionalTitle}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: `1px solid ${C.borderMd}`,
            borderRadius: 8, padding: '4px 10px', fontSize: 13,
            color: C.muted, cursor: 'pointer', fontFamily: F,
          }}
        >
          ✕
        </button>
      </div>

      {/* Profil-Felder */}
      <Section title="Profil">
        <Field label="Standort" value={entry.locationCity} />
        <Field label="Erfahrung" value={`${entry.experienceYears} Jahre`} />
        <Field label="Ausbildung" value={`${EDU_LABELS[entry.educationType] ?? entry.educationType}${entry.educationField ? ` · ${entry.educationField}` : ''}`} />
        <Field label="Verfügbarkeit" value={AVAIL_LABELS[entry.availability] ?? entry.availability} />
        {entry.salaryExpectation != null && (
          <Field label="Gehaltsvorstellung" value={`${entry.salaryExpectation.toLocaleString('de-DE')} ${entry.salaryCurrency}`} />
        )}
        <Field label="Einwilligung erteilt" value={entry.consentGivenAt ? new Date(entry.consentGivenAt).toLocaleDateString('de-DE') : '—'} />
        <Field label="Wartezeit" value={daysSince(entry.createdAt)} />
      </Section>

      {/* Recruiter */}
      <Section title="Recruiter">
        <Field label="Name" value={`${entry.recruiterFirstName} ${entry.recruiterLastName}`} />
        <Field label="Tier" value={<TierBadge tier={entry.subscriptionTier} />} />
      </Section>

      {/* Recruiter-Einschätzung */}
      {(entry.recruiterRecommendation || entry.recruiterNeutralAssessment) && (
        <Section title="Recruiter-Einschätzung">
          {entry.recruiterRecommendation && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Empfehlung
              </div>
              <div style={{ fontFamily: F, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                {entry.recruiterRecommendation}
              </div>
            </div>
          )}
          {entry.recruiterNeutralAssessment && (
            <div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Neutrale Bewertung
              </div>
              <div style={{ fontFamily: F, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                {entry.recruiterNeutralAssessment}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* Dokumente */}
      <Section title={`Dokumente (${entry.documentCount})`}>
        {docsLoading ? (
          <div style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Wird geladen…</div>
        ) : docs.length === 0 ? (
          <div style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Keine Dokumente hochgeladen.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(doc => (
              <DocumentRow key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </Section>

      {/* Entscheidung */}
      <Section title="Entscheidung">
        {actionError && (
          <div style={{
            background: C.redBg, border: `1px solid #fecaca`,
            borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            fontFamily: F, fontSize: 13, color: C.red,
          }}>
            {actionError}
          </div>
        )}

        {!rejectionMode && !blockMode ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={async () => {
                await approve(entry.candidateId)
                onActionSuccess()
              }}
              disabled={isProcessing}
              style={{
                flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                padding: '10px 0', borderRadius: 10, cursor: isProcessing ? 'default' : 'pointer',
                background: isProcessing ? '#d1fae5' : C.greenBg,
                color: C.green, border: `1.5px solid #86efac`,
                opacity: isProcessing ? 0.7 : 1,
              } as CSSProperties}
            >
              {isProcessing ? 'Wird verarbeitet…' : '✓ Freischalten'}
            </button>
            <button
              onClick={() => setRejectionMode(true)}
              disabled={isProcessing}
              style={{
                flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                padding: '10px 0', borderRadius: 10, cursor: isProcessing ? 'default' : 'pointer',
                background: C.redBg, color: C.red, border: `1.5px solid #fecaca`,
                opacity: isProcessing ? 0.7 : 1,
              } as CSSProperties}
            >
              Ablehnen
            </button>
            <button
              onClick={() => setBlockMode(true)}
              disabled={isProcessing}
              style={{
                flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                padding: '10px 0', borderRadius: 10, cursor: isProcessing ? 'default' : 'pointer',
                background: BLOCK_RED_BG, color: BLOCK_RED, border: `1.5px solid ${BLOCK_RED_BD}`,
                opacity: isProcessing ? 0.7 : 1,
              } as CSSProperties}
            >
              Sperren
            </button>
          </div>
        ) : rejectionMode ? (
          <div>
            <div style={{
              fontFamily: F, fontSize: 12, color: C.faint, marginBottom: 6,
            }}>
              Feedback für den Recruiter (mind. 10 Zeichen):
            </div>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Z.B.: Lebenslauf fehlt. Bitte laden Sie den aktuellen Lebenslauf des Kandidaten hoch."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: F, fontSize: 13, color: C.text,
                border: `1.5px solid ${feedbackText.length > 0 && !feedbackValid ? C.red : C.borderMd}`,
                borderRadius: 10, padding: '10px 12px',
                resize: 'vertical', outline: 'none',
              } as CSSProperties}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={async () => {
                  if (!feedbackValid) return
                  await reject(entry.candidateId, feedbackText)
                  onActionSuccess()
                }}
                disabled={isProcessing || !feedbackValid}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                  padding: '10px 0', borderRadius: 10,
                  cursor: (isProcessing || !feedbackValid) ? 'default' : 'pointer',
                  background: C.redBg, color: C.red, border: `1.5px solid #fecaca`,
                  opacity: (isProcessing || !feedbackValid) ? 0.5 : 1,
                } as CSSProperties}
              >
                {isProcessing ? 'Wird verarbeitet…' : 'Ablehnen bestätigen'}
              </button>
              <button
                onClick={() => { setRejectionMode(false); setFeedbackText('') }}
                disabled={isProcessing}
                style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600,
                  padding: '10px 16px', borderRadius: 10,
                  cursor: isProcessing ? 'default' : 'pointer',
                  background: 'none', color: C.muted,
                  border: `1px solid ${C.borderMd}`,
                } as CSSProperties}
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              fontFamily: F, fontSize: 12, color: BLOCK_RED, fontWeight: 600, marginBottom: 6,
            }}>
              Sperrgrund (mind. 10 Zeichen) — diese Aktion ist dauerhaft:
            </div>
            <textarea
              value={blockReasonText}
              onChange={e => setBlockReasonText(e.target.value)}
              placeholder="Z.B.: Gefälschte Dokumente festgestellt. Kandidat dauerhaft von der Plattform ausgeschlossen."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                fontFamily: F, fontSize: 13, color: C.text,
                border: `1.5px solid ${blockReasonText.length > 0 && !blockReasonValid ? BLOCK_RED : C.borderMd}`,
                borderRadius: 10, padding: '10px 12px',
                resize: 'vertical', outline: 'none',
              } as CSSProperties}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button
                onClick={async () => {
                  if (!blockReasonValid) return
                  await block(entry.candidateId, blockReasonText)
                  onActionSuccess()
                }}
                disabled={isProcessing || !blockReasonValid}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                  padding: '10px 0', borderRadius: 10,
                  cursor: (isProcessing || !blockReasonValid) ? 'default' : 'pointer',
                  background: BLOCK_RED_BG, color: BLOCK_RED, border: `1.5px solid ${BLOCK_RED_BD}`,
                  opacity: (isProcessing || !blockReasonValid) ? 0.5 : 1,
                } as CSSProperties}
              >
                {isProcessing ? 'Wird verarbeitet…' : 'Sperren bestätigen'}
              </button>
              <button
                onClick={() => { setBlockMode(false); setBlockReasonText('') }}
                disabled={isProcessing}
                style={{
                  fontFamily: F, fontSize: 13, fontWeight: 600,
                  padding: '10px 16px', borderRadius: 10,
                  cursor: isProcessing ? 'default' : 'pointer',
                  background: 'none', color: C.muted,
                  border: `1px solid ${C.borderMd}`,
                } as CSSProperties}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}

// ── Dokument-Zeile ─────────────────────────────────────────────────────────

function DocumentRow({ doc }: { doc: DocumentWithUrl }) {
  const label = DOC_TYPE_LABELS[doc.documentType] ?? doc.documentType
  const size = formatFileSize(doc.fileSizeBytes)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: 10,
      background: '#f8fafc', border: `1px solid ${C.border}`,
    }}>
      <div>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.text }}>{label}</div>
        {doc.originalFilename && (
          <div style={{ fontFamily: F, fontSize: 11, color: C.faint, marginTop: 1 }}>
            {doc.originalFilename}{size ? ` · ${size}` : ''}
          </div>
        )}
      </div>
      {doc.signedUrl ? (
        <a
          href={doc.signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: F, fontSize: 12, fontWeight: 600,
            color: C.accent, textDecoration: 'none',
            border: `1px solid ${C.accentBd}`, borderRadius: 8,
            padding: '4px 10px', background: C.accentBg,
          }}
        >
          Öffnen ↗
        </a>
      ) : (
        <span style={{ fontFamily: F, fontSize: 12, color: C.red }}>
          {doc.urlError ? 'URL-Fehler' : '—'}
        </span>
      )}
    </div>
  )
}

// ── Hilfskomponenten ───────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: SubscriptionTier }) {
  const cfg = TIER_CONFIG[tier]
  return (
    <span style={{
      fontFamily: F, fontSize: 11, fontWeight: 700,
      padding: '2px 8px', borderRadius: 6,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
    }}>
      {cfg.label}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: F, fontSize: 11, fontWeight: 700, color: C.faint,
        textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontFamily: F, fontSize: 12, color: C.faint }}>{label}</span>
      <span style={{ fontFamily: F, fontSize: 12, color: C.text, fontWeight: 500 }}>{value ?? '—'}</span>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${C.accentBg}`,
        borderTop: `3px solid ${C.accent}`, borderRadius: '50%',
        margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Queue wird geladen…</p>
    </div>
  )
}

function ErrorBox({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{
      background: C.redBg, border: '1.5px solid #fecaca',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontFamily: F, fontSize: 14, color: C.red }}>{message}</span>
      <button
        onClick={onRetry}
        style={{
          fontFamily: F, fontSize: 13, fontWeight: 600,
          padding: '6px 14px', borderRadius: 8,
          background: C.redBg, color: C.red,
          border: `1px solid #fecaca`, cursor: 'pointer',
        }}
      >
        Erneut versuchen
      </button>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      background: '#fff', borderRadius: 20,
      border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
      padding: '64px 32px', textAlign: 'center',
    }}>
      <div style={{ fontFamily: F, fontSize: 40, marginBottom: 16 }}>✓</div>
      <div style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        Keine ausstehenden Verifizierungen
      </div>
      <div style={{ fontFamily: F, fontSize: 14, color: C.muted }}>
        Alle Kandidaten-Profile sind verifiziert oder es sind noch keine eingegangen.
      </div>
    </div>
  )
}
