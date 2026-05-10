// RecruiterProfilPage — Story 9.1: Recruiter-Profil & Spezialisierung
// Route: /recruiter/profil
// Schreibt: profiles (full_name, job_field, location, bio, company_name)

import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'
import { AppShell, shellColors as C, shellFont as F } from '../components/AppShell'

const BERUFSFELDER = ['Elektrotechnik', 'TGA', 'SHK', 'Mechatronik', 'Kältetechnik', 'Sonstiges']

function inputStyle(focused: boolean) {
  return {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '9px 12px', borderRadius: 8,
    border: `1.5px solid ${focused ? C.accent : C.border}`,
    fontSize: 14, fontFamily: F, outline: 'none',
    backgroundColor: '#fff',
    transition: 'border-color 0.15s',
  }
}

export default function RecruiterProfilPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()

  const [fullName,     setFullName]     = useState('')
  const [companyName,  setCompanyName]  = useState('')
  const [jobField,     setJobField]     = useState('')
  const [location,     setLocation]     = useState('')
  const [bio,          setBio]          = useState('')
  const [isSaving,     setIsSaving]     = useState(false)
  const [saveError,    setSaveError]    = useState<string | null>(null)
  const [saveSuccess,  setSaveSuccess]  = useState(false)
  const [focused,      setFocused]      = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name ?? '')
    setCompanyName((profile as Record<string, unknown>).company_name as string ?? '')
    setJobField(profile.job_field ?? '')
    setLocation((profile as Record<string, unknown>).location as string ?? '')
    setBio((profile as Record<string, unknown>).bio as string ?? '')
  }, [profile])

  if (profileLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'recruiter') return <Navigate to="/dashboard" replace />

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setSaveError('Name ist erforderlich.'); return }
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Sitzung abgelaufen.'); setIsSaving(false); return }

    const { error } = await supabase.from('profiles').update({
      full_name:    fullName.trim(),
      company_name: companyName.trim() || null,
      job_field:    jobField || null,
      location:     location.trim() || null,
      bio:          bio.trim().slice(0, 300) || null,
    }).eq('id', user.id)

    setIsSaving(false)
    if (error) setSaveError('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.')
    else { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000) }
  }

  const bioLen = bio.length

  return (
    <AppShell maxWidth={680}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', marginBottom: 4, fontFamily: F, margin: '0 0 6px' }}>
          Mein Profil
        </h1>
        <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: 0 }}>
          Ihre Expertise und Spezialisierung für die Plattform.
        </p>
      </div>

      <form onSubmit={handleSave}>
        <div style={{
          backgroundColor: '#fff', borderRadius: 16,
          border: `1px solid ${C.border}`, padding: '32px 28px',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}>

          {/* Name */}
          <div>
            <label style={labelStyle}>Vor- und Nachname *</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="Max Mustermann"
              style={inputStyle(focused === 'name')}
            />
          </div>

          {/* Firmenname */}
          <div>
            <label style={labelStyle}>Firmenname <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              onFocus={() => setFocused('company')}
              onBlur={() => setFocused(null)}
              placeholder="Ihre Recruiter-Firma GmbH"
              style={inputStyle(focused === 'company')}
            />
          </div>

          {/* Spezialisierung */}
          <div>
            <label style={labelStyle}>Spezialisierung (Berufsfeld)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {BERUFSFELDER.map(f => {
                const active = jobField === f
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setJobField(active ? '' : f)}
                    style={{
                      padding: '6px 14px', borderRadius: 99, fontSize: 13,
                      fontWeight: active ? 600 : 500, fontFamily: F, cursor: 'pointer',
                      border: `1.5px solid ${active ? C.accent : C.border}`,
                      backgroundColor: active ? C.accentBg : 'transparent',
                      color: active ? C.accent : C.muted,
                      transition: 'all 0.12s',
                    }}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Region */}
          <div>
            <label style={labelStyle}>Region</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              onFocus={() => setFocused('location')}
              onBlur={() => setFocused(null)}
              placeholder="z.B. Bayern, bundesweit"
              style={inputStyle(focused === 'location')}
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
              <span>Kurzbeschreibung</span>
              <span style={{ fontWeight: 400, color: bioLen > 280 ? '#dc2626' : C.muted }}>{bioLen}/300</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 300))}
              onFocus={() => setFocused('bio')}
              onBlur={() => setFocused(null)}
              rows={4}
              placeholder="Beschreiben Sie kurz Ihre Erfahrung und Spezialisierung als Recruiter…"
              style={{
                ...inputStyle(focused === 'bio'),
                resize: 'vertical', minHeight: 96,
              }}
            />
          </div>

          {/* Nutzungsvereinbarung Hinweis (AC: FR55) */}
          <div style={{
            backgroundColor: '#f8fafc', border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '12px 14px', fontSize: 13, color: C.muted, fontFamily: F,
          }}>
            Mit der Nutzung der Plattform stimmen Sie der{' '}
            <a href="#" style={{ color: C.accent }}>Nutzungsvereinbarung</a> und den{' '}
            <a href="#" style={{ color: C.accent }}>Success-Fee-Regelungen</a> zu.{' '}
            <span style={{ color: C.muted }}>
              [Aufteilungsschlüssel: Vor Launch zu definieren]
            </span>
          </div>

          {/* Errors / Success */}
          {saveError && (
            <div style={{ fontSize: 13, color: '#dc2626', fontFamily: F }}>{saveError}</div>
          )}
          {saveSuccess && (
            <div style={{ fontSize: 13, color: '#059669', fontFamily: F }}>Profil gespeichert.</div>
          )}

          {/* Save */}
          <button
            type="submit"
            disabled={isSaving}
            style={{
              alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 8,
              backgroundColor: isSaving ? C.muted : C.accent, color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, fontFamily: F, cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Wird gespeichert…' : 'Profil speichern'}
          </button>
        </div>
      </form>
    </AppShell>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  fontFamily: F, marginBottom: 6, display: 'block',
}
