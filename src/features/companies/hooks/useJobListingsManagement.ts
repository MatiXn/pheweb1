import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { Database } from '../../../types/database'
import { TIER_LIMITS } from '../../../utils/tierLimits'

// [Story 4.4] Hook for managing existing job listings — list, pause, reactivate, close, edit.
//
// F15 pattern: all mutation functions return string | null (null = success, string = error).
// Match invalidation and transitionMatchStatus are TODO stubs (Epic 5/6 scope).
// Tier limits are hardcoded until Epic 8.

type JobListingRow = Database['public']['Tables']['job_listings']['Row']

export interface ManagedListing {
  id: string
  title: string
  status: 'aktiv' | 'pausiert' | 'geschlossen'
  desired_location_state: string | null
  radius_km: number | null
  desired_availability: string | null
  salary_min: number | null
  salary_max: number | null
  created_at: string
  skillCount: number
}

export interface ListingEditData {
  listing: JobListingRow
  skillIds: string[]
}

export interface JobListingUpdateData {
  title: string
  hardSkillIds: string[]
  softSkillIds: string[]
  desiredLocationState: string
  radiusKm: number | null
  desiredAvailability: string
  salaryMin: number | null
  salaryMax: number | null
}

const DEFAULT_TIER = 'basis'

export function useJobListingsManagement() {
  const [listings, setListings] = useState<ManagedListing[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null) // listing ID being acted on
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  // Task 1.2: fetch all listings for the current company (all statuses)
  const fetchListings = async (): Promise<void> => {
    if (!mountedRef.current) return
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (mountedRef.current) setIsLoading(false)
      return
    }

    const { data: rows } = await supabase
      .from('job_listings')
      .select('id, title, status, desired_location_state, radius_km, desired_availability, salary_min, salary_max, created_at')
      .eq('company_id', user.id)
      .order('created_at', { ascending: false })

    if (!rows || !mountedRef.current) {
      if (mountedRef.current) setIsLoading(false)
      return
    }

    // Count skills per listing in one query
    const listingIds = rows.map((r) => r.id)
    const skillCountMap: Record<string, number> = {}
    if (listingIds.length > 0) {
      const { data: skills } = await supabase
        .from('job_skills')
        .select('job_listing_id')
        .in('job_listing_id', listingIds)

      for (const s of skills ?? []) {
        skillCountMap[s.job_listing_id] = (skillCountMap[s.job_listing_id] ?? 0) + 1
      }
    }

    if (mountedRef.current) {
      setListings(
        rows.map((r) => ({
          ...r,
          status: r.status as 'aktiv' | 'pausiert' | 'geschlossen',
          skillCount: skillCountMap[r.id] ?? 0,
        }))
      )
      setIsLoading(false)
    }
  }

  // Task 1.3: pause listing (aktiv → pausiert)
  const pauseListing = async (id: string): Promise<string | null> => {
    setActionLoading(id)
    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'pausiert' })
      .eq('id', id)

    if (mountedRef.current) {
      setActionLoading(null)
      if (!error) {
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'pausiert' } : l))
      }
    }
    return error ? 'Stelle konnte nicht pausiert werden.' : null
  }

  // Task 1.4: reactivate listing (pausiert → aktiv) — requires tier check
  const reactivateListing = async (id: string): Promise<string | null> => {
    setActionLoading(id)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      if (mountedRef.current) setActionLoading(null)
      return 'Nicht eingeloggt.'
    }

    // Tier check before reactivation
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier, status')
      .eq('company_id', user.id)
      .maybeSingle()

    const tier = (sub?.status === 'aktiv' ? sub?.tier : null) ?? DEFAULT_TIER
    const max = TIER_LIMITS[tier] ?? 1

    const { count } = await supabase
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', user.id)
      .eq('status', 'aktiv')

    const current = count ?? 0
    if (current >= max) {
      if (mountedRef.current) setActionLoading(null)
      return `Tier-Limit erreicht (${current}/${max} aktive Stellen). Bitte schließen Sie zuerst eine aktive Stelle.`
    }

    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'aktiv' })
      .eq('id', id)

    if (mountedRef.current) {
      setActionLoading(null)
      if (!error) {
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'aktiv' } : l))
      }
    }
    return error ? 'Stelle konnte nicht reaktiviert werden.' : null
  }

  // Task 1.5: close listing (any → geschlossen, terminal)
  const closeListing = async (id: string): Promise<string | null> => {
    setActionLoading(id)
    const { error } = await supabase
      .from('job_listings')
      .update({ status: 'geschlossen' })
      .eq('id', id)

    if (mountedRef.current) {
      setActionLoading(null)
      if (!error) {
        setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: 'geschlossen' } : l))
      }
    }
    if (error) return 'Stelle konnte nicht geschlossen werden.'

    // TODO [Epic 6]: Wenn Stelle geschlossen → alle aktiven Matches auf 'nicht_eingestellt' setzen.
    // Für Einzel-Ablehnung (Story 5.4 implementiert): useMatchRejection aus features/matching verwenden.
    console.warn('[useJobListingsManagement] TODO: Bulk-Match-Transition noch nicht implementiert (Epic 6)')
    return null
  }

  // Task 1.6: load a single listing + its skill IDs for the edit form
  const loadListingForEdit = async (id: string): Promise<ListingEditData | string> => {
    const { data: listing, error } = await supabase
      .from('job_listings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !listing) return 'Stelle konnte nicht geladen werden.'

    const { data: skills } = await supabase
      .from('job_skills')
      .select('skill_id')
      .eq('job_listing_id', id)

    return { listing, skillIds: (skills ?? []).map((s) => s.skill_id) }
  }

  // Task 1.7: update an existing listing — replace all skills + log match invalidation TODO
  const updateListing = async (id: string, data: JobListingUpdateData): Promise<string | null> => {
    const { error: updateError } = await supabase
      .from('job_listings')
      .update({
        title: data.title,
        desired_location_state: data.desiredLocationState || null,
        radius_km: data.radiusKm,
        desired_availability: data.desiredAvailability || null,
        salary_min: data.salaryMin,
        salary_max: data.salaryMax,
      })
      .eq('id', id)

    if (updateError) return 'Stelle konnte nicht aktualisiert werden.'

    // Replace all skills: DELETE existing, then INSERT new batch
    // [P2] Backup existing skill IDs before DELETE so we can restore on INSERT failure
    const { data: existingSkills } = await supabase
      .from('job_skills')
      .select('skill_id')
      .eq('job_listing_id', id)
    const backupSkillIds = (existingSkills ?? []).map((s) => s.skill_id)

    const { error: deleteError } = await supabase
      .from('job_skills')
      .delete()
      .eq('job_listing_id', id)

    if (deleteError) {
      console.error('[useJobListingsManagement] job_skills DELETE failed', deleteError)
      return 'Skills konnten nicht aktualisiert werden.'
    }

    const allSkillIds = [...data.hardSkillIds, ...data.softSkillIds]
    if (allSkillIds.length > 0) {
      const { error: insertError } = await supabase
        .from('job_skills')
        .insert(allSkillIds.map((skill_id) => ({ job_listing_id: id, skill_id })))

      if (insertError) {
        console.error('[useJobListingsManagement] job_skills INSERT failed — attempting restore', insertError)
        // [P2] Restore original skills to prevent data loss
        if (backupSkillIds.length > 0) {
          await supabase
            .from('job_skills')
            .insert(backupSkillIds.map((skill_id) => ({ job_listing_id: id, skill_id })))
        }
        return 'Skills konnten nicht gespeichert werden. Die ursprünglichen Skills wurden wiederhergestellt.'
      }
    }

    // TODO [Epic 5]: invalidateMatchScores(id) — FR21
    console.warn('[useJobListingsManagement] TODO: Match-Invalidation noch nicht implementiert (Epic 5)')
    return null
  }

  return {
    listings,
    isLoading,
    actionLoading,
    fetchListings,
    pauseListing,
    reactivateListing,
    closeListing,
    loadListingForEdit,
    updateListing,
  }
}
