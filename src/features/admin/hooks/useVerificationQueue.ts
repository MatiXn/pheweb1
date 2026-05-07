// useVerificationQueue — Story 7.1: Admin-Kandidaten-Verifizierungs-Queue
// Ruft get_admin_verification_queue() SECURITY DEFINER Funktion auf
// Supabase Realtime: Channel 'admin:verification-queue' für Live-Updates

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { AdminVerificationEntry, SubscriptionTier } from '../types'

// Rohe Rückgabe von get_admin_verification_queue() (snake_case)
interface RawVerificationEntry {
  candidate_id: string
  anonymous_id: string
  professional_title: string
  location_city: string
  experience_years: number
  education_type: string
  education_field: string | null
  availability: string
  salary_expectation: number | null
  salary_currency: string
  recruiter_recommendation: string | null
  recruiter_neutral_assessment: string | null
  consent_given_at: string | null
  created_at: string
  document_count: number
  recruiter_id: string
  recruiter_first_name: string
  recruiter_last_name: string
  subscription_tier: SubscriptionTier
  completeness_score: number
}

function mapEntry(raw: RawVerificationEntry): AdminVerificationEntry {
  return {
    candidateId:               raw.candidate_id,
    anonymousId:               raw.anonymous_id,
    professionalTitle:         raw.professional_title,
    locationCity:              raw.location_city,
    experienceYears:           raw.experience_years,
    educationType:             raw.education_type,
    educationField:            raw.education_field,
    availability:              raw.availability,
    salaryExpectation:         raw.salary_expectation,
    salaryCurrency:            raw.salary_currency,
    recruiterRecommendation:   raw.recruiter_recommendation,
    recruiterNeutralAssessment: raw.recruiter_neutral_assessment,
    consentGivenAt:            raw.consent_given_at,
    createdAt:                 raw.created_at,
    documentCount:             raw.document_count,
    recruiterId:               raw.recruiter_id,
    recruiterFirstName:        raw.recruiter_first_name,
    recruiterLastName:         raw.recruiter_last_name,
    subscriptionTier:          raw.subscription_tier,
    completenessScore:         raw.completeness_score,
  }
}

interface UseVerificationQueueReturn {
  entries: AdminVerificationEntry[]
  isLoading: boolean
  error: string | null
  realtimeStatus: 'connecting' | 'connected' | 'error'
  refetch: () => void
}

export function useVerificationQueue(): UseVerificationQueueReturn {
  const [entries, setEntries] = useState<AdminVerificationEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Daten laden ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchQueue() {
      if (!mountedRef.current) return
      setIsLoading(true)
      setError(null)

      const { data: rows, error: rpcError } = await supabase.rpc('get_admin_verification_queue')

      if (cancelled || !mountedRef.current) return

      if (rpcError) {
        setError('Verifizierungs-Queue konnte nicht geladen werden.')
        setIsLoading(false)
        return
      }

      setEntries((rows ?? []).map((row: RawVerificationEntry) => mapEntry(row)))
      setIsLoading(false)
    }

    fetchQueue()
    return () => { cancelled = true }
  }, [fetchTrigger])

  // ── Supabase Realtime ────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('admin:verification-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => { setFetchTrigger(t => t + 1) }
      )
      .subscribe((status) => {
        if (!mountedRef.current) return
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setRealtimeStatus('error')
      })

    return () => { supabase.removeChannel(channel) }
  }, [])

  function refetch() {
    setFetchTrigger(t => t + 1)
  }

  return { entries, isLoading, error, realtimeStatus, refetch }
}
