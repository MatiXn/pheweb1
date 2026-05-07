import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'kandidat' }, // → raw_user_meta_data → Trigger liest diese Rolle
        },
      })
      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('user already registered') || msg.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert')
        } else {
          setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        }
        return false
      }
      // Detect silent duplicate email (Supabase returns success but no session/identities)
      if (data?.user && data.user.identities?.length === 0) {
        setError('Diese E-Mail-Adresse wird bereits verwendet.')
        return false
      }
      return true
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUpUnternehmen = async (
    email: string,
    password: string,
    companyName: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'unternehmen', company_name: companyName },
        },
      })
      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('user already registered') || msg.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert')
        } else {
          setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        }
        return false
      }
      // Detect silent duplicate email (Supabase returns success but no session/identities)
      if (data?.user && data.user.identities?.length === 0) {
        setError('Diese E-Mail-Adresse wird bereits verwendet.')
        return false
      }
      return true
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUpRecruiter = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role: 'recruiter', full_name: fullName },
          // Trigger setzt nutzungsvereinbarung_akzeptiert_at = NOW() für recruiter-Rolle
        },
      })
      if (authError) {
        const msg = authError.message.toLowerCase()
        if (msg.includes('user already registered') || msg.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert')
        } else {
          setError('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        }
        return false
      }
      // Detect silent duplicate email (Supabase returns success but no session/identities)
      if (data?.user && data.user.identities?.length === 0) {
        setError('Diese E-Mail-Adresse wird bereits verwendet.')
        return false
      }
      return true
    } catch (err) {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; redirectTo?: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Lockout-Vorprüfung
      const { data: isLocked, error: lockoutError } = await supabase.rpc('check_login_lockout', { p_email: email })
      if (lockoutError) {
        console.error('check_login_lockout RPC failed:', lockoutError)
        // Treat as not locked out to avoid blocking legitimate users on RPC failure
      }
      if (isLocked) {
        setError(
          'Ihr Konto wurde nach zu vielen Fehlversuchen vorübergehend gesperrt. Bitte versuchen Sie es in 30 Minuten erneut.'
        )
        return { success: false }
      }

      // 2. Login-Versuch
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        const { data: nowLocked, error: recordError } = await supabase.rpc('record_login_attempt', {
          p_email: email,
          p_success: false,
        })
        if (recordError) {
          console.error('record_login_attempt RPC failed:', recordError)
        }
        if (nowLocked) {
          setError(
            'Ihr Konto wurde nach zu vielen Fehlversuchen vorübergehend gesperrt. Bitte versuchen Sie es in 30 Minuten erneut.'
          )
        } else {
          setError('E-Mail oder Passwort falsch. Bitte erneut versuchen.')
        }
        return { success: false }
      }

      // 3. Profil für rollenbasiertes Routing laden
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active, onboarding_step, dsgvo_consent_at')
        .eq('id', data.user.id)
        .single()

      let redirectTo = '/dashboard'
      if ((profile?.role === 'unternehmen' || profile?.role === 'recruiter') && !profile.is_active) {
        redirectTo = '/warten'
      } else if (profile?.role === 'unternehmen') {
        redirectTo = '/unternehmen/matches'
      } else if (profile?.role === 'recruiter') {
        redirectTo = '/recruiter/interessenten'
      } else if (profile?.role === 'kandidat' && (profile.onboarding_step ?? 0) < 4) {
        // Kandidat: Onboarding noch nicht abgeschlossen → Wizard
        redirectTo = '/kandidat/onboarding'
      } else if (
        profile?.role === 'kandidat' &&
        (profile.onboarding_step ?? 0) >= 4 &&
        !profile.dsgvo_consent_at
      ) {
        // Kandidat: Onboarding fertig aber DSGVO-Einwilligung fehlt → Consent-Seite
        redirectTo = '/kandidat/einwilligung'
      } else if (profile?.role === 'admin') {
        // Admin: TOTP-Status prüfen (NFR9)
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalError) {
          // AAL check failed — do not fall through to /dashboard; redirect to /login for safety
          console.error('AAL check failed:', aalError)
          await supabase.auth.signOut()
          return { success: false }
        }
        const { data: factorsData } = await supabase.auth.mfa.listFactors()
        const verifiedTotpFactors = factorsData?.totp?.filter((f) => f.status === 'verified') ?? []

        if (verifiedTotpFactors.length === 0) {
          // Kein aktiver TOTP → Setup erzwingen
          redirectTo = '/admin/totp-einrichten'
        } else if (aalData?.currentLevel !== aalData?.nextLevel) {
          // TOTP vorhanden, Session noch nicht auf AAL2
          redirectTo = '/admin/totp-verify'
        } else {
          // Bereits AAL2
          redirectTo = '/admin/monitoring'
        }
      }

      // 4. Erfolg dokumentieren — NACH TOTP-Routing-Entscheidung
      // NOTE [2-6]: record_login_attempt(success=true) is called here, before the user completes
      // TOTP verification (for admin). Full success should ideally be recorded after AAL2 is reached.
      // For now this records a successful password auth, not necessarily completed MFA.
      const { error: recordSuccessError } = await supabase.rpc('record_login_attempt', { p_email: email, p_success: true })
      if (recordSuccessError) {
        console.error('record_login_attempt (success) RPC failed:', recordSuccessError)
      }

      return { success: true, redirectTo }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { error: revocationError } = await supabase
        .from('jwt_revocations')
        .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      if (revocationError) {
        console.error('JWT revocation failed:', revocationError)
        // Continue anyway — user is signed out locally
      }
    }
    await supabase.auth.signOut()
    localStorage.removeItem('pheweb_last_activity')
  }

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // Anti-Enumeration: resetPasswordForEmail wirft keinen Fehler wenn E-Mail nicht existiert
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/passwort-zuruecksetzen`,
      })
    } finally {
      setIsLoading(false)
    }
    // IMMER true zurückgeben — nie verraten ob E-Mail existiert
    return true
  }

  const resetPassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setError('Passwort konnte nicht geändert werden. Bitte versuchen Sie es erneut.')
        return false
      }
      // Alte Sessions invalidieren
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { error: revocationError } = await supabase
          .from('jwt_revocations')
          .upsert({ user_id: user.id }, { onConflict: 'user_id' })
        if (revocationError) {
          console.error('JWT revocation failed:', revocationError)
          // Continue anyway — user is signed out locally
        }
      }
      // Clear recovery session after password reset
      await supabase.auth.signOut()
      return true
    } finally {
      setIsLoading(false)
    }
  }

  return {
    signUp,
    signUpUnternehmen,
    signUpRecruiter,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    isLoading,
    error,
  }
}
