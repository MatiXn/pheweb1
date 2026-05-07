import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useOnboarding } from '../hooks/useOnboarding'
import type { OnboardingWizardProps, Skill, WizardStep1Data, WizardStep3Data, WizardStep4Data } from '../types'

const C = {
  accent: '#3b72b8',
  accentHover: '#2d5a9e',
  text: '#0f1623',
  muted: '#4b5675',
  faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)',
  borderFocus: '#3b72b8',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  shadowLg: '0 20px 60px rgba(59,114,184,0.12)',
  cardSelected: '#3b72b8',
  cardSelectedBg: '#eff5fd',
}

const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const BERUFSFELDER = ['Elektrotechnik', 'TGA', 'SHK', 'Mechatronik', 'Kältetechnik', 'SPS']

const BUNDESLAENDER = [
  'Baden-Württemberg',
  'Bayern',
  'Berlin',
  'Brandenburg',
  'Bremen',
  'Hamburg',
  'Hessen',
  'Mecklenburg-Vorpommern',
  'Niedersachsen',
  'Nordrhein-Westfalen',
  'Rheinland-Pfalz',
  'Saarland',
  'Sachsen',
  'Sachsen-Anhalt',
  'Schleswig-Holstein',
  'Thüringen',
]

const RADIUS_OPTIONS = [10, 25, 50, 100, 200]

const TOTAL_STEPS = 4

