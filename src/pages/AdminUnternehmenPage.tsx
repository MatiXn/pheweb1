// AdminUnternehmenPage — Story 7.4: Unternehmens-Aktivierung & Konto-Management
// Admin-only. Zeigt ausstehende Unternehmensregistrierungen zur Aktivierung oder Sperrung.

import { useState, CSSProperties } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useAdminCompanyQueue } from '../features/admin/hooks/useAdminCompanyQueue'
import { useAdminCompanyAction } from '../features/admin/hooks/useAdminCompanyAction'
import type { AdminCompanyQueueEntry } from '../features/admin/types'
import { AppShell } from '../components/AppShell'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', red: '#dc2626', redBg: '#fef2f2',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}

const BLOCK_RED = '#991b1b'
const BLOCK_RED_BG = '#fee2e2'
const BLOCK_RED_BD = '#fca5a5'

const FREEZE_BLUE = '#1e40af'
const FREEZE_BLUE_BG = '#eff6ff'
const FREEZE_BLUE_BD = '#bfdbfe'

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

// ── Hilfsfunktionen ────────────────────────────────────────────────────────

function daysSince(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'heute'
  if (days === 1) return '1 Tag'
  return `${days} Tage`
}

// ── Hauptkomponente ────────────────────────────────────────────────────────

export default function AdminUnternehmenPage() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const { entries, isLoading, error, refetch } = useAdminCompanyQueue()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { isProcessing, error: actionError, activate, freeze, block } = useAdminCompanyAction()

  // Zugriffsprüfung
  if (userLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  const selectedEntry = entries.find(e => e.companyId === selectedId) ?? null

  return (
    <AppShell maxWidth={1200}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Unternehmens-Verwaltung
        </h1>
        <p style={{ fontFamily: F, fontSize: 14, color: '#94a3b8' }}>
          Unternehmensregistrierungen &amp; aktive Konten — Aktivieren, Einfrieren oder Sperren.
        </p>
      </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorBox message={error} onRetry={refetch} />
        ) : entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedEntry ? '1fr 400px' : '1fr', gap: 24, alignItems: 'start' }}>

            {/* Queue-Liste */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entries.map(entry => (
                <CompanyQueueCard
                  key={entry.companyId}
                  entry={entry}
                  isSelected={entry.companyId === selectedId}
                  onClick={() => {
                    setSelectedId(prev => prev === entry.companyId ? null : entry.companyId)
                  }}
                />
              ))}
            </div>

            {/* Detail-Panel */}
            {selectedEntry && (
              <CompanyDetailPanel
                key={selectedEntry.companyId}
                entry={selectedEntry}
                onClose={() => setSelectedId(null)}
                activate={activate}
                freeze={freeze}
                block={block}
                isProcessing={isProcessing}
                actionError={actionError}
                onActionSuccess={() => { setSelectedId(null); refetch() }}
              />
            )}
          </div>
        )}
    </AppShell>
  )
}

// ── Company-Queue-Karte ────────────────────────────────────────────────────

function CompanyQueueCard({
  entry,
  isSelected,
  onClick,
}: {
  entry: AdminCompanyQueueEntry
  isSelected: boolean
  onClick: () => void
}) {
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
      {/* Links: Firmenname + Details */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: C.text }}>
            {entry.companyName}
          </span>
          <StatusBadge status={entry.accountStatus} />
        </div>
        <span style={{ fontFamily: F, fontSize: 13, color: C.muted }}>
          {[entry.industry, entry.size].filter(Boolean).join(' · ')}
        </span>
      </div>

      {/* Rechts: Registrierungsdatum */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>
          {daysSince(entry.createdAt)}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: C.faint }}>
          Registriert
        </div>
      </div>
    </div>
  )
}

// ── Company-Detail-Panel ───────────────────────────────────────────────────

