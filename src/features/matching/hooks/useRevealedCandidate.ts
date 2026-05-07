// useRevealedCandidate — Story 6.2: Recruiter-Kontaktdaten nach Interesse-Signal laden
// Ruft get_candidate_contact_for_match() auf wenn current_status >= 'interested'
// SECURITY DEFINER Funktion prüft Zugangsberechtigung + Reveal-Gate intern

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { InteractionStatus, RecruiterContact } from '../types'

// Status-Werte ab denen Reveal aktiv ist (inkl. 'interested' und alle Folge-Status)
const REVEALED_STATUSES: InteractionStatus[] = [
  'interested',
  'token_sent',
  'candidate_approved',
  'candidate_declined',
  'candidate_timeout',
  'interview_planned',
  'interview_done',
  'hired',
  'not_hired',
]

interface RawRecruiterContact {
  recruiter_first_name:       string
  recruiter_last_name:        string
  recruiter_email:            string
  recruiter_phone:            string | null
  candidate_anonymous_id:     string
  candidate_title:            string
  candidate_location_city:    string
  candidate_experience_years: number
}

function mapRecruiterContact(raw: RawRecruiterContact): RecruiterContact {
  return {
    recruiterFirstName:      raw.recruiter_first_name,
    recruiterLastName:       raw.recruiter_last_name,
    recruiterEmail:          raw.recruiter_email,
    recruiterPhone:          raw.recruiter_phone,
    candidateAnonymousId:    raw.candidate_anonymous_id,
    candidateTitle:          raw.candidate_title,
    candidateLocationCity:   raw.candidate_location_city,
    candidateExperienceYears: raw.candidate_experience_years,
  }
}

interface UseRevealedCandidateReturn {
  contact: RecruiterContact | null
  isLoading: boolean
  error: string | null
}

export function useRevealedCandidate(
  matchId: string,
  currentStatus: InteractionStatus | null
): UseRevealedCandidateReturn {
  const [contact, setContact] = useState<RecruiterContact | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    // Nur laden wenn Reveal aktiv ist
    if (!currentStatus || !REVEALED_STATUSES.includes(currentStatus)) {
      setContact(null)
      return
    }

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      const { data, error: rpcError } = await supabase.rpc(
        'get_candidate_contact_for_match',
        { p_match_id: matchId }
      )

      if (cancelled || !mountedRef.current) return

      if (rpcError) {
        setError(rpcError.message)
        setIsLoading(false)
        return
      }

      if (data && Array.isArray(data) && data.length > 0) {
        setContact(mapRecruiterContact(data[0] as RawRecruiterContact))
      } else {
        setError('Kontaktdaten nicht gefunden')
      }

      setIsLoading(false)
    }

    load()

    return () => { cancelled = true }
  }, [matchId, currentStatus])

  return { contact, isLoading, error }
}
