// RecruiterKandidatHochladenPage — Story 9.2: Kandidaten mit DSGVO-Einwilligung hochladen
// Route: /recruiter/kandidat-hochladen
// RPC: upload_candidate_as_recruiter()

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/hooks/useCurrentUser'
import { supabase } from '../lib/supabaseClient'
import { AppShell, shellColors as C, shellFont as F } from '../components/AppShell'

const AVAILABILITY_OPTIONS = [
  { value: 'immediate', label: 'Sofort verfügbar' },
  { value: '1_month',   label: 'In 1 Monat' },
  { value: '3_months',  label: 'In 3 Monaten' },
  { value: '6_months',  label: 'In 6 Monaten' },
  { value: 'flexible',  label: 'Flexibel' },
]

const EDUCATION_OPTIONS = [
  { value: 'none',       label: 'Kein Abschluss' },
  { value: 'ausbildung', label: 'Berufsausbildung' },
  { value: 'studium',    label: 'Studium' },
]

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 8,
    border: `1.5px solid ${focused ? C.accent : C.border}`,
    fontSize: 14, fontFamily: F, outline: 'none', backgroundColor: '#fff',
  }
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151',
  fontFamily: F, marginBottom: 5, display: 'block',
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase',
  letterSpacing: '0.07em', fontFamily: F, margin: '8px 0 16px',
}

interface FormData {
  firstName:         string
  lastName:          string
  email:             string
  phone:             string
  professionalTitle: string
  locationCity:      string
  experienceYears:   string
  educationType:     string
  salaryExpectation: string
  availability:      string
  switchWillingness: string
  recommendation:    string
  assessment:        string
  dsgvoConsent:      boolean
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  professionalTitle: '', locationCity: '', experienceYears: '',
  educationType: 'ausbildung', salaryExpectation: '',
  availability: 'flexible', switchWillingness: '3',
  recommendation: '', assessment: '', dsgvoConsent: false,
}