export function OnboardingWizard({ initialStep = 1, initialJobField = '', onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [selectedJobField, setSelectedJobField] = useState(initialJobField)
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  // Step 4 state
  const [availabilityStatus, setAvailabilityStatus] = useState<WizardStep4Data['availabilityStatus'] | ''>('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [softSkills, setSoftSkills] = useState<Skill[]>([])
  const [selectedSoftSkillIds, setSelectedSoftSkillIds] = useState<string[]>([])
  const [softSkillsLoading, setSoftSkillsLoading] = useState(false)
  const [emailMatchAlerts, setEmailMatchAlerts] = useState(true)
  const [emailInterestAlerts, setEmailInterestAlerts] = useState(true)
  const [availabilityError, setAvailabilityError] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const { loadSkillsByField, saveStep1, saveStep2, saveStep3, loadSoftSkills, saveStep4, isLoading, error } = useOnboarding()

  // Step 1 form
  const step1Form = useForm<WizardStep1Data>()
  // Step 3 form
  const step3Form = useForm<WizardStep3Data>({ defaultValues: { radiusKm: 50 } })

  // Load skills when entering step 2
  useEffect(() => {
    if (currentStep === 2 && selectedJobField) {
      setSkillsLoading(true)
      loadSkillsByField(selectedJobField).then((data) => {
        setSkills(data)
        setSkillsLoading(false)
      })
    }
  }, [currentStep, selectedJobField])

  // Load soft skills when entering step 4
  useEffect(() => {
    if (currentStep === 4) {
      setSoftSkillsLoading(true)
      loadSoftSkills().then((data) => {
        setSoftSkills(data)
        setSoftSkillsLoading(false)
      })
    }
  }, [currentStep])

  const progressPercent = (currentStep / TOTAL_STEPS) * 100

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  const toggleSoftSkill = (skillId: string) => {
    setSelectedSoftSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  const handleStep4Submit = async () => {
    if (!availabilityStatus) {
      setAvailabilityError(true)
      return
    }
    if (availabilityStatus === 'ab_datum' && !availableFrom) {
      setAvailabilityError(true)
      return
    }
    setAvailabilityError(false)
    const ok = await saveStep4({
      availabilityStatus,
      availableFrom: availabilityStatus === 'ab_datum' ? availableFrom : undefined,
      softSkillIds: selectedSoftSkillIds,
      emailMatchAlerts,
      emailInterestAlerts,
    })
    if (ok) {
      setIsCompleted(true)
    }
  }

  const handleStep1Submit = async (data: WizardStep1Data) => {
    const ok = await saveStep1(data)
    if (ok) {
      if (data.jobField !== selectedJobField) {
        setSelectedSkillIds([])
      }
      setSelectedJobField(data.jobField)
      setCurrentStep(2)
    }
  }

  const handleStep2Submit = async () => {
    const ok = await saveStep2({ skillIds: selectedSkillIds })
    if (ok) {
      setCurrentStep(3)
    }
  }

  const handleStep3Submit = async (data: WizardStep3Data) => {
    const ok = await saveStep3(data)
    if (ok) {
      if (onComplete) {
        // NOTE [3-2 P8]: onComplete skips step 4; caller is responsible for
        // ensuring onboarding_step is set to 4 before invoking this callback,
        // or step 4 (Verfügbarkeit) will be bypassed entirely.
        onComplete()
      } else {
        setCurrentStep(4)
      }
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: F,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
    color: C.text,
    background: '#fff',
  }

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none' as const,
  }

  const buttonPrimary = (disabled: boolean) => ({
    width: '100%',
    padding: '12px 20px',
    background: disabled ? '#93b3d8' : C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: F,
    cursor: disabled ? 'not-allowed' : 'pointer',
    letterSpacing: '-0.01em',
    marginTop: 8,
  })

  const buttonSecondary = {
    padding: '10px 20px',
    background: 'transparent',
    color: C.muted,
    border: `1.5px solid ${C.border}`,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: F,
    cursor: 'pointer',
    letterSpacing: '-0.01em',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: 13,
    fontWeight: 600,
    color: C.muted,
    marginBottom: 6,
    fontFamily: F,
  }

  const errorStyle = {
    marginTop: 4,
    fontSize: 12,
    color: C.red,
    fontFamily: F,
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fa',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: F,
      }}
    >
      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <a
            href="/"
            style={{
              fontFamily: F,
              fontSize: 28,
              fontWeight: 800,
              color: C.text,
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            phe<em style={{ fontStyle: 'italic', color: C.accent }}>web</em>
          </a>
          <p style={{ marginTop: 6, fontSize: 14, color: C.muted }}>Profil einrichten</p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 36,
            boxShadow: C.shadowLg,
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Progress */}
          {!isCompleted && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: C.muted, fontFamily: F }}>
                Schritt {Math.min(currentStep, TOTAL_STEPS)} von {TOTAL_STEPS}
              </span>
              <span style={{ fontSize: 13, color: C.faint, fontFamily: F }}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: 4, height: 6 }}>
              <div
                style={{
                  background: C.accent,
                  width: `${progressPercent}%`,
                  height: '100%',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
          )}

          {/* Error banner */}
          {error && (
            <div
              style={{
                background: C.redBg,
                border: `1px solid ${C.redBorder}`,
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 13,
                color: C.red,
                fontFamily: F,
              }}
            >
              {error}
            </div>
          )}

          {/* ── Schritt 1: Berufsfeld ── */}
          {currentStep === 1 && (
            <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} noValidate>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                Ihr Berufsfeld
              </h1>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                Wählen Sie Ihren Fachbereich aus.
              </p>

              <input
                type="hidden"
                {...step1Form.register('jobField', {
                  required: 'Bitte wählen Sie ein Berufsfeld aus',
                })}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                {BERUFSFELDER.map((feld) => {
                  const isSelected = step1Form.watch('jobField') === feld
                  return (
                    <button
                      key={feld}
                      type="button"
                      onClick={() => step1Form.setValue('jobField', feld, { shouldValidate: true })}
                      style={{
                        padding: '14px 10px',
                        background: isSelected ? C.cardSelectedBg : '#f8fafc',
                        border: `2px solid ${isSelected ? C.cardSelected : C.border}`,
                        borderRadius: 12,
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        fontFamily: F,
                        color: isSelected ? C.accent : C.text,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                        minHeight: 52,
                      }}
                    >
                      {feld}
                    </button>
                  )
                })}
              </div>

              {step1Form.formState.errors.jobField && (
                <p style={{ ...errorStyle, marginBottom: 12 }}>
                  {step1Form.formState.errors.jobField.message}
                </p>
              )}

              <button type="submit" disabled={isLoading} style={buttonPrimary(isLoading)}>
                {isLoading ? 'Wird gespeichert...' : 'Weiter →'}
              </button>
            </form>
          )}

          {/* ── Schritt 2: Hard Skills ── */}
          {currentStep === 2 && (
            <div>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                Ihre Hard Skills
              </h1>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                Wählen Sie Ihre Fachkenntnisse aus (Mehrfachauswahl möglich).
              </p>

              {skillsLoading ? (
                <p style={{ fontSize: 14, color: C.faint, textAlign: 'center', padding: '20px 0' }}>
                  Skills werden geladen...
                </p>
              ) : skills.length === 0 ? (
                <p style={{ fontSize: 14, color: C.faint, textAlign: 'center', padding: '20px 0' }}>
                  Keine Skills verfügbar
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 20,
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {skills.map((skill) => {
                    const isChecked = selectedSkillIds.includes(skill.id)
                    return (
                      <label
                        key={skill.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '12px 14px',
                          background: isChecked ? C.cardSelectedBg : '#f8fafc',
                          border: `1.5px solid ${isChecked ? C.cardSelected : C.border}`,
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontFamily: F,
                          color: C.text,
                          fontWeight: isChecked ? 600 : 400,
                          minHeight: 44,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSkill(skill.id)}
                          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent }}
                        />
                        {skill.name}
                      </label>
                    )
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  style={{ ...buttonSecondary, flex: '0 0 auto' }}
                >
                  ← Zurück
                </button>
                <button
                  type="button"
                  onClick={handleStep2Submit}
                  disabled={isLoading}
                  style={{ ...buttonPrimary(isLoading), flex: 1, marginTop: 0 }}
                >
                  {isLoading ? 'Wird gespeichert...' : 'Weiter →'}
                </button>
              </div>
            </div>
          )}

          {/* ── Schritt 3: Region & Gehalt ── */}
          {currentStep === 3 && (
            <form onSubmit={step3Form.handleSubmit(handleStep3Submit)} noValidate>
              <h1
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                Region & Gehaltsvorstellung
              </h1>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                Wo möchten Sie arbeiten und was sind Ihre Gehaltsvorstellungen?
              </p>

              {/* Bundesland */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="bundesland" style={labelStyle}>
                  Bundesland *
                </label>
                <select
                  id="bundesland"
                  style={{
                    ...selectStyle,
                    borderColor: step3Form.formState.errors.desiredLocationState
                      ? C.red
                      : C.border,
                  }}
                  {...step3Form.register('desiredLocationState', {
                    required: 'Bitte wählen Sie ein Bundesland aus',
                  })}
                >
                  <option value="">Bundesland auswählen...</option>
                  {BUNDESLAENDER.map((bl) => (
                    <option key={bl} value={bl}>
                      {bl}
                    </option>
                  ))}
                </select>
                {step3Form.formState.errors.desiredLocationState && (
                  <p style={errorStyle}>
                    {step3Form.formState.errors.desiredLocationState.message}
                  </p>
                )}
              </div>

              {/* PLZ-Umkreis */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="radius" style={labelStyle}>
                  Umkreis (km)
                </label>
                <select
                  id="radius"
                  style={selectStyle}
                  {...step3Form.register('radiusKm', { valueAsNumber: true })}
                >
                  {RADIUS_OPTIONS.map((km) => (
                    <option key={km} value={km}>
                      {km} km
                    </option>
                  ))}
                </select>
              </div>

              {/* Gehaltsvorstellung */}
              <div style={{ marginBottom: 24 }}>
                <label htmlFor="salary" style={labelStyle}>
                  Gehaltsvorstellung (€/Jahr) *
                </label>
                <input
                  id="salary"
                  type="number"
                  inputMode="numeric"
                  placeholder="z.B. 45000"
                  style={{
                    ...inputStyle,
                    borderColor: step3Form.formState.errors.salaryExpectation ? C.red : C.border,
                  }}
                  {...step3Form.register('salaryExpectation', {
                    valueAsNumber: true,
                    required: 'Bitte geben Sie Ihre Gehaltsvorstellung ein',
                    min: {
                      value: 15000,
                      message: 'Mindestgehalt: 15.000 €',
                    },
                    max: {
                      value: 300000,
                      message: 'Maximalgehalt: 300.000 €',
                    },
                    validate: (val) =>
                      !isNaN(val) || 'Bitte geben Sie eine gültige Zahl ein',
                  })}
                />
                {step3Form.formState.errors.salaryExpectation && (
                  <p style={errorStyle}>
                    {step3Form.formState.errors.salaryExpectation.message}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  style={{ ...buttonSecondary, flex: '0 0 auto' }}
                >
                  ← Zurück
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ ...buttonPrimary(isLoading), flex: 1, marginTop: 0 }}
                >
                  {isLoading ? 'Wird gespeichert...' : 'Weiter →'}
                </button>
              </div>
            </form>
          )}

          {/* ── Schritt 4: Verfügbarkeit & Präferenzen ── */}
          {currentStep === 4 && (
            isCompleted ? (
              /* Bestätigungs-Screen */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: '#d1fae5',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 24,
                    color: '#065f46',
                  }}
                >
                  ✓
                </div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 8,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Profil gespeichert!
                </h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                  Ihr Profil ist gespeichert. Nach Verifikation Ihrer Dokumente wird es aktiviert.
                </p>
                <a
                  href="/dashboard"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: C.accent,
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: F,
                    textDecoration: 'none',
                    letterSpacing: '-0.01em',
                  }}
                >
                  Zum Dashboard →
                </a>
              </div>
            ) : (
              /* Schritt-4-Formular */
              <div>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: C.text,
                    marginBottom: 6,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Verfügbarkeit & Präferenzen
                </h1>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
                  Letzter Schritt — fast geschafft!
                </p>

                {/* Verfügbarkeitsstatus */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>Verfügbarkeitsstatus *</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(
                      [
                        { value: 'sofort', label: 'Sofort verfügbar', desc: 'Ich bin bereit für eine neue Position' },
                        { value: 'ab_datum', label: 'Ab einem bestimmten Datum', desc: 'Ich bin ab einem festgelegten Datum verfügbar' },
                        { value: 'nicht_verfuegbar', label: 'Derzeit nicht verfügbar', desc: 'Ich suche aktuell nicht aktiv' },
                      ] as const
                    ).map(({ value, label, desc }) => {
                      const isSelected = availabilityStatus === value
                      const isWarning = value === 'nicht_verfuegbar'
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setAvailabilityStatus(value)
                            setAvailabilityError(false)
                          }}
                          style={{
                            padding: '12px 14px',
                            background: isSelected
                              ? isWarning
                                ? '#fffbeb'
                                : C.cardSelectedBg
                              : '#f8fafc',
                            border: `2px solid ${
                              isSelected
                                ? isWarning
                                  ? '#d97706'
                                  : C.cardSelected
                                : C.border
                            }`,
                            borderRadius: 12,
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontFamily: F,
                            minHeight: 52,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected
                                ? isWarning
                                  ? '#92400e'
                                  : C.accent
                                : C.text,
                            }}
                          >
                            {label}
                          </div>
                          <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>{desc}</div>
                        </button>
                      )
                    })}
                  </div>
                  {availabilityStatus === 'ab_datum' && (
                    <div style={{ marginTop: 10 }}>
                      <label htmlFor="available-from" style={labelStyle}>
                        Ab wann?
                      </label>
                      <input
                        id="available-from"
                        type="date"
                        value={availableFrom}
                        min={(() => {
                          const d = new Date()
                          d.setDate(d.getDate() + 1)
                          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        })()}
                        max={(() => {
                          const d = new Date()
                          d.setFullYear(d.getFullYear() + 2)
                          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        })()}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  )}
                  {availabilityError && (
                    <p style={{ ...errorStyle, marginTop: 8 }}>
                      Bitte wählen Sie Ihren Verfügbarkeitsstatus
                    </p>
                  )}
                </div>

                {/* Soft Skills */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>
                    Soft Skills (optional, Mehrfachauswahl)
                  </p>
                  {softSkillsLoading ? (
                    <p style={{ fontSize: 14, color: C.faint, textAlign: 'center', padding: '12px 0' }}>
                      Skills werden geladen...
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        maxHeight: 240,
                        overflowY: 'auto',
                      }}
                    >
                      {softSkills.map((skill) => {
                        const isChecked = selectedSoftSkillIds.includes(skill.id)
                        return (
                          <label
                            key={skill.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              padding: '10px 14px',
                              background: isChecked ? C.cardSelectedBg : '#f8fafc',
                              border: `1.5px solid ${isChecked ? C.cardSelected : C.border}`,
                              borderRadius: 10,
                              cursor: 'pointer',
                              fontSize: 14,
                              fontFamily: F,
                              color: C.text,
                              fontWeight: isChecked ? 600 : 400,
                              minHeight: 44,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSoftSkill(skill.id)}
                              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent }}
                            />
                            {skill.name}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* E-Mail-Präferenzen */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ ...labelStyle, marginBottom: 10 }}>E-Mail-Benachrichtigungen</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={emailMatchAlerts}
                        onChange={(e) => setEmailMatchAlerts(e.target.checked)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent, marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F }}>
                          Match-Benachrichtigungen
                        </div>
                        <div style={{ fontSize: 12, color: C.faint, marginTop: 2, fontFamily: F }}>
                          Neue Matching-Treffer per E-Mail erhalten
                        </div>
                      </div>
                    </label>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: `1.5px solid ${C.border}`,
                        borderRadius: 10,
                        cursor: 'pointer',
                        minHeight: 44,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={emailInterestAlerts}
                        onChange={(e) => setEmailInterestAlerts(e.target.checked)}
                        style={{ width: 18, height: 18, cursor: 'pointer', accentColor: C.accent, marginTop: 2 }}
                      />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: F }}>
                          Unternehmens-Interesse
                        </div>
                        <div style={{ fontSize: 12, color: C.faint, marginTop: 2, fontFamily: F }}>
                          Benachrichtigung wenn ein Unternehmen Interesse zeigt
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3)
                      setIsCompleted(false)
                    }}
                    style={{ ...buttonSecondary, flex: '0 0 auto' }}
                  >
                    ← Zurück
                  </button>
                  <button
                    type="button"
                    onClick={handleStep4Submit}
                    disabled={isLoading}
                    style={{ ...buttonPrimary(isLoading), flex: 1, marginTop: 0 }}
                  >
                    {isLoading ? 'Wird gespeichert...' : 'Profil speichern'}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
