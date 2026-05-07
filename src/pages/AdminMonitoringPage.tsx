// AdminMonitoringPage — Story 7.5: Admin-Monitoring-Dashboard & Success-Fee-Tracking
// Admin-only. Zeigt 6 Plattform-KPI-Karten und offene Success-Fee-Einträge.

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useAdminDashboardMetrics } from '../features/admin/hooks/useAdminDashboardMetrics'
import { useAdminSuccessFees } from '../features/admin/hooks/useAdminSuccessFees'
import { AppShell } from '../components/AppShell'
import type { SuccessFeeEntry } from '../features/admin/types'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', greenBd: '#86efac',
  red: '#dc2626', redBg: '#fef2f2',
  amber: '#d97706', amberBg: '#fffbeb', amberBd: '#fcd34d',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// ── KPI-Karte ──────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: number | string
  sublabel?: string
  highlight?: boolean
}

function KpiCard({ label, value, sublabel, highlight }: KpiCardProps) {
  return (
    <div style={{
      background: highlight ? C.accentBg : '#fff',
      border: `1.5px solid ${highlight ? C.accentBd : C.border}`,
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: C.shadow,
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: F, fontSize: 32, fontWeight: 800, color: highlight ? C.accent : C.text, lineHeight: 1 }}>
        {value}
      </div>
      {sublabel && (
        <div style={{ fontFamily: F, fontSize: 12, color: C.faint, marginTop: 4 }}>
          {sublabel}
        </div>
      )}
    </div>
  )
}

// ── Fee-Status-Badge ────────────────────────────────────────────────────────

function FeeStatusBadge({ status }: { status: string }) {
  const isOpen = status === 'offen'
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      fontFamily: F,
      background: isOpen ? C.amberBg : C.greenBg,
      color: isOpen ? C.amber : C.green,
      border: `1px solid ${isOpen ? C.amberBd : C.greenBd}`,
    }}>
      {isOpen ? 'offen' : 'bezahlt'}
    </span>
  )
}

// ── Haupt-Komponente ────────────────────────────────────────────────────────

