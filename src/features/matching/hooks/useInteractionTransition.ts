// useInteractionTransition — Story 6.1 + Story 6.2 + Story 6.4 + Story 6.5: Match-Status Übergänge
// Append-only INSERTs in interactions (kein UPDATE/DELETE laut RLS)
// transitionToNew:              'ausstehend' (null)  → 'new'               (angesehen)
// transitionToInterested:       'new'                → 'interested'         (Interesse signalisiert)
// transitionToCandidateDeclined:'interested'          → 'candidate_declined' (Kandidat lehnt ab)
// transitionToInterviewPlanned: 'interested'|...     → 'interview_planned'  (Story 6.5)
// transitionToNotHired:         'interested'|...     → 'not_hired'          (Story 6.5)

import { useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface UseInteractionTransitionReturn {
  transitionToNew:               (matchId: string) => Promise<boolean>
  transitionToInterested:        (matchId: string) => Promise<boolean>
  // Story 6.4: Kandidat lehnt Unternehmen ab
  transitionToCandidateDeclined: (matchId: string) => Promise<boolean>
  // Story 6.5: Prozess-Status
  transitionToInterviewPlanned:  (matchId: string) => Promise<boolean>
  transitionToNotHired:          (matchId: string) => Promise<boolean>
}

export function useInteractionTransition(): UseInteractionTransitionReturn {
  const mountedRef = useRef(true)

  // transitionToNew — setzt status='new' wenn der Kandidat zum ersten Mal angesehen wird
  // Guard: sollte nur aufgerufen werden wenn current_status === null
  // Idempotenz: bei Fehler (duplicate, RLS-Fehler) wird still gefailt — keine UI-Unterbrechung
  async function transitionToNew(matchId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('interactions').insert({
      match_id: matchId,
      status:   'new',
      set_by:   user.id,
    })

    if (error) {
      console.warn('[useInteractionTransition] transitionToNew fehler (idempotent):', matchId, error.code)
      return false
    }

    return true
  }

  // transitionToInterested — setzt status='interested' nach Unternehmen-Bestätigung
  // Triggert DB-Trigger interactions_audit_fn() → schreibt 'match.interested' in audit_log
  // Idempotenz: bei Fehler console.warn + false — kein Throw
  async function transitionToInterested(matchId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('interactions').insert({
      match_id: matchId,
      status:   'interested',
      set_by:   user.id,
    })

    if (error) {
      console.warn('[useInteractionTransition] transitionToInterested fehler (idempotent):', matchId, error.code)
      return false
    }

    return true
  }

  // transitionToCandidateDeclined — Story 6.4: Kandidat lehnt Unternehmen-Interesse ab
  // Nutzt SECURITY DEFINER Funktion decline_match_as_recruiter() für Zugriffsprüfung
  // Idempotenz: bei Fehler console.warn + false — kein Throw
  async function transitionToCandidateDeclined(matchId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.rpc('decline_match_as_recruiter', {
      p_match_id: matchId,
    })

    if (error) {
      console.warn('[useInteractionTransition] transitionToCandidateDeclined fehler:', matchId, error.message)
      return false
    }

    return true
  }

  // transitionToInterviewPlanned — Story 6.5: Unternehmen plant Interview
  async function transitionToInterviewPlanned(matchId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('interactions').insert({
      match_id: matchId,
      status:   'interview_planned',
      set_by:   user.id,
    })

    if (error) {
      console.warn('[useInteractionTransition] transitionToInterviewPlanned fehler:', matchId, error.message)
      return false
    }

    return true
  }

  // transitionToNotHired — Story 6.5: Unternehmen erteilt Absage
  async function transitionToNotHired(matchId: string): Promise<boolean> {
    if (!mountedRef.current) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { error } = await supabase.from('interactions').insert({
      match_id: matchId,
      status:   'not_hired',
      set_by:   user.id,
    })

    if (error) {
      console.warn('[useInteractionTransition] transitionToNotHired fehler:', matchId, error.message)
      return false
    }

    return true
  }

  return { transitionToNew, transitionToInterested, transitionToCandidateDeclined, transitionToInterviewPlanned, transitionToNotHired }
}
