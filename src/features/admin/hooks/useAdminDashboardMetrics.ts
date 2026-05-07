// useAdminDashboardMetrics — Story 7.5: Admin-Monitoring-Dashboard
// Lädt die 6 Plattform-KPI-Metriken via RPC get_admin_dashboard_metrics()

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { AdminDashboardMetrics } from '../types'

export function useAdminDashboardMetrics() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('get_admin_dashboard_metrics')
    setIsLoading(false)
    if (rpcError) {
      setError(rpcError.message)
      return
    }
    // data ist jsonb → Supabase liefert es als JavaScript-Objekt
    const d = data as Record<string, number>
    setMetrics({
      activeCandidates:     d.active_candidates     ?? 0,
      pendingVerifications: d.pending_verifications ?? 0,
      activeCompanies:      d.active_companies      ?? 0,
      activeJobs:           d.active_jobs           ?? 0,
      matchesToday:         d.matches_today         ?? 0,
      hiresThisWeek:        d.hires_this_week       ?? 0,
    })
  }, [])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  return { metrics, isLoading, error, refetch: fetchMetrics }
}
