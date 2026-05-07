import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { Skill } from '../types'

// [Story 3.5] Profile edit hook
// Saves profile fields WITHOUT updating onboarding_step (unlike useOnboarding.saveStep1-4).
// Uses SECURITY DEFINER RPC for availability changes that also pause matches.

// Mapping: Berufsfeld → skill_category (same as useOnboarding)
const BERUFSFELD_KATEGORIE_MAP: Record<string, string> = {
  Elektrotechnik: 'elektrotechnik',
  TGA: 'tga',
  SHK: 'shk',
  Mechatronik: 'mechatronik',
  Kältetechnik: 'sonstiges',
  SPS: 'elektrotechnik',
}

export type AvailabilityStatus = 'sofort' | 'ab_datum' | 'nicht_verfuegbar'

export interface ProfileEditData {
  jobField: string
  skillIds: string[]
  desiredLocationState: string
  radiusKm: number | null
  salaryExpectation: number | null
  softSkills: string
}

export interface ProfileEditState {
  jobField: string
  skillIds: string[]
  desiredLocationState: string
  radiusKm: number | null
  salaryExpectation: number | null
  softSkills: string
  availabilityStatus: AvailabilityStatus | null
  availableFrom: string | null
}

export function useProfileEdit() {
  const [profile, setProfile] = useState<ProfileEditState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = async (): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return
      }

      // Load profile fields
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('job_field, desired_location_state, radius_km, salary_expectation, soft_skills, availability_status, available_from')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError('Profil konnte nicht geladen werden.')
        return
      }

      // Load current skill IDs
      const { data: skillsData, error: skillsError } = await supabase
        .from('candidate_skills')
        .select('skill_id')
        .eq('candidate_id', user.id)

      if (skillsError) {
        setError('Skills konnten nicht geladen werden.')
        return
      }

      setProfile({
        jobField: profileData.job_field ?? '',
        skillIds: (skillsData ?? []).map((s) => s.skill_id),
        desiredLocationState: profileData.desired_location_state ?? '',
        radiusKm: profileData.radius_km,
        salaryExpectation: profileData.salary_expectation,
        softSkills: profileData.soft_skills ?? '',
        availabilityStatus: (profileData.availability_status as AvailabilityStatus) ?? null,
        availableFrom: profileData.available_from,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSkillsForField = async (jobField: string): Promise<Skill[]> => {
    const category = BERUFSFELD_KATEGORIE_MAP[jobField] ?? 'sonstiges'
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
    if (fetchError) return []
    return (data ?? []) as Skill[]
  }

  // Save profile fields (job_field, skills, location, radius, salary, soft_skills)
  // Does NOT update onboarding_step — critical distinction from useOnboarding.saveStep*
  // Returns null on success, error message string on failure (F15: avoids stale hookError state race)
  const saveProfile = async (data: ProfileEditData): Promise<string | null> => {
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

      // Step 1: Update profiles (no onboarding_step!)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          job_field: data.jobField,
          desired_location_state: data.desiredLocationState,
          radius_km: data.radiusKm,
          salary_expectation: data.salaryExpectation,
          soft_skills: data.softSkills || null,
        })
        .eq('id', user.id)

      if (updateError) {
        const msg = 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.'
        setError(msg)
        return msg
      }

      // Step 2: Replace skills with rollback on insert failure (F05)
      // Fetch current skills before deleting so we can restore on failure
      const { data: oldSkillsData } = await supabase
        .from('candidate_skills')
        .select('skill_id')
        .eq('candidate_id', user.id)
      const oldSkillIds = (oldSkillsData ?? []).map((s) => s.skill_id)

      const { error: deleteError } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', user.id)

      if (deleteError) {
        const msg = 'Skills konnten nicht aktualisiert werden.'
        setError(msg)
        return msg
      }

      if (data.skillIds.length > 0) {
        const { error: insertError } = await supabase
          .from('candidate_skills')
          .insert(data.skillIds.map((skillId) => ({ candidate_id: user.id, skill_id: skillId })))

        if (insertError) {
          // Attempt rollback: restore old skills so user doesn't lose their previous skill set
          if (oldSkillIds.length > 0) {
            await supabase
              .from('candidate_skills')
              .insert(oldSkillIds.map((skillId) => ({ candidate_id: user.id, skill_id: skillId })))
          }
          const msg = 'Skills konnten nicht gespeichert werden.'
          setError(msg)
          return msg
        }
      }

      // Update local state
      setProfile((prev) => prev ? { ...prev, ...data } : null)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  // Quick-save availability via SECURITY DEFINER RPC
  // (RPC also pauses active matches if status = 'nicht_verfuegbar')
  const setAvailability = async (
    status: AvailabilityStatus,
    availableFrom?: string
  ): Promise<boolean> => {
    setIsSaving(true)
    setError(null)
    try {
      const { data, error: rpcError } = await supabase.rpc('candidate_set_availability', {
        p_status: status,
        p_available_from: status === 'ab_datum' ? (availableFrom ?? null) : null,
      })

      if (rpcError) {
        setError('Verfügbarkeit konnte nicht gespeichert werden.')
        return false
      }

      const result = data as { success?: boolean; error?: string } | null
      if (!result?.success) {
        setError('Verfügbarkeit konnte nicht gespeichert werden.')
        return false
      }

      // Update local state immediately (no page reload needed)
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              availabilityStatus: status,
              availableFrom: status === 'ab_datum' ? (availableFrom ?? null) : null,
            }
          : null
      )
      return true
    } finally {
      setIsSaving(false)
    }
  }

  return { profile, isLoading, isSaving, error, loadProfile, loadSkillsForField, saveProfile, setAvailability }
}
