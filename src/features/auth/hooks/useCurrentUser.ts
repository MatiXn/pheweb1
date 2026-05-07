import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import type { Database } from '../../../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useCurrentUser() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProfile = async (userId: string) => {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (cancelled) return
      if (dbError) {
        setError('Profil konnte nicht geladen werden.')
        setProfile(null)
      } else {
        setProfile(data)
        setError(null)
      }
      setIsLoading(false)
    }

    // Initiale Session prüfen
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    // Auth-State-Änderungen (Login, Logout, Token-Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return
      if (session?.user) {
        setIsLoading(true)
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return { profile, isLoading, error }
}
