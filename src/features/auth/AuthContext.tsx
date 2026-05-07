import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabaseClient'

const LAST_ACTIVITY_KEY = 'pheweb_last_activity'
const INACTIVITY_LIMITS = {
  admin: 2 * 60 * 60 * 1000,   // 2h in ms (NFR24: Admin)
  default: 8 * 60 * 60 * 1000, // 8h in ms (NFR24: Standard)
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initiale Session laden
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Inaktivitäts-Timeout prüfen (NFR24)
        // Skip inactivity signout during PASSWORD_RECOVERY sessions
        const isRecoverySession = session.user?.app_metadata?.recovery === true ||
          session.user?.aud === 'recovery'
        const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY)
        if (lastActivity && !isRecoverySession) {
          const role = session.user?.user_metadata?.role
          const limit =
            role === 'admin' ? INACTIVITY_LIMITS.admin : INACTIVITY_LIMITS.default
          if (Date.now() - Number(lastActivity) > limit) {
            // Session abgelaufen durch Inaktivität — revoke JWT before signing out
            const { error: revocationError } = await supabase
              .from('jwt_revocations')
              .upsert({ user_id: session.user.id, revoked_at: new Date().toISOString() })
            if (revocationError) {
              console.error('JWT revocation failed on inactivity signout:', revocationError)
            }
            await supabase.auth.signOut()
            localStorage.removeItem(LAST_ACTIVITY_KEY)
            setIsLoading(false)
            return
          }
        }
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      }
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Auth-State-Änderungen abonnieren (Login, Logout, Token-Refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
      } else {
        localStorage.removeItem(LAST_ACTIVITY_KEY)
      }
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext muss innerhalb von AuthProvider verwendet werden')
  }
  return context
}
