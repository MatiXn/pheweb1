import { useEffect, useRef, useState } from 'react'
import { useJobListingsManagement } from '../hooks/useJobListingsManagement'
import { supabase } from '../../../lib/supabaseClient'
import { TIER_LIMITS } from '../../../utils/tierLimits'

// [Story 4.4] Verwaltungsliste aller Stellenausschreibungen einer Company
// Status-State-Machine: aktiv ↔ pausiert (mit Tier-Check), beide → geschlossen (Terminal)

const C = {
  accent: '#3b72b8', accentBg: '#eef4ff',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4',
  red: '#dc2626', redBg: '#fef2f2',
  amber: '#d97706', amberBg: '#fffbeb',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"


const STATUS_COLORS = {
  aktiv:       { bg: C.greenBg,  border: '#86efac', color: C.green,  label: 'Aktiv'      },
  pausiert:    { bg: C.amberBg,  border: '#fde68a', color: C.amber,  label: 'Pausiert'   },
  geschlossen: { bg: '#f1f5f9',  border: '#cbd5e1', color: '#64748b', label: 'Geschlossen' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function JobListingsManagementList() {
  const {
    listings, isLoading, actionLoading,
    fetchListings, pauseListing, reactivateListing, closeListing,
  } = useJobListingsManagement()

  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [tierMax, setTierMax] = useState<number | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Load listings on mount
  useEffect(() => {
    fetchListings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch tier max once on mount (for Tier-Limit-Status display)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !mountedRef.current) return
      supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('company_id', user.id)
        .maybeSingle()
        .then(({ data: sub }) => {
          if (!mountedRef.current) return
          const tier = (sub?.status === 'aktiv' ? sub?.tier : null) ?? 'basis'
          setTierMax(TIER_LIMITS[tier] ?? 1)
        })
    })
  }, [])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg)
    setToastType(type)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(null)
    }, 4000)
  }

  const handlePause = async (id: string) => {
    const err = await pauseListing(id)
    if (err) showToast(err, 'error')
    else showToast('Stelle pausiert.')
  }

  const handleReactivate = async (id: string) => {
    const err = await reactivateListing(id)
    if (err) showToast(err, 'error')
    else showToast('Stelle reaktiviert.')
  }

  const handleClose = async (id: string) => {
    const err = await closeListing(id)
    if (err) showToast(err, 'error')
    else showToast('Stelle geschlossen.')
  }

  const activeCount = listings.filter((l) => l.status === 'aktiv').length

  // Loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: `3px solid ${C.accentBg}`,
            borderTop: `3px solid ${C.accent}`, borderRadius: '50%',
            margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Stellen werden geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toastType === 'success' ? C.greenBg : C.redBg,
          border: `1.5px solid ${toastType === 'success' ? '#86efac' : '#fecaca'}`,
          color: toastType === 'success' ? C.green : C.red,
          borderRadius: 12, padding: '12px 20px',
          fontFamily: F, fontSize: 14, fontWeight: 600,
          boxShadow: C.shadowMd,
        }}>
          {toastType === 'success' ? '✓ ' : '✕ '}{toast}
        </div>
      )}

      {/* Tier-Limit-Status */}
      <div style={{
        background: '#fff', borderRadius: 16,
        border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
        padding: '14px 20px', marginBottom: 24,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: activeCount > 0 ? C.greenBg : C.accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800, color: activeCount > 0 ? C.green : C.accent,
          fontFamily: F, flexShrink: 0,
        }}>
          {activeCount}
        </div>
        <div>
          <p style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: C.text, margin: 0 }}>
            {tierMax !== null
              ? `${activeCount} / ${tierMax} aktive Stelle${tierMax === 1 ? '' : 'n'}`
              : `${activeCount} aktive Stelle${activeCount !== 1 ? 'n' : ''}`}
          </p>
          <p style={{ fontFamily: F, fontSize: 12, color: C.faint, margin: 0 }}>
            Pausierte und geschlossene Stellen zählen nicht gegen das Limit.
          </p>
        </div>
      </div>

      {/* Empty state */}
      {listings.length === 0 && (
        <div style={{
          background: '#fff', borderRadius: 20,
          border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
          padding: '48px 32px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>
            Noch keine Stellen angelegt
          </p>
          <p style={{ fontFamily: F, fontSize: 14, color: C.faint, marginBottom: 24 }}>
            Legen Sie Ihre erste Stellenausschreibung an, um passende Kandidaten zu finden.
          </p>
          <a href="/unternehmen/stelle-anlegen" style={{
            display: 'inline-block',
            background: C.accent, color: '#fff',
            borderRadius: 12, padding: '10px 22px',
            fontFamily: F, fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}>
            + Neue Stelle anlegen
          </a>
        </div>
      )}

      {/* Listing cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {listings.map((listing) => {
          const sc = STATUS_COLORS[listing.status]
          // [P3] Global lock: while any action is in-flight, disable all buttons to prevent concurrent races
          const isActing = actionLoading !== null
          const isThisActing = actionLoading === listing.id
          const isClosed = listing.status === 'geschlossen'

          return (
            <div key={listing.id} style={{
              background: '#fff', borderRadius: 16,
              border: `1.5px solid ${C.border}`, boxShadow: C.shadow,
              padding: '20px 24px',
              opacity: isClosed ? 0.75 : 1,
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontFamily: F, fontSize: 16, fontWeight: 700, color: C.text,
                    margin: 0, marginBottom: 6, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {listing.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {/* Status badge */}
                    <span style={{
                      display: 'inline-block',
                      background: sc.bg, border: `1px solid ${sc.border}`,
                      color: sc.color, borderRadius: 8,
                      padding: '2px 10px', fontSize: 12, fontWeight: 600, fontFamily: F,
                    }}>
                      {sc.label}
                    </span>
                    {/* Meta */}
                    <span style={{ fontSize: 12, color: C.faint, fontFamily: F }}>
                      Angelegt: {formatDate(listing.created_at)}
                    </span>
                    {listing.skillCount > 0 && (
                      <span style={{ fontSize: 12, color: C.faint, fontFamily: F }}>
                        {listing.skillCount} Skill{listing.skillCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {listing.desired_location_state && (
                      <span style={{ fontSize: 12, color: C.faint, fontFamily: F }}>
                        {listing.desired_location_state}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {!isClosed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {/* Bearbeiten — Link (aktiv + pausiert) */}
                    <a
                      href={`/unternehmen/stelle-bearbeiten/${listing.id}`}
                      style={{
                        fontSize: 13, color: C.accent, fontWeight: 600,
                        textDecoration: 'none', fontFamily: F,
                        borderRadius: 8, padding: '6px 12px',
                        border: `1px solid ${C.accentBg}`,
                        background: C.accentBg,
                        pointerEvents: isActing ? 'none' : 'auto',
                        opacity: isActing ? 0.5 : 1,
                      }}
                    >
                      Bearbeiten →
                    </a>

                    {/* Pausieren / Reaktivieren */}
                    {listing.status === 'aktiv' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handlePause(listing.id)}
                        style={{
                          fontSize: 13, color: C.amber, fontWeight: 600,
                          fontFamily: F, cursor: isActing ? 'not-allowed' : 'pointer',
                          borderRadius: 8, padding: '6px 12px',
                          border: `1px solid #fde68a`, background: C.amberBg,
                          opacity: isActing ? 0.6 : 1,
                        }}
                      >
                        {isThisActing ? '...' : 'Pausieren'}
                      </button>
                    )}
                    {listing.status === 'pausiert' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleReactivate(listing.id)}
                        style={{
                          fontSize: 13, color: C.green, fontWeight: 600,
                          fontFamily: F, cursor: isActing ? 'not-allowed' : 'pointer',
                          borderRadius: 8, padding: '6px 12px',
                          border: `1px solid #86efac`, background: C.greenBg,
                          opacity: isActing ? 0.6 : 1,
                        }}
                      >
                        {isThisActing ? '...' : 'Reaktivieren'}
                      </button>
                    )}

                    {/* Schließen */}
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleClose(listing.id)}
                      style={{
                        fontSize: 13, color: C.red, fontWeight: 600,
                        fontFamily: F, cursor: isActing ? 'not-allowed' : 'pointer',
                        borderRadius: 8, padding: '6px 12px',
                        border: `1px solid #fecaca`, background: C.redBg,
                        opacity: isActing ? 0.6 : 1,
                      }}
                    >
                      {isThisActing ? '...' : 'Schließen'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Link to create new listing */}
      {listings.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <a href="/unternehmen/stelle-anlegen" style={{
            fontSize: 13, color: C.accent, fontWeight: 600,
            textDecoration: 'none', fontFamily: F,
            borderRadius: 10, padding: '8px 16px',
            background: C.accentBg, border: `1px solid rgba(59,114,184,0.2)`,
          }}>
            + Neue Stelle anlegen
          </a>
        </div>
      )}
    </div>
  )
}
