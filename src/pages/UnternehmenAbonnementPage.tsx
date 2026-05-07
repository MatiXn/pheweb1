// UnternehmenAbonnementPage — 2030 Redesign
// Route: /unternehmen/abonnement

import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuthContext } from '../features/auth'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { useSubscription } from '../features/companies/hooks/useSubscription'
import { AppShell } from '../components/AppShell'
import type { SubscriptionTier } from '../features/companies/types'

const F = "'Inter', 'Helvetica Neue', Arial, sans-serif"
const C = {
  accent:   '#3b72b8',
  accentBg: '#eff6ff',
  accentDk: '#2558a0',
  text:     '#0f172a',
  muted:    '#64748b',
  faint:    '#94a3b8',
  border:   '#e2e8f0',
  white:    '#ffffff',
  bg:       '#f8fafc',
  green:    '#10b981',
  greenBg:  '#ecfdf5',
  greenBd:  '#a7f3d0',
  amber:    '#f59e0b',
  red:      '#dc2626',
  redBg:    '#fef2f2',
  redBd:    '#fecaca',
}

interface TierConfig {
  tier:     SubscriptionTier
  label:    string
  price:    number
  maxJobs:  string
  features: string[]
  popular?: boolean
}

const TIERS: TierConfig[] = [
  {
    tier: 'basis', label: 'Basis', price: 700, maxJobs: '1 aktive Stelle',
    features: ['1 aktive Stelle', 'KI-Matching-Algorithmus', 'Anonymisierter Kandidatenpool', 'E-Mail-Benachrichtigungen'],
  },
  {
    tier: 'professional', label: 'Professional', price: 1400, maxJobs: '3 aktive Stellen', popular: true,
    features: ['3 aktive Stellen', 'KI-Matching-Algorithmus', 'Anonymisierter Kandidatenpool', 'E-Mail-Benachrichtigungen', 'Priorisiertes Matching'],
  },
  {
    tier: 'enterprise', label: 'Enterprise', price: 2100, maxJobs: 'Unlimitierte Stellen',
    features: ['Unlimitierte Stellen', 'KI-Matching-Algorithmus', 'Anonymisierter Kandidatenpool', 'E-Mail-Benachrichtigungen', 'Priorisiertes Matching', 'Dedizierter Account-Manager'],
  },
]

const STATUS_LABEL: Record<string, string> = {
  aktiv: 'Aktiv', ablaufend: 'Läuft bald ab', abgelaufen: 'Abgelaufen', eingefroren: 'Eingefroren',
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtEur(n: number) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(n)
}

