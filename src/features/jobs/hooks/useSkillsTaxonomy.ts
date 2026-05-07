import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { SkillItem, skill_category } from '../types'

export interface UseSkillsTaxonomyOptions {
  includeInactive?: boolean
}

export interface UseSkillsTaxonomyReturn {
  skills: SkillItem[]
  isLoading: boolean
  error: string | null
  loadSkills: (opts?: UseSkillsTaxonomyOptions) => Promise<void>
  addSkill: (name: string, category: skill_category) => Promise<string | null>
  setSkillActive: (id: string, active: boolean) => Promise<string | null>
}

export function useSkillsTaxonomy(): UseSkillsTaxonomyReturn {
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)
  // loadingRef prevents re-entrant calls without causing stale closures (P1)
  const loadingRef = useRef(false)
  // lastLoadOptsRef lets addSkill reload with same context as last loadSkills call (P6)
  const lastLoadOptsRef = useRef<UseSkillsTaxonomyOptions>({})

  // mountedRef cleanup
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const loadSkills = useCallback(async (opts: UseSkillsTaxonomyOptions = {}) => {
    if (loadingRef.current) return
    if (!mounted.current) return
    loadingRef.current = true
    lastLoadOptsRef.current = opts
    setIsLoading(true)
    setError(null)

    let query = supabase.from('skills').select('*').order('name')
    if (!opts.includeInactive) {
      query = query.eq('is_active', true)
    }

    const { data, error: fetchError } = await query
    if (!mounted.current) {
      loadingRef.current = false  // P2: reset so remount can load
      return
    }
    if (fetchError) {
      setError('Skills konnten nicht geladen werden.')
      console.error('[useSkillsTaxonomy] loadSkills error:', fetchError)
      loadingRef.current = false
      setIsLoading(false)
      return
    }
    setSkills((data ?? []) as SkillItem[])
    loadingRef.current = false
    setIsLoading(false)
  }, [])  // P1: empty deps — stable reference, loadingRef guards concurrency

  const addSkill = async (name: string, category: skill_category): Promise<string | null> => {
    const { error: insertError } = await supabase
      .from('skills')
      .insert({ name: name.trim(), category })
    if (insertError) {
      if (insertError.code === '23505') return 'Ein Skill mit diesem Namen existiert bereits.'
      console.error('[useSkillsTaxonomy] addSkill error:', insertError)
      return 'Skill konnte nicht gespeichert werden.'
    }
    // P6: reload with same opts as last loadSkills call (preserves admin vs non-admin context)
    await loadSkills(lastLoadOptsRef.current)
    return null
  }

  const setSkillActive = async (id: string, active: boolean): Promise<string | null> => {
    const { error: updateError } = await supabase
      .from('skills')
      .update({ is_active: active })
      .eq('id', id)
    if (updateError) {
      console.error('[useSkillsTaxonomy] setSkillActive error:', updateError)
      return active
        ? 'Skill konnte nicht reaktiviert werden.'
        : 'Skill konnte nicht deaktiviert werden.'
    }
    // Optimistic update ohne reload
    setSkills(prev => prev.map(s => s.id === id ? { ...s, is_active: active } : s))
    return null
  }

  return { skills, isLoading, error, loadSkills, addSkill, setSkillActive }
}
