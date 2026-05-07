import { useState, useEffect, useRef } from 'react'
import { useCompanyProfile } from '../hooks/useCompanyProfile'
import type { CompanyProfileData } from '../hooks/useCompanyProfile'

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', red: '#dc2626', redBg: '#fef2f2',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const BRANCHEN = ['Elektrotechnik', 'TGA', 'SHK', 'Mechatronik', 'Industrie', 'Sonstiges'] as const

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#f5f7fa',
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: C.text,
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: C.faint,
  display: 'block',
  marginBottom: 6,
  fontFamily: F,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

export function CompanyProfileForm() {
  const { profile, isLoading, isSaving, loadProfile, saveProfile } = useCompanyProfile()

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [website, setWebsite] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup toast timer on unmount
  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync form state when profile loads
  useEffect(() => {
    if (profile) {
      setCompanyName(profile.companyName)
      setIndustry(profile.industry)
      setLocation(profile.location)
      setDescription(profile.description)
      setContactName(profile.contactName)
      setWebsite(profile.website)
    }
  }, [profile])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg)
    setToastType(type)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // [P10] Require at least one character after the protocol (rejects bare "https://")
  const validateWebsite = (url: string): boolean => {
    if (!url.trim()) return true // optional
    return /^https?:\/\/.+/.test(url.trim())
  }

  const handleSave = async () => {
    setValidationError(null)

    // Client-side validation
    if (!companyName.trim()) {
      setValidationError('Firmenname ist erforderlich.')
      return
    }
    if (companyName.trim().length > 200) {
      setValidationError('Firmenname darf maximal 200 Zeichen haben.')
      return
    }
    if (!industry) {
      setValidationError('Bitte wählen Sie eine Branche aus.')
      return
    }
    // [P7] Validate industry against known whitelist (guards against direct API calls)
    if (!(BRANCHEN as readonly string[]).includes(industry)) {
      setValidationError('Bitte wählen Sie eine gültige Branche aus.')
      return
    }
    if (!location.trim()) {
      setValidationError('Region / Hauptstandort ist erforderlich.')
      return
    }
    if (location.trim().length > 100) {
      setValidationError('Region darf maximal 100 Zeichen haben.')
      return
    }
    // [P5] contactName length check (HTML maxLength can be bypassed programmatically)
    if (contactName.trim().length > 200) {
      setValidationError('Ansprechpartner-Name darf maximal 200 Zeichen haben.')
      return
    }
    // [P6] Validate trimmed length — consistent with what is actually submitted
    if (description.trim().length > 500) {
      setValidationError('Unternehmensbeschreibung darf maximal 500 Zeichen haben.')
      return
    }
    if (!validateWebsite(website)) {
      setValidationError('Website muss mit http:// oder https:// beginnen.')
      return
    }

    const formData: CompanyProfileData = {
      companyName: companyName.trim(),
      industry,
      location: location.trim(),
      description: description.trim(),
      contactName: contactName.trim(),
      website: website.trim(),
    }

    const errorMsg = await saveProfile(formData)
    if (errorMsg) {
      showToast(errorMsg, 'error')
    } else {
      showToast('Profil gespeichert')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, border: `3px solid ${C.accentBg}`,
            borderTop: `3px solid ${C.accent}`, borderRadius: '50%',
            margin: '0 auto 12px', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontFamily: F, fontSize: 13, color: C.faint }}>Wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          background: toastType === 'success' ? C.greenBg : C.redBg,
          border: `1.5px solid ${toastType === 'success' ? '#86efac' : '#fecaca'}`,
          color: toastType === 'success' ? C.green : C.red,
          borderRadius: 12, padding: '12px 20px',
          fontFamily: F, fontSize: 14, fontWeight: 600,
          boxShadow: C.shadowMd,
        }}>
          {toastType === 'success' ? '✓ ' : '✕ '}{toast}
        </div>
      )}

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 20,
        border: `1.5px solid ${C.border}`, boxShadow: C.shadow, padding: '28px 32px',
      }}>
        <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
          Unternehmensprofil
        </h2>
        <p style={{ fontFamily: F, fontSize: 14, color: C.muted, marginBottom: 28 }}>
          Diese Informationen helfen Kandidaten und unserem Admin-Team, Ihr Unternehmen besser zu verstehen.
        </p>

        {validationError && (
          <div style={{
            background: C.redBg, border: `1.5px solid #fecaca`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            fontFamily: F, fontSize: 14, color: C.red,
          }}>
            {validationError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
          {/* Firmenname */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Firmenname *</label>
            <input
              style={inputStyle}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Mustermann GmbH"
              maxLength={200}
            />
          </div>

          {/* Branche */}
          <div>
            <label style={labelStyle}>Branche *</label>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="">Bitte wählen...</option>
              {BRANCHEN.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label style={labelStyle}>Region / Hauptstandort *</label>
            <input
              style={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="z.B. Bayern, Berlin, Hamburg"
              maxLength={100}
            />
          </div>

          {/* Ansprechpartner */}
          <div>
            <label style={labelStyle}>Ansprechpartner</label>
            <input
              style={inputStyle}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Max Mustermann"
              maxLength={200}
            />
          </div>

          {/* Website */}
          <div>
            <label style={labelStyle}>Website</label>
            <input
              style={inputStyle}
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.mustermann.de"
              type="url"
            />
          </div>

          {/* Beschreibung */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Unternehmensbeschreibung
              <span style={{ marginLeft: 8, fontWeight: 400, color: description.trim().length > 480 ? C.red : C.faint }}>
                {description.trim().length} / 500
              </span>
            </label>
            <textarea
              style={{
                ...inputStyle,
                minHeight: 100,
                resize: 'vertical',
                lineHeight: 1.6,
                color: C.text,
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung Ihres Unternehmens, Tätigkeitsschwerpunkte, Unternehmenskultur..."
              maxLength={500}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            style={{
              background: (isSaving || isLoading) ? C.accentBg : C.accent,
              color: (isSaving || isLoading) ? C.accent : '#fff',
              border: 'none', borderRadius: 12,
              padding: '12px 28px', fontSize: 14, fontWeight: 700,
              cursor: (isSaving || isLoading) ? 'not-allowed' : 'pointer',
              fontFamily: F, transition: 'all 0.2s',
              boxShadow: (isSaving || isLoading) ? 'none' : '0 4px 16px rgba(59,114,184,0.22)',
            }}
          >
            {isSaving ? 'Wird gespeichert...' : 'Profil speichern'}
          </button>
        </div>
      </div>
    </div>
  )
}