export default function UnternehmenAbonnementPage() {
  const { user }    = useAuthContext()
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const { subscription, isLoading: subLoading, error: subError, refetch, createCheckoutSession } = useSubscription()
  const [searchParams]  = useSearchParams()
  const [checkoutTier, setCheckoutTier]   = useState<SubscriptionTier | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const statusParam = searchParams.get('status')

  useEffect(() => {
    if (statusParam === 'success') void refetch()
  }, [statusParam, refetch])

  if (profileLoading) return null
  if (!user || !profile) return <Navigate to="/login" replace />
  if (profile.role !== 'unternehmen') return <Navigate to="/dashboard" replace />

  async function handleCheckout(tier: SubscriptionTier) {
    setCheckoutTier(tier)
    setCheckoutError(null)
    try {
      await createCheckoutSession(tier)
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setCheckoutTier(null)
    }
  }

  return (
    <AppShell>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F }}>
          Abonnement
        </h1>
        <p style={{ fontSize: 14, color: C.faint, fontFamily: F }}>
          Wählen Sie Ihren Plan und zahlen Sie sicher über Stripe.
        </p>
      </div>

      {/* Status banners */}
      {statusParam === 'success' && (
        <div style={{ backgroundColor: C.greenBg, border: `1px solid ${C.greenBd}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>✓</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.green, fontFamily: F }}>Zahlung erfolgreich — Ihr Zugang ist jetzt aktiv</div>
            <div style={{ fontSize: 13, color: C.green, fontFamily: F, marginTop: 2, opacity: 0.8 }}>Die Subscription wurde aktiviert. Es kann einige Sekunden dauern bis die Anzeige aktualisiert wird.</div>
          </div>
        </div>
      )}
      {statusParam === 'canceled' && (
        <div style={{ backgroundColor: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#ca8a04', fontFamily: F }}>Zahlung abgebrochen — kein Betrag wurde belastet.</div>
        </div>
      )}

      {/* Active subscription card */}
      {!subLoading && subscription && (
        <div style={{
          backgroundColor: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: '20px 24px', marginBottom: 36,
          boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.faint, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
            Aktuelle Subscription
          </div>
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <SubscriptionField label="Plan" value={TIERS.find(t => t.tier === subscription.tier)?.label ?? subscription.tier} accent />
            <SubscriptionField
              label="Status"
              value={STATUS_LABEL[subscription.status] ?? subscription.status}
              valueColor={subscription.status === 'aktiv' ? C.green : C.amber}
            />
            <SubscriptionField label="Läuft ab am" value={fmtDate(subscription.currentPeriodEnd)} />
          </div>
        </div>
      )}

      {/* Errors */}
      {subError && (
        <div style={{ color: C.red, fontSize: 13, fontFamily: F, marginBottom: 20 }}>
          Fehler beim Laden der Subscription: {subError}
        </div>
      )}
      {checkoutError && (
        <div style={{ backgroundColor: C.redBg, border: `1px solid ${C.redBd}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: C.red, fontFamily: F }}>
          Fehler: {checkoutError}
        </div>
      )}

      {/* Tier section header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.01em', fontFamily: F }}>Plan auswählen</h2>
      </div>

      {/* Tier cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 40 }}>
        {TIERS.map(t => {
          const isCurrent    = subscription?.tier === t.tier && subscription?.status === 'aktiv'
          const isProcessing = checkoutTier === t.tier

          return (
            <div key={t.tier} style={{
              backgroundColor: C.white,
              borderRadius:    16,
              border:          isCurrent ? `2px solid ${C.accent}` : t.popular ? `2px solid #bfdbfe` : `1px solid ${C.border}`,
              padding:         '28px 24px',
              display:         'flex',
              flexDirection:   'column',
              gap:             20,
              boxShadow:       isCurrent ? '0 4px 24px rgba(59,114,184,0.12)' : '0 1px 3px rgba(15,23,42,0.05)',
              position:        'relative',
            }}>
              {/* Popular / Current badge */}
              {(t.popular || isCurrent) && (
                <div style={{
                  position:        'absolute',
                  top:             -12,
                  left:            '50%',
                  transform:       'translateX(-50%)',
                  backgroundColor: isCurrent ? C.accent : C.accentBg,
                  color:           isCurrent ? '#fff' : C.accentDk,
                  fontSize:        11,
                  fontWeight:      700,
                  padding:         '3px 14px',
                  borderRadius:    99,
                  fontFamily:      F,
                  whiteSpace:      'nowrap',
                  border:          isCurrent ? 'none' : '1px solid #bfdbfe',
                }}>
                  {isCurrent ? 'Aktueller Plan' : 'Empfohlen'}
                </div>
              )}

              {/* Tier info */}
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: F, marginBottom: 8 }}>{t.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.accent, fontFamily: F, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {fmtEur(t.price)}
                  <span style={{ fontSize: 13, fontWeight: 400, color: C.faint }}> / Quartal</span>
                </div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: F, marginTop: 6 }}>{t.maxJobs}</div>
              </div>

              {/* Features */}
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {t.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: C.muted, fontFamily: F }}>
                    <span style={{ color: C.green, flexShrink: 0, fontSize: 12, fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                onClick={() => { void handleCheckout(t.tier) }}
                disabled={isCurrent || checkoutTier !== null}
                style={{
                  marginTop:       'auto',
                  padding:         '11px 0',
                  backgroundColor: isCurrent ? C.accentBg : C.accent,
                  color:           isCurrent ? C.accent : '#fff',
                  border:          isCurrent ? `1px solid #bfdbfe` : 'none',
                  borderRadius:    10,
                  fontSize:        14,
                  fontWeight:      600,
                  fontFamily:      F,
                  cursor:          isCurrent || checkoutTier !== null ? 'not-allowed' : 'pointer',
                  opacity:         checkoutTier !== null && checkoutTier !== t.tier ? 0.5 : 1,
                  transition:      'all 0.15s',
                }}
              >
                {isCurrent ? 'Aktueller Plan' : isProcessing ? 'Weiterleitung zu Stripe…' : 'Jetzt buchen'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div style={{ fontSize: 12, color: C.faint, fontFamily: F, lineHeight: 1.7 }}>
        <p style={{ margin: '0 0 4px' }}>Zahlung wird sicher über Stripe abgewickelt. Keine Kreditkartendaten werden auf unseren Servern gespeichert.</p>
        <p style={{ margin: 0 }}>
          Bei Fragen:{' '}
          <a href="mailto:support@pheweb.de" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>support@pheweb.de</a>
        </p>
      </div>
    </AppShell>
  )
}

function SubscriptionField({ label, value, accent, valueColor }: { label: string; value: string; accent?: boolean; valueColor?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: "'Inter', sans-serif", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: valueColor ?? (accent ? '#3b72b8' : '#0f172a'), fontFamily: "'Inter', sans-serif" }}>{value}</div>
    </div>
  )
}