export default function RecruiterKandidatHochladenPage() {
  const { profile, isLoading: profileLoading } = useCurrentUser()
  const navigate = useNavigate()

  const [form,       setForm]       = useState<FormData>(EMPTY)
  const [focused,    setFocused]    = useState<string | null>(null)
  const [isSaving,   setIsSaving]   = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  if (profileLoading) return null
  if (!profile) return <Navigate to="/login" replace />
  if (profile.role !== 'recruiter') return <Navigate to="/dashboard" replace />

  function set(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const candidateName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.dsgvoConsent) {
      setError('Bitte bestätigen Sie die DSGVO-Einwilligung des Kandidaten.')
      return
    }
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Vorname, Nachname und E-Mail sind Pflichtfelder.')
      return
    }
    if (!form.professionalTitle.trim() || !form.locationCity.trim()) {
      setError('Berufsbezeichnung und Stadt sind Pflichtfelder.')
      return
    }

    setIsSaving(true)
    setError(null)

    const { error: rpcError } = await supabase.rpc('upload_candidate_as_recruiter', {
      p_first_name:                   form.firstName.trim(),
      p_last_name:                    form.lastName.trim(),
      p_email:                        form.email.trim(),
      p_phone:                        form.phone.trim() || null,
      p_professional_title:           form.professionalTitle.trim(),
      p_location_city:                form.locationCity.trim(),
      p_experience_years:             parseInt(form.experienceYears) || 0,
      p_education_type:               form.educationType,
      p_salary_expectation:           parseInt(form.salaryExpectation) || null,
      p_availability:                 form.availability,
      p_switch_willingness:           parseInt(form.switchWillingness) || 3,
      p_recruiter_neutral_assessment: form.assessment.trim() || null,
      p_recruiter_recommendation:     form.recommendation.trim() || null,
      p_dsgvo_ip_address:             null,
    })

    setIsSaving(false)

    if (rpcError) {
      if (rpcError.message.includes('bereits auf der Plattform')) {
        setError('Dieser Kandidat ist bereits auf der Plattform registriert. Der erste Upload hat Vorrang.')
      } else {
        setError('Upload fehlgeschlagen: ' + rpcError.message)
      }
      return
    }

    navigate('/recruiter/kandidaten')
  }

  return (
    <AppShell maxWidth={720}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: C.text, letterSpacing: '-0.02em', margin: '0 0 6px', fontFamily: F }}>
          Kandidat hochladen
        </h1>
        <p style={{ fontSize: 14, color: C.muted, fontFamily: F, margin: 0 }}>
          Laden Sie einen vorqualifizierten Kandidaten mit DSGVO-Einwilligung hoch.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#fff', borderRadius: 16,
          border: `1px solid ${C.border}`, padding: '28px 28px 32px',
          display: 'flex', flexDirection: 'column', gap: 0,
        }}>

          {/* ── Persönliche Daten ── */}
          <p style={SECTION_TITLE}>Persönliche Daten</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Vorname *</label>
              <input value={form.firstName} onChange={e => set('firstName', e.target.value)}
                onFocus={() => setFocused('fn')} onBlur={() => setFocused(null)}
                placeholder="Max" style={inputStyle(focused === 'fn')} />
            </div>
            <div>
              <label style={labelStyle}>Nachname *</label>
              <input value={form.lastName} onChange={e => set('lastName', e.target.value)}
                onFocus={() => setFocused('ln')} onBlur={() => setFocused(null)}
                placeholder="Mustermann" style={inputStyle(focused === 'ln')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>E-Mail *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                placeholder="max.mustermann@email.de" style={inputStyle(focused === 'email')} />
            </div>
            <div>
              <label style={labelStyle}>Telefon <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                placeholder="+49 …" style={inputStyle(focused === 'phone')} />
            </div>
          </div>

          {/* ── Berufliches Profil ── */}
          <p style={SECTION_TITLE}>Berufliches Profil</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Berufsbezeichnung *</label>
              <input value={form.professionalTitle} onChange={e => set('professionalTitle', e.target.value)}
                onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                placeholder="z.B. Elektroniker EFT" style={inputStyle(focused === 'title')} />
            </div>
            <div>
              <label style={labelStyle}>Stadt / Region *</label>
              <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)}
                onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                placeholder="z.B. München" style={inputStyle(focused === 'city')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Berufserfahrung (Jahre)</label>
              <input type="number" min="0" max="50" value={form.experienceYears}
                onChange={e => set('experienceYears', e.target.value)}
                onFocus={() => setFocused('exp')} onBlur={() => setFocused(null)}
                placeholder="z.B. 5" style={inputStyle(focused === 'exp')} />
            </div>
            <div>
              <label style={labelStyle}>Ausbildung</label>
              <select value={form.educationType} onChange={e => set('educationType', e.target.value)}
                style={{ ...inputStyle(false), appearance: 'none' }}>
                {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Gehaltsvorstellung (€/Jahr)</label>
              <input type="number" min="0" step="1000" value={form.salaryExpectation}
                onChange={e => set('salaryExpectation', e.target.value)}
                onFocus={() => setFocused('salary')} onBlur={() => setFocused(null)}
                placeholder="z.B. 45000" style={inputStyle(focused === 'salary')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Verfügbarkeit</label>
              <select value={form.availability} onChange={e => set('availability', e.target.value)}
                style={{ ...inputStyle(false), appearance: 'none' }}>
                {AVAILABILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Wechselbereitschaft (1–5)</label>
              <input type="range" min="1" max="5" value={form.switchWillingness}
                onChange={e => set('switchWillingness', e.target.value)}
                style={{ width: '100%', marginTop: 10 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, fontFamily: F, marginTop: 2 }}>
                <span>Gering</span>
                <span style={{ fontWeight: 700, color: C.accent }}>{form.switchWillingness}</span>
                <span>Sehr hoch</span>
              </div>
            </div>
          </div>

          {/* ── Recruiter-Einschätzung ── */}
          <p style={SECTION_TITLE}>Recruiter-Einschätzung</p>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Neutrale Einschätzung <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.assessment} onChange={e => set('assessment', e.target.value)}
              onFocus={() => setFocused('assess')} onBlur={() => setFocused(null)}
              rows={3} placeholder="Kurze objektive Einschätzung des Kandidaten…"
              style={{ ...inputStyle(focused === 'assess'), resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Empfehlung <span style={{ color: C.muted, fontWeight: 400 }}>(optional)</span></label>
            <textarea value={form.recommendation} onChange={e => set('recommendation', e.target.value)}
              onFocus={() => setFocused('rec')} onBlur={() => setFocused(null)}
              rows={2} placeholder="Besonders geeignet für… / Empfehlung für Stellen…"
              style={{ ...inputStyle(focused === 'rec'), resize: 'vertical' }} />
          </div>

          {/* ── DSGVO-Pflicht-Checkbox (FR51) ── */}
          <div style={{
            backgroundColor: '#eff6ff', border: `1.5px solid ${form.dsgvoConsent ? C.accent : '#bfdbfe'}`,
            borderRadius: 10, padding: '16px 18px', marginBottom: 20,
          }}>
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.dsgvoConsent}
                onChange={e => set('dsgvoConsent', e.target.checked)}
                style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.6, color: '#1e3a5f', fontFamily: F }}>
                Ich bestätige, dass{' '}
                <strong>{candidateName || '[Name des Kandidaten]'}</strong>{' '}
                mir ausdrücklich die Einwilligung erteilt hat, seine Daten auf dieser Plattform hochzuladen
                und Unternehmen anzuzeigen.{' '}
                <span style={{ fontSize: 12, color: C.muted }}>
                  (DSGVO-Pflichtbestätigung gemäß FR51)
                </span>
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626',
              fontFamily: F, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={isSaving || !form.dsgvoConsent}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                backgroundColor: (isSaving || !form.dsgvoConsent) ? '#94a3b8' : C.accent,
                color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: F,
                cursor: (isSaving || !form.dsgvoConsent) ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Wird hochgeladen…' : 'Kandidat hochladen'}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={isSaving}
              style={{
                padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                fontFamily: F, cursor: 'pointer',
                border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.muted,
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  )
}