export default function AdminMonitoringPage() {
  const { profile, isLoading: userLoading } = useCurrentUser()
  const { metrics, isLoading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useAdminDashboardMetrics()
  const { fees, isLoading: feesLoading, error: feesError, markPaid } = useAdminSuccessFees()

  const [processingFeeId, setProcessingFeeId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  if (userLoading) return null
  if (!profile || profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  async function handleMarkPaid(feeId: string) {
    setProcessingFeeId(feeId)
    setActionError(null)
    const err = await markPaid(feeId)
    setProcessingFeeId(null)
    if (err) {
      setActionError(err)
    } else {
      setToast('Success-Fee als bezahlt markiert.')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const openFees = fees.filter((f: SuccessFeeEntry) => f.feeStatus === 'offen')
  const paidFees = fees.filter((f: SuccessFeeEntry) => f.feeStatus === 'bezahlt')
  const totalOpenAmount = openFees.reduce((sum: number, f: SuccessFeeEntry) => sum + f.feeAmount, 0)

  return (
    <AppShell>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: F, fontSize: 28, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Plattform-Monitoring
          </h1>
          <p style={{ fontFamily: F, fontSize: 14, color: '#94a3b8' }}>
            Echtzeit-Überblick über Plattform-Aktivitäten und offene Einnahmen.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            marginBottom: 20, padding: '12px 18px', borderRadius: 10,
            background: C.greenBg, border: `1px solid ${C.greenBd}`,
            color: C.green, fontFamily: F, fontSize: 14, fontWeight: 500,
          }}>
            {toast}
          </div>
        )}

        {/* KPI-Sektion */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: C.text }}>
              Plattform-Kennzahlen
            </h2>
            <button
              onClick={refetchMetrics}
              disabled={metricsLoading}
              style={{
                background: C.accentBg, border: `1px solid ${C.accentBd}`,
                borderRadius: 8, padding: '6px 14px', fontSize: 13,
                color: C.accent, cursor: metricsLoading ? 'not-allowed' : 'pointer',
                fontFamily: F, fontWeight: 500, opacity: metricsLoading ? 0.6 : 1,
              }}
            >
              {metricsLoading ? 'Lädt…' : '↻ Aktualisieren'}
            </button>
          </div>

          {metricsError && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 16,
              background: C.redBg, border: `1px solid #fca5a5`,
              color: C.red, fontFamily: F, fontSize: 14,
            }}>
              Fehler beim Laden: {metricsError}
            </div>
          )}

          {metricsLoading && !metrics && (
            <div style={{ fontFamily: F, fontSize: 14, color: C.faint, padding: '32px 0' }}>
              Lade Metriken…
            </div>
          )}

          {metrics && (
            <>
              {/* Zeile 1 */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                <KpiCard
                  label="Aktive Kandidaten"
                  value={metrics.activeCandidates}
                  sublabel="status = 'active'"
                />
                <KpiCard
                  label="Ausstehende Verifikationen"
                  value={metrics.pendingVerifications}
                  sublabel="warten auf Freigabe"
                  highlight={metrics.pendingVerifications > 0}
                />
                <KpiCard
                  label="Aktive Unternehmen"
                  value={metrics.activeCompanies}
                  sublabel="account_status = 'aktiv'"
                />
              </div>
              {/* Zeile 2 */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <KpiCard
                  label="Aktive Stellenanzeigen"
                  value={metrics.activeJobs}
                  sublabel="status = 'active'"
                />
                <KpiCard
                  label="Matches heute"
                  value={metrics.matchesToday}
                  sublabel="erstellt heute"
                />
                <KpiCard
                  label="Einstellungen diese Woche"
                  value={metrics.hiresThisWeek}
                  sublabel="interactions.status = 'hired'"
                  highlight={metrics.hiresThisWeek > 0}
                />
              </div>
            </>
          )}
        </div>

        {/* Success-Fee-Sektion */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <h2 style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: C.text }}>
              Success-Fee-Übersicht
            </h2>
            {openFees.length > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                fontFamily: F, background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBd}`,
              }}>
                {openFees.length} offen · {formatCurrency(totalOpenAmount)}
              </span>
            )}
            {paidFees.length > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                fontFamily: F, background: C.greenBg, color: C.green, border: `1px solid ${C.greenBd}`,
              }}>
                {paidFees.length} bezahlt
              </span>
            )}
          </div>

          {actionError && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 16,
              background: C.redBg, border: `1px solid #fca5a5`,
              color: C.red, fontFamily: F, fontSize: 14,
            }}>
              Fehler: {actionError}
            </div>
          )}

          {feesError && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 16,
              background: C.redBg, border: `1px solid #fca5a5`,
              color: C.red, fontFamily: F, fontSize: 14,
            }}>
              Fehler beim Laden der Success Fees: {feesError}
            </div>
          )}

          {feesLoading && (
            <div style={{ fontFamily: F, fontSize: 14, color: C.faint, padding: '32px 0' }}>
              Lade Success-Fee-Einträge…
            </div>
          )}

          {!feesLoading && fees.length === 0 && (
            <div style={{
              background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 14, padding: '48px 24px', textAlign: 'center',
              boxShadow: C.shadow,
            }}>
              <div style={{ fontFamily: F, fontSize: 15, color: C.faint }}>
                Noch keine Einstellungen erfasst
              </div>
              <div style={{ fontFamily: F, fontSize: 13, color: C.faint, marginTop: 6 }}>
                Success-Fee-Einträge erscheinen automatisch wenn interactions.status = 'hired' gesetzt wird.
              </div>
            </div>
          )}

          {!feesLoading && fees.length > 0 && (
            <div style={{
              background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow,
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1.5px solid ${C.border}`, background: '#fafbfc' }}>
                    {['Unternehmen', 'Kandidat', 'Beruf / Stadt', 'Jahresgehalt', 'Fee (25%)', 'Status', 'Datum', 'Aktion'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontFamily: F, fontSize: 11, fontWeight: 700,
                        color: C.faint, textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee: SuccessFeeEntry, idx: number) => (
                    <tr
                      key={fee.feeId}
                      style={{
                        borderBottom: idx < fees.length - 1 ? `1px solid ${C.border}` : 'none',
                        background: fee.feeStatus === 'bezahlt' ? '#fafbfc' : '#fff',
                      }}
                    >
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 14, fontWeight: 600, color: C.text }}>
                        {fee.companyName}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 13, color: C.muted, fontFeatureSettings: "'tnum'" }}>
                        {fee.candidateAnonId ?? '—'}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 13, color: C.muted }}>
                        <div>{fee.professionalTitle}</div>
                        {fee.locationCity && (
                          <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{fee.locationCity}</div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 14, color: C.text }}>
                        {fee.annualSalary === 0 ? '—' : formatCurrency(fee.annualSalary)}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 14, fontWeight: 600, color: C.accent }}>
                        {fee.feeAmount === 0 ? '—' : formatCurrency(fee.feeAmount)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <FeeStatusBadge status={fee.feeStatus} />
                        {fee.paidAt && (
                          <div style={{ fontFamily: F, fontSize: 11, color: C.faint, marginTop: 4 }}>
                            {formatDate(fee.paidAt)}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: F, fontSize: 13, color: C.faint }}>
                        {formatDate(fee.createdAt)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {fee.feeStatus === 'offen' ? (
                          <button
                            onClick={() => handleMarkPaid(fee.feeId)}
                            disabled={processingFeeId === fee.feeId}
                            style={{
                              background: processingFeeId === fee.feeId ? '#f1f5f9' : C.green,
                              color: processingFeeId === fee.feeId ? C.faint : '#fff',
                              border: 'none', borderRadius: 8,
                              padding: '7px 14px', fontSize: 13,
                              fontFamily: F, fontWeight: 600,
                              cursor: processingFeeId === fee.feeId ? 'not-allowed' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {processingFeeId === fee.feeId ? '…' : '✓ Bezahlt'}
                          </button>
                        ) : (
                          <span style={{ fontFamily: F, fontSize: 13, color: C.faint }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </AppShell>
  )
}
