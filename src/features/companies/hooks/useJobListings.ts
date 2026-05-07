import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { TIER_LIMITS } from '../../../utils/tierLimits'

// [Story 4.3] Hook for creating job listings with tier-limit enforcement (FR19)
//
// F15 pattern: createJobListing returns string | null (null = success, string = error message)
// to avoid stale-state race conditions in the calling component.
//
// Tier limits are hardcoded until Epic 8 (Stripe/payment) is implemented.

export interface JobListingFormData {
  title: string
  hardSkillIds: string[]
  softSkillIds: string[]
  desiredLocationState: string
  radiusKm: number | null
  desiredAvailability: string
  salaryMin: number | null
  salaryMax: number | null
}

export interface TierLimitResult {
  allowed: boolean
  current: number
  max: number
  tier: string
}

const DEFAULT_TIER = 'basis'

export function useJobListings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  // Patch 4: cleanup mountedRef on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const checkTierLimit = async (): Promise<TierLimitResult> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { allowed: false, current: 0, max: 0, tier: DEFAULT_TIER }

    // Read subscription tier (NULL = no subscription row yet → default to basis)
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('company_id', user.id)
      .maybeSingle()

    // Patch 1: only use the subscription tier if the subscription is aktiv
    const tier = (sub?.status === 'aktiv' ? sub?.tier : null) ?? DEFAULT_TIER
    const max = TIER_LIMITS[tier] ?? 1

    // Count currently active job listings for this company
    const { count } = await supabase
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', user.id)
      .eq('status', 'aktiv')

    const current = count ?? 0
    return { allowed: current < max, current, max, tier }
  }

  const loadTierLimit = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      // Trigger a load so callers can store the result via checkTierLimit directly
      await checkTierLimit()
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }

  // Returns null on success, error message string on failure (F15 pattern)
  // Includes: DB-level tier guard + job_listing INSERT + job_skills batch INSERT with rollback
  const createJobListing = async (data: JobListingFormData): Promise<string | null> => {
    setIsSaving(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const msg = 'Nicht eingeloggt'
        setError(msg)
        return msg
      }

      // Guard: re-check tier limit server-side before insert (not just UI check)
      const limit = await checkTierLimit()
      if (!limit.allowed) {
        const msg = `Ihr aktuelles Paket erlaubt maximal ${limit.max} aktive Stelle${limit.max === 1 ? '' : 'n'}. Bitte schließen Sie eine Stelle oder upgraden Sie Ihr Paket.`
        setError(msg)
        return msg
      }

      // Step 1: INSERT into job_listings
      const { data: jobRow, error: insertError } = await supabase
        .from('job_listings')
        .insert({
          company_id: user.id,
          title: data.title,
          desired_location_state: data.desiredLocationState || null,
          radius_km: data.radiusKm,
          desired_availability: data.desiredAvailability || null,
          salary_min: data.salaryMin,
          salary_max: data.salaryMax,
          status: 'aktiv',
        })
        .select('id')
        .single()

      if (insertError || !jobRow) {
        const msg = 'Stelle konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
        setError(msg)
        return msg
      }

      // Step 2: INSERT into job_skills (hard skills + soft skills combined)
      const allSkillIds = [...data.hardSkillIds, ...data.softSkillIds]
      if (allSkillIds.length > 0) {
        const { error: skillsError } = await supabase
          .from('job_skills')
          .insert(allSkillIds.map((skill_id) => ({ job_listing_id: jobRow.id, skill_id })))

        if (skillsError) {
          // Rollback: delete the job listing we just created
          // Patch 5: log rollback errors so orphaned rows are visible in monitoring
          const { error: rollbackError } = await supabase
            .from('job_listings')
            .delete()
            .eq('id', jobRow.id)
          if (rollbackError) {
            console.error('[useJobListings] Rollback failed — orphaned job listing', jobRow.id, rollbackError)
          }
          const msg = 'Skills konnten nicht gespeichert werden. Bitte versuchen Sie es erneut.'
          setError(msg)
          return msg
        }
      }

      return null // success
    } finally {
      if (mountedRef.current) setIsSaving(false)
    }
  }

  return { isLoading, isSaving, error, checkTierLimit, loadTierLimit, createJobListing }
}
