import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

interface TotpEnrollResult {
  factorId: string
  qrCode: string
  secret: string
}

export function useAdminMfa() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enrollTotp = async (): Promise<TotpEnrollResult | null> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'pheweb Admin',
      })
      if (enrollError || !data) {
        setError('TOTP-Einrichtung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return null
      }
      return {
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      }
    } finally {
      setIsLoading(false)
    }
  }

  // TODO: verifyEnrollment does not integrate with login lockout (deferred security hardening)
  const verifyEnrollment = async (factorId: string, code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      })
      if (challengeError || !challenge) {
        setError('Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) {
        setError('Ungültiger Authentifizierungscode')
        return false
      }
      return true
    } finally {
      setIsLoading(false)
    }
  }

  const verifyTotp = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      // Verifizierten TOTP-Faktor ermitteln
      const { data: factorsData } = await supabase.auth.mfa.listFactors()
      const totpFactor = factorsData?.totp?.find((f) => f.status === 'verified')
      if (!totpFactor) {
        setError('Kein aktiver TOTP-Faktor gefunden.')
        return false
      }

      // E-Mail für Lockout-Prüfung
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const email = user?.email ?? ''

      if (!email) {
        // Cannot record lockout attempt without email
        setError('E-Mail nicht verfügbar')
        return false
      }

      // Lockout-Vorprüfung (NFR25)
      const { data: isLocked } = await supabase.rpc('check_login_lockout', { p_email: email })
      if (isLocked) {
        setError(
          'Ihr Konto wurde nach zu vielen Fehlversuchen vorübergehend gesperrt. Bitte versuchen Sie es in 30 Minuten erneut.'
        )
        return false
      }

      // Challenge erstellen
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      })
      if (challengeError || !challenge) {
        setError('Authentifizierung fehlgeschlagen. Bitte versuchen Sie es erneut.')
        return false
      }

      // Code verifizieren
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challenge.id,
        code,
      })

      if (verifyError) {
        // Fehlversuch dokumentieren (NFR25)
        const { data: nowLocked } = await supabase.rpc('record_login_attempt', {
          p_email: email,
          p_success: false,
        })
        if (nowLocked) {
          setError(
            'Ihr Konto wurde nach zu vielen Fehlversuchen vorübergehend gesperrt. Bitte versuchen Sie es in 30 Minuten erneut.'
          )
        } else {
          setError('Ungültiger Authentifizierungscode')
        }
        return false
      }

      // Erfolg dokumentieren
      await supabase.rpc('record_login_attempt', { p_email: email, p_success: true })
      return true
    } finally {
      setIsLoading(false)
    }
  }

  return { enrollTotp, verifyEnrollment, verifyTotp, isLoading, error }
}
