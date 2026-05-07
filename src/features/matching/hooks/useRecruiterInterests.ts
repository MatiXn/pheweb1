// useRecruiterInterests — Story 6.3: Recruiter-seitige Interessenten-Übersicht
// Ruft get_recruiter_interested_matches() SECURITY DEFINER Funktion auf
// Gibt Matches zurück, bei denen recruiter_id = auth.uid() AND current_status = 'interested'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { RecruiterInterestMatch, MatchCategory, InteractionStatus } from '../types'

// Rohe Rückgabe von get_recruiter_interested_matches() (snake_case)
interface RawRecruiterInterestMatch {
  match_id: string
  anonymous_id: string
  professional_title: string
  job_title: string
  company_name: string
  company_id: string
  score: number
  category: MatchCategory
  matched_at: string
  current_status: InteractionStatus  // Story 6.6: NEU
}

function mapRecruiterInterestMatch(raw: RawRecruiterInterestMatch): RecruiterInterestMatch {
  return {
    matchId:           raw.match_id,
    anonymousId:       raw.anonymous_id,
    professionalTitle: raw.professional_title,
    jobTitle:          raw.job_title,
    companyName:       raw.company_name,
    companyId:         raw.company_id,
    score:             raw.score,
    category:          raw.category,
    matchedAt:         raw.matched_at,
    currentStatus:     raw.current_status,  // Story 6.6: NEU
  }
}

interface UseRecruiterInterestsReturn {
  matches: RecruiterInterestMatch[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useRecruiterInterests(): UseRecruiterInterestsReturn {
  const [matches, setMatches] = useState<RecruiterInterestMatch[]>([])
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

    async function fetchInterests() {
      if (!mountedRef.current) return
      setIsLoading(true)
      setError(null)

      const { data: rows, error: rpcError } = await supabase.rpc('get_recruiter_interested_matches')

      if (cancelled || !mountedRef.current) return

      if (rpcError) {
        setError('Interessenten konnten nicht geladen werden.')
        setIsLoading(false)
        return
      }

      setMatches((rows ?? []).map((row: RawRecruiterInterestMatch) => mapRecruiterInterestMatch(row)))
      setIsLoading(false)
    }

    fetchInterests()
    return () => { cancelled = true }
  }, [fetchTrigger])

  function refetch() {
    setFetchTrigger(t => t + 1)
  }

  return { matches, isLoading, error, refetch }
}
