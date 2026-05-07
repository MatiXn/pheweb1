import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { WizardStep1Data, WizardStep2Data, WizardStep3Data, WizardStep4Data, Skill } from '../types'

// Mapping: Berufsfeld → skill_category für DB-Abfrage
const BERUFSFELD_KATEGORIE_MAP: Record<string, string> = {
  Elektrotechnik: 'elektrotechnik',
  TGA: 'tga',
  SHK: 'shk',
  Mechatronik: 'mechatronik',
  Kältetechnik: 'sonstiges',
  SPS: 'elektrotechnik',
}

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSkillsByField = async (jobField: string): Promise<Skill[]> => {
    const category = BERUFSFELD_KATEGORIE_MAP[jobField] ?? 'sonstiges'
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
    if (fetchError) {
      setError('Skills konnten nicht geladen werden. Bitte Seite neu laden.')
      return []
    }
    return (data ?? []) as Skill[]
  }

  const saveStep1 = async (data: WizardStep1Data): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ job_field: data.jobField, onboarding_step: 1 })
        .eq('id', user.id)
      if (updateError) {
        setError('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const saveStep2 = async (data: WizardStep2Data): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }
      // Alte Skills löschen (idempotent)
      const { error: deleteError } = await supabase
        .from('candidate_skills')
        .delete()
        .eq('candidate_id', user.id)
      if (deleteError) {
        setError('Speichern fehlgeschlagen.')
        return false
      }
      // Neue Skills einfügen (nur wenn welche gewählt)
      if (data.skillIds.length > 0) {
        const inserts = data.skillIds.map((skillId) => ({
          candidate_id: user.id,
          skill_id: skillId,
        }))
        const { error: insertError } = await supabase.from('candidate_skills').insert(inserts)
        if (insertError) {
          setError('Skills-Speicherung fehlgeschlagen.')
          return false
        }
      }
      // onboarding_step aktualisieren
      const { error: stepError } = await supabase
        .from('profiles')
        .update({ onboarding_step: 2 })
        .eq('id', user.id)
      if (stepError) {
        setError('Fortschritt konnte nicht gespeichert werden.')
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const saveStep3 = async (data: WizardStep3Data): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          desired_location_state: data.desiredLocationState,
          radius_km: data.radiusKm,
          salary_expectation: data.salaryExpectation,
          onboarding_step: 3,
        })
        .eq('id', user.id)
      if (updateError) {
        setError('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const loadSoftSkills = async (): Promise<Skill[]> => {
    const { data, error: fetchError } = await supabase
      .from('skills')
      .select('id, name, category')
      .eq('category', 'it')
      .eq('is_active', true)
      .order('name')
    if (fetchError) {
      setError('Soft Skills konnten nicht geladen werden. Bitte Seite neu laden.')
      return []
    }
    return (data ?? []) as Skill[]
  }

  const saveStep4 = async (data: WizardStep4Data): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError('Nicht eingeloggt')
        return false
      }

      // 1. Soft Skills idempotent ersetzen (nur 'it'-Kategorie, Hard Skills erhalten)
      const { data: softSkillsData } = await supabase
        .from('skills')
        .select('id')
        .eq('category', 'it')
      const softSkillIds = softSkillsData?.map((s) => s.id) ?? []
      if (softSkillIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('candidate_skills')
          .delete()
          .eq('candidate_id', user.id)
          .in('skill_id', softSkillIds)
        if (deleteError) {
          setError('Skills konnten nicht aktualisiert werden.')
          return false
        }
      }
      if (data.softSkillIds.length > 0) {
        const { error: insertError } = await supabase
          .from('candidate_skills')
          .insert(data.softSkillIds.map((skillId) => ({ candidate_id: user.id, skill_id: skillId })))
        if (insertError) {
          setError('Soft Skills konnten nicht gespeichert werden.')
          return false
        }
      }

      // 2. Profil aktualisieren
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          availability_status: data.availabilityStatus,
          available_from:
            data.availabilityStatus === 'ab_datum' ? (data.availableFrom || null) : null,
          email_match_alerts: data.emailMatchAlerts,
          email_interest_alerts: data.emailInterestAlerts,
          onboarding_step: 4,
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }

      // 3. Matching-Invalidierung (FR21) — graceful: matches-Tabelle kann leer sein
      if (data.availabilityStatus === 'nicht_verfuegbar') {
        await supabase
          .from('matches')
          .update({ status: 'kandidat_nicht_verfügbar' })
          .eq('candidate_id', user.id)
          .in('status', ['ausstehend', 'angesehen'])
        // Fehler ignorieren — kein aktiver Match muss existieren
      }

      return true
    } finally {
      setIsLoading(false)
    }
  }

  return { loadSkillsByField, saveStep1, saveStep2, saveStep3, loadSoftSkills, saveStep4, isLoading, error }
}
