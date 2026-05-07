import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

// [Story 4.1] Company profile hook
// Saves company profile fields via SECURITY DEFINER RPC company_update_profile
// which atomically updates profiles + writes audit_log entry.
// Does NOT use direct profiles.update() because audit_log is service-role-only for INSERT.

export interface CompanyProfileData {
  companyName: string
  industry: string
  location: string
  description: string
  contactName: string
  website: string
}

export interface CompanyProfileState {
  companyName: string
  industry: string
  location: string
  description: string
  contactName: string
  website: string
}

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfileState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // [P3] Cancellation guard — prevents stale state writes after component unmounts
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const loadProfile = async (): Promise<void> => {
    // [P9] In-flight deduplication — skip if already loading
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!mountedRef.current) return
      if (!user) {
        setError('Nicht eingeloggt')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('company_name, industry, location, company_description, full_name, website')
        .eq('id', user.id)
        .single()

      if (!mountedRef.current) return

      // [P4] PGRST116 = no profile row yet → treat as blank new profile, not an error
      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setProfile({ companyName: '', industry: '', location: '', description: '', contactName: '', website: '' })
        } else {
          setError('Profil konnte nicht geladen werden.')
        }
        return
      }

      setProfile({
        companyName: data.company_name ?? '',
        industry: data.industry ?? '',
        location: data.location ?? '',
        description: data.company_description ?? '',
        contactName: data.full_name ?? '',
        website: data.website ?? '',
      })
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }

  // Returns null on success, error message string on failure.
  // Reading from the return value (not hookError state) avoids stale closure races (F15 pattern).
  const saveProfile = async (data: CompanyProfileData): Promise<string | null> => {
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

      const { data: result, error: rpcError } = await supabase.rpc('company_update_profile', {
        p_company_name: data.companyName,
        p_industry: data.industry,
        p_location: data.location,
        p_description: data.description,
        p_contact_name: data.contactName,
        p_website: data.website,
      })

      if (rpcError) {
        const msg = 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.'
        setError(msg)
        return msg
      }

      const rpcResult = result as { success?: boolean; error?: string } | null
      if (!rpcResult?.success) {
        const msg = rpcResult?.error === 'unauthorized'
          ? 'Keine Berechtigung zum Speichern.'
          : 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.'
        setError(msg)
        return msg
      }

      // Update local state immediately
      if (mountedRef.current) setProfile((prev) => prev ? { ...prev, ...data } : null)
      return null
    } finally {
      if (mountedRef.current) setIsSaving(false)
    }
  }

  return { profile, isLoading, isSaving, error, loadProfile, saveProfile }
}