function CompanyDetailPanel({
  entry,
  onClose,
  activate,
  freeze,
  block,
  isProcessing,
  actionError,
  onActionSuccess,
}: {
  entry: AdminCompanyQueueEntry
  onClose: () => void
  activate: (companyId: string) => Promise<void>
  freeze: (companyId: string) => Promise<void>
  block: (companyId: string, reason: string) => Promise<void>
  isProcessing: boolean
  actionError: string | null
  onActionSuccess: () => void
}) {
  const [blockMode, setBlockMode] = useState(false)
  const [blockReasonText, setBlockReasonText] = useState('')
  const [freezeConfirm, setFreezeConfirm] = useState(false)

  const blockReasonValid = blockReasonText.trim().length >= 10

  const canActivate = entry.accountStatus === 'ausstehend' || entry.accountStatus === 'eingefroren'
  const canFreeze = entry.accountStatus === 'aktiv'
  const canBlock = entry.accountStatus !== 'gesperrt'

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
            {entry.companyName}
          </div>
          <div style={{ fontFamily: F, fontSize: 13, color: C.muted, marginTop: 2 }}>
            {entry.industry ?? 'Branche nicht angegeben'}
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

      {/* Unternehmen */}
      <Section title="Unternehmen">
        <Field label="Name" value={entry.companyName} />
        <Field label="Branche" value={entry.industry} />
        <Field label="Größe" value={entry.size} />
        {entry.website && (
          <Field
            label="Website"
            value={
              <a
                href={entry.website.startsWith('http') ? entry.website : `https://${entry.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.accent, textDecoration: 'none' }}
              >
                {entry.website} ↗
              </a>
            }
          />
        )}
      </Section>

      {/* Kontakt */}
      <Section title="Kontakt">
        <Field label="Ansprechpartner" value={entry.contactPersonName} />
        <Field label="Telefon" value={entry.contactPersonPhone} />
        <Field label="E-Mail" value={entry.userEmail} />
        {entry.userFirstName && (
          <Field label="Benutzer" value={`${entry.userFirstName} ${entry.userLastName ?? ''}`.trim()} />
        )}
      </Section>

      {/* Registrierung */}
      <Section title="Registrierung">
        <Field label="Datum" value={new Date(entry.createdAt).toLocaleDateString('de-DE')} />
        <Field label="Wartezeit" value={daysSince(entry.createdAt)} />
        <Field label="Status" value={<StatusBadge status={entry.accountStatus} />} />
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

        {!blockMode && !freezeConfirm ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {canActivate && (
              <button
                onClick={async () => {
                  await activate(entry.companyId)
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
                {isProcessing ? 'Wird verarbeitet…' : '✓ Aktivieren'}
              </button>
            )}
            {canFreeze && (
              <button
                onClick={() => setFreezeConfirm(true)}
                disabled={isProcessing}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                  padding: '10px 0', borderRadius: 10, cursor: isProcessing ? 'default' : 'pointer',
                  background: FREEZE_BLUE_BG, color: FREEZE_BLUE, border: `1.5px solid ${FREEZE_BLUE_BD}`,
                  opacity: isProcessing ? 0.7 : 1,
                } as CSSProperties}
              >
                ❄ Einfrieren
              </button>
            )}
            {canBlock && (
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
                ⊘ Sperren
              </button>
            )}
          </div>
        ) : freezeConfirm ? (
          <div>
            <div style={{
              fontFamily: F, fontSize: 13, color: FREEZE_BLUE, fontWeight: 600, marginBottom: 12,
            }}>
              Unternehmen vorübergehend einfrieren? Alle aktiven Matches und Jobs werden pausiert.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={async () => {
                  await freeze(entry.companyId)
                  onActionSuccess()
                }}
                disabled={isProcessing}
                style={{
                  flex: 1, fontFamily: F, fontSize: 14, fontWeight: 700,
                  padding: '10px 0', borderRadius: 10,
                  cursor: isProcessing ? 'default' : 'pointer',
                  background: FREEZE_BLUE_BG, color: FREEZE_BLUE, border: `1.5px solid ${FREEZE_BLUE_BD}`,
                  opacity: isProcessing ? 0.5 : 1,
                } as CSSProperties}
              >
                {isProcessing ? 'Wird verarbeitet…' : 'Einfrieren bestätigen'}
              </button>
              <button
                onClick={() => setFreezeConfirm(false)}
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
              placeholder="Z.B.: Unternehmen existiert nicht. Registrierung abgelehnt."
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
                  await block(entry.companyId, blockReasonText)
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

// ── Status-Badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  ausstehend:  { label: 'Ausstehend',  bg: '#fffbeb', color: '#d97706', border: '#fcd34d' },
  aktiv:       { label: 'Aktiv',       bg: C.greenBg,  color: C.green,  border: '#86efac' },
  eingefroren: { label: 'Eingefroren', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  gesperrt:    { label: 'Gesperrt',    bg: BLOCK_RED_BG, color: BLOCK_RED, border: BLOCK_RED_BD },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, bg: '#f1f5f9', color: C.faint, border: C.border }
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

// ── Hilfskomponenten ───────────────────────────────────────────────────────

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
      <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Wird geladen…</p>
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
        Keine ausstehenden Registrierungen
      </div>
      <div style={{ fontFamily: F, fontSize: 14, color: C.muted }}>
        Alle Unternehmensregistrierungen wurden bearbeitet oder es sind noch keine eingegangen.
      </div>
    </div>
  )
}
