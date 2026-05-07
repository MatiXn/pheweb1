// useCompanyMatches — Story 6.1: Anonymisierte Match-Daten für Unternehmen-Dashboard
// Ruft get_top_matches_for_company() SECURITY DEFINER Funktion auf
// Gibt pro Job die Top-3-Matches als CandidateCard[] zurück (KEIN PII)

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { CandidateCard, CompanyMatchOverview, InteractionStatus, MatchCategory, CandidateAvailability } from '../types'

// Rohe Rückgabe von get_top_matches_for_company() (JSONB → snake_case)
interface RawCandidateCard {
  match_id: string
  candidate_id: string
  anonymous_id: string
  category: MatchCategory
  score: number
  hire_probability: number | null
  skill_score: number
  experience_score: number
  salary_score: number
  location_score: number
  availability_score: number
  switch_willingness_score: number
  professional_title: string
  location_city: string
  experience_years: number
  education_type: 'none' | 'ausbildung' | 'studium'
  education_field: string | null
  education_match: 'not_evaluated' | 'match' | 'no_match'
  availability: CandidateAvailability
  salary_expectation: number | null
  salary_currency: string
  reasons: string[]
  neutral_assessment: string | null
  recommendation: string | null
  skills: Array<{ name: string; level?: string; years?: number }>
  visible_until: string | null
  current_status: InteractionStatus | null
  is_shortlisted: boolean  // Story 6.5
}

interface RawMatchOverview {
  job_id: string
  job_title: string
  job_status: string
  top_candidates: RawCandidateCard[]
}

// snake_case → camelCase Konvertierung
function mapCandidateCard(raw: RawCandidateCard): CandidateCard {
  return {
    matchId:                 raw.match_id,
    candidateId:             raw.candidate_id,
    anonymousId:             raw.anonymous_id,
    category:                raw.category,
    score:                   raw.score,
    hireProbability:         raw.hire_probability,
    skillScore:              raw.skill_score,
    experienceScore:         raw.experience_score,
    salaryScore:             raw.salary_score,
    locationScore:           raw.location_score,
    availabilityScore:       raw.availability_score,
    switchWillingnessScore:  raw.switch_willingness_score,
    professionalTitle:       raw.professional_title,
    locationCity:            raw.location_city,
    experienceYears:         raw.experience_years,
    educationType:           raw.education_type,
    educationField:          raw.education_field,
    educationMatch:          raw.education_match,
    availability:            raw.availability,
    salaryExpectation:       raw.salary_expectation,
    salaryCurrency:          raw.salary_currency,
    reasons:                 raw.reasons ?? [],
    neutralAssessment:       raw.neutral_assessment,
    recommendation:          raw.recommendation,
    skills:                  raw.skills ?? [],
    visibleUntil:            raw.visible_until,
    currentStatus:           raw.current_status,
    isShortlisted:           raw.is_shortlisted ?? false,  // Story 6.5
  }
}

interface UseCompanyMatchesReturn {
  data: CompanyMatchOverview[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useCompanyMatches(): UseCompanyMatchesReturn {
  const [data, setData] = useState<CompanyMatchOverview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchTrigger, setFetchTrigger] = useState(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchMatches() {
      if (!mountedRef.current) return
      setIsLoading(true)
      setError(null)

      const { data: rows, error: rpcError } = await supabase.rpc('get_top_matches_for_company')

      if (cancelled || !mountedRef.current) return

      if (rpcError) {
        setError('Match-Daten konnten nicht geladen werden.')
        setIsLoading(false)
        return
      }

      const overviews: CompanyMatchOverview[] = (rows ?? []).map((row: RawMatchOverview) => ({
        jobId:         row.job_id,
        jobTitle:      row.job_title,
        jobStatus:     row.job_status,
        topCandidates: (row.top_candidates ?? []).map(mapCandidateCard),
      }))

      setData(overviews)
      setIsLoading(false)
    }

    fetchMatches()
    return () => { cancelled = true }
  }, [fetchTrigger])

  function refetch() {
    setFetchTrigger(t => t + 1)
  }

  return { data, isLoading, error, refetch }
}
