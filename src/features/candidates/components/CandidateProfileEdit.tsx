import { useEffect, useRef, useState } from 'react'
import { useProfileEdit, type AvailabilityStatus } from '../hooks/useProfileEdit'
import { useDocumentUpload } from '../hooks/useDocumentUpload'
import type { DocumentType, Skill, UploadedDocument } from '../types'

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

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  lebenslauf: 'Lebenslauf',
  zeugnis: 'Zeugnis',
  zertifikat: 'Zertifikat',
  sonstiges: 'Sonstiges',
}

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string }[] = [
  { value: 'sofort', label: 'Sofort verfügbar' },
  { value: 'ab_datum', label: 'Ab Datum' },
  { value: 'nicht_verfuegbar', label: 'Nicht verfügbar' },
]

// Inline style constants (same pattern as OnboardingWizard / DsgvoConsentPage)
const accent = '#3b72b8'
const accentHover = '#2d5a9e'
const text = '#0f1623'
const muted = '#4b5675'
const border = 'rgba(15,22,35,0.08)'
const red = '#dc2626'
const green = '#16a34a'
const greenBg = '#f0fdf4'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fa',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '32px 16px',
    fontFamily: F,
  } as React.CSSProperties,
  container: {
    width: '100%',
    maxWidth: 600,
  } as React.CSSProperties,
  logo: {
    textAlign: 'center' as const,
    marginBottom: 28,
  } as React.CSSProperties,
  logoLink: {
    fontFamily: F,
    fontSize: 28,
    fontWeight: 800,
    color: text,
    textDecoration: 'none',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,
  card: {
    background: '#fff',
    borderRadius: 20,
    padding: 36,
    boxShadow: '0 20px 60px rgba(59,114,184,0.12)',
    border: `1px solid ${border}`,
    marginBottom: 20,
  } as React.CSSProperties,
  sectionTitle: {
    fontFamily: F,
    fontSize: 18,
    fontWeight: 700,
    color: text,
    marginBottom: 20,
    marginTop: 0,
  } as React.CSSProperties,
  label: {
    display: 'block' as const,
    fontSize: 13,
    fontWeight: 600,
    color: muted,
    marginBottom: 6,
    fontFamily: F,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: F,
    border: `1.5px solid ${border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
    color: text,
    background: '#fff',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: F,
    border: `1.5px solid ${border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
    color: text,
    background: '#fff',
    resize: 'vertical' as const,
    minHeight: 80,
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: F,
    border: `1.5px solid ${border}`,
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box' as const,
    color: text,
    background: '#fff',
    cursor: 'pointer',
    appearance: 'none' as const,
  } as React.CSSProperties,
  fieldGroup: {
    marginBottom: 20,
  } as React.CSSProperties,
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 4,
  } as React.CSSProperties,
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  } as React.CSSProperties,
  availabilityGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 10,
    padding: '12px 16px',
    color: red,
    fontSize: 14,
    fontFamily: F,
    marginBottom: 16,
  } as React.CSSProperties,
  toast: (visible: boolean, isError?: boolean) => ({
    position: 'fixed' as const,
    bottom: 24,
    left: '50%',
    transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(80px)',
    background: isError ? red : '#1a1a1a',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: F,
    fontWeight: 600,
    opacity: visible ? 1 : 0,
    transition: 'all 0.3s ease',
    zIndex: 9999,
    whiteSpace: 'nowrap' as const,
  }),
}

function SkillChip({
  skill,
  selected,
  onToggle,
}: {
  skill: Skill
  selected: boolean
  onToggle: (id: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill.id)}
      style={{
        padding: '6px 14px',
        borderRadius: 20,
        border: `1.5px solid ${selected ? accent : border}`,
        background: selected ? '#eff5fd' : '#fff',
        color: selected ? accent : muted,
        fontSize: 13,
        fontFamily: F,
        fontWeight: selected ? 600 : 400,
        cursor: 'pointer',
      }}
    >
      {skill.name}
    </button>
  )
}

function AvailabilityButton({
  option,
  selected,
  onClick,
}: {
  option: { value: AvailabilityStatus; label: string }
  selected: boolean
  onClick: () => void
}) {
  const bgColor = option.value === 'nicht_verfuegbar' && selected ? '#fef2f2' : selected ? '#eff5fd' : '#fff'
  const borderColor =
    option.value === 'nicht_verfuegbar' && selected
      ? red
      : selected
        ? accent
        : border
  const color =
    option.value === 'nicht_verfuegbar' && selected ? red : selected ? accent : muted

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 10,
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        color,
        fontSize: 14,
        fontFamily: F,
        fontWeight: selected ? 700 : 400,
        cursor: 'pointer',
      }}
    >
      {option.label}
    </button>
  )
}

export function CandidateProfileEdit() {
  const { profile, isLoading, isSaving, error: hookError, loadProfile, loadSkillsForField, saveProfile, setAvailability } =
    useProfileEdit()
  const { isLoading: docLoading, error: docError, loadDocuments, replaceDocument } = useDocumentUpload()

  // Local form state (mirrors profile fields)
  const [jobField, setJobField] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [desiredLocationState, setDesiredLocationState] = useState('')
  const [radiusKm, setRadiusKm] = useState<number>(50)
  const [salaryExpectation, setSalaryExpectation] = useState<string>('')
  const [softSkills, setSoftSkills] = useState('')
  const [availabilityStatus, setAvailabilityStatusState] = useState<AvailabilityStatus | null>(null)
  const [availableFrom, setAvailableFrom] = useState('')
  const [documents, setDocuments] = useState<UploadedDocument[]>([])

  // Toast state
  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // F08: ref to always reflect current availabilityStatus (avoids stale closure in date handler)
  const availabilityStatusRef = useRef<AvailabilityStatus | null>(null)
  useEffect(() => { availabilityStatusRef.current = availabilityStatus }, [availabilityStatus])

  const showToast = (message: string, isError = false) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, isError })
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // F02: clear toast timer on unmount to prevent state update on unmounted component
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Load profile + documents on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // loadProfile / loadDocuments are defined inside their hooks and referentially unstable;
  // omitting them from deps is intentional to avoid infinite re-fetch on every render
  useEffect(() => {
    loadProfile()
    // F14: catch handler so errors are reflected via docError state, not silently dropped
    loadDocuments()
      .then(setDocuments)
      .catch(() => { /* error already exposed via docError state */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync form state when profile loads
  useEffect(() => {
    if (!profile) return
    setJobField(profile.jobField)
    setSelectedSkillIds(profile.skillIds)
    setDesiredLocationState(profile.desiredLocationState)
    setRadiusKm(profile.radiusKm ?? 50)
    setSalaryExpectation(profile.salaryExpectation !== null ? String(profile.salaryExpectation) : '')
    setSoftSkills(profile.softSkills)
    setAvailabilityStatusState(profile.availabilityStatus)
    setAvailableFrom(profile.availableFrom ?? '')
  }, [profile])

  // Reload skills when jobField changes
  // F18: Don't reset selectedSkillIds immediately — reset happens after new skills load
  //      (filters to keep any IDs that exist in the new field's skill list)
  useEffect(() => {
    if (!jobField) { setSkills([]); setSelectedSkillIds([]); return }
    setSkillsLoading(true)
    loadSkillsForField(jobField).then((data) => {
      setSkills(data)
      setSkillsLoading(false)
      // Keep only skill IDs that exist in the newly loaded skill list
      setSelectedSkillIds((prev) => prev.filter((id) => data.some((s) => s.id === id)))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobField])

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  // F15: saveProfile now returns string | null (error message or null on success)
  //      avoids reading stale hookError React state in the callback
  const handleSaveProfile = async () => {
    const errorMsg = await saveProfile({
      jobField,
      skillIds: selectedSkillIds,
      desiredLocationState,
      radiusKm,
      salaryExpectation: salaryExpectation ? Number(salaryExpectation) : null,
      softSkills,
    })
    if (!errorMsg) {
      showToast('Profil gespeichert')
    } else {
      showToast(errorMsg, true)
    }
  }

  // F06: capture previous value before optimistic update (avoids stale profile reference on revert)
  const handleAvailabilityChange = async (status: AvailabilityStatus) => {
    const prevStatus = availabilityStatus
    setAvailabilityStatusState(status)
    const ok = await setAvailability(status, status === 'ab_datum' ? availableFrom : undefined)
    if (ok) {
      showToast('Verfügbarkeit aktualisiert')
    } else {
      setAvailabilityStatusState(prevStatus)
      showToast('Verfügbarkeit konnte nicht gespeichert werden', true)
    }
  }

  // F01: error toast + revert on failure
  // F08: read availabilityStatus from ref (avoids stale closure if status changed concurrently)
  // F16: past date validation
  const handleAvailableDateChange = async (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      showToast('Datum darf nicht in der Vergangenheit liegen', true)
      return
    }
    const prevDate = availableFrom
    setAvailableFrom(date)
    if (availabilityStatusRef.current === 'ab_datum' && date) {
      const ok = await setAvailability('ab_datum', date)
      if (ok) {
        showToast('Verfügbarkeit aktualisiert')
      } else {
        setAvailableFrom(prevDate)
        showToast('Verfügbarkeit konnte nicht gespeichert werden', true)
      }
    }
  }

  // File input refs for document replacement
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const handleReplaceDocument = async (doc: UploadedDocument) => {
    fileInputRefs.current[doc.id]?.click()
  }

  const handleFileSelected = async (doc: UploadedDocument, file: File) => {
    const ok = await replaceDocument(doc.id, doc.storagePath, file, doc.documentType)
    if (ok) {
      showToast('Dokument ersetzt — Profil wartet auf erneute Verifizierung')
      // Reload page to reflect new profile_status and document list
      setTimeout(() => { window.location.reload() }, 1500)
    } else {
      showToast(docError ?? 'Dokument konnte nicht ersetzt werden', true)
    }
  }

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={{ ...styles.container, textAlign: 'center', paddingTop: 80 }}>
          <p style={{ fontFamily: F, color: muted }}>Profil wird geladen…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <a href="/" style={styles.logoLink}>
            phe<em style={{ fontStyle: 'italic', color: accent }}>web</em>
          </a>
          <p style={{ marginTop: 6, fontSize: 14, color: muted, fontFamily: F }}>Profil bearbeiten</p>
        </div>

        {/* Section 1: Profildaten */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Profildaten</h2>

          {hookError && (
            <div style={styles.errorBox}>{hookError}</div>
          )}

          {/* Berufsfeld */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Berufsfeld</label>
            <select
              value={jobField}
              onChange={(e) => setJobField(e.target.value)}
              style={styles.select}
            >
              <option value="">Bitte wählen…</option>
              {BERUFSFELDER.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Skills */}
          {jobField && (
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Skills</label>
              {skillsLoading ? (
                <p style={{ fontSize: 13, color: muted, fontFamily: F }}>Skills werden geladen…</p>
              ) : skills.length === 0 ? (
                <p style={{ fontSize: 13, color: muted, fontFamily: F }}>Keine Skills für dieses Berufsfeld gefunden.</p>
              ) : (
                <div style={styles.skillsGrid}>
                  {skills.map((skill) => (
                    <SkillChip
                      key={skill.id}
                      skill={skill}
                      selected={selectedSkillIds.includes(skill.id)}
                      onToggle={toggleSkill}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Standort + Radius */}
          <div style={styles.row}>
            <div>
              <label style={styles.label}>Bundesland</label>
              <select
                value={desiredLocationState}
                onChange={(e) => setDesiredLocationState(e.target.value)}
                style={styles.select}
              >
                <option value="">Bitte wählen…</option>
                {BUNDESLAENDER.map((bl) => (
                  <option key={bl} value={bl}>{bl}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Radius</label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                style={styles.select}
              >
                {RADIUS_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r} km</option>
                ))}
                <option value={0}>Bundesweit</option>
              </select>
            </div>
          </div>

          {/* Gehaltsvorstellung */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Gehaltsvorstellung (€/Jahr)</label>
            <input
              type="number"
              value={salaryExpectation}
              onChange={(e) => setSalaryExpectation(e.target.value)}
              placeholder="z.B. 55000"
              min={0}
              step={1000}
              style={styles.input}
            />
          </div>

          {/* Soft Skills */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Soft Skills (kommagetrennt)</label>
            <textarea
              value={softSkills}
              onChange={(e) => setSoftSkills(e.target.value)}
              placeholder="z.B. Teamfähigkeit, Kommunikationsstärke, Zuverlässigkeit"
              style={styles.textarea}
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '12px 20px',
              background: isSaving ? '#93b3d8' : accent,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: F,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {isSaving ? 'Wird gespeichert…' : 'Profil speichern'}
          </button>
        </div>

        {/* Section 2: Verfügbarkeit */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Verfügbarkeit</h2>
          <p style={{ fontSize: 14, color: muted, fontFamily: F, marginBottom: 16, marginTop: 0 }}>
            Änderungen werden sofort gespeichert.
            {availabilityStatus === 'nicht_verfuegbar' && (
              <span style={{ color: red, fontWeight: 600 }}>
                {' '}Ihr Profil ist aktuell für neue Matches pausiert.
              </span>
            )}
            {availabilityStatus === 'sofort' && (
              <span style={{ color: green, fontWeight: 600 }}>
                {' '}Sie sind sofort verfügbar.
              </span>
            )}
          </p>

          <div style={styles.availabilityGroup}>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <AvailabilityButton
                key={opt.value}
                option={opt}
                selected={availabilityStatus === opt.value}
                onClick={() => handleAvailabilityChange(opt.value)}
              />
            ))}
          </div>

          {availabilityStatus === 'ab_datum' && (
            <div style={{ marginTop: 16 }}>
              <label style={styles.label}>Verfügbar ab</label>
              <input
                type="date"
                value={availableFrom}
                onChange={(e) => handleAvailableDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ ...styles.input, maxWidth: 200 }}
              />
            </div>
          )}
        </div>

        {/* Section 3: Dokumente */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Dokumente</h2>

          {docError && <div style={styles.errorBox}>{docError}</div>}

          {documents.length === 0 ? (
            <p style={{ fontSize: 14, color: muted, fontFamily: F }}>
              Keine Dokumente hochgeladen.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    background: '#fafafa',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: text, fontFamily: F }}>
                      {DOCUMENT_TYPE_LABELS[doc.documentType]}
                    </div>
                    <div style={{ fontSize: 12, color: muted, fontFamily: F, marginTop: 2 }}>
                      {doc.originalFilename ?? 'Unbekannte Datei'}
                      {' · '}
                      {doc.verified ? (
                        <span style={{ color: green, fontWeight: 600 }}>Verifiziert</span>
                      ) : (
                        <span style={{ color: '#d97706' }}>Ausstehend</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Hidden file input per document */}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      ref={(el) => { fileInputRefs.current[doc.id] = el }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelected(doc, file)
                        // Reset input so same file can be re-selected
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      disabled={docLoading}
                      onClick={() => handleReplaceDocument(doc)}
                      style={{
                        padding: '6px 14px',
                        background: docLoading ? '#e5e7eb' : accent,
                        color: docLoading ? muted : '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 13,
                        fontFamily: F,
                        fontWeight: 600,
                        cursor: docLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {docLoading ? '…' : 'Ersetzen'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p style={{ fontSize: 12, color: muted, fontFamily: F, marginTop: 16, marginBottom: 0 }}>
            Nach dem Ersetzen eines Dokuments wird Ihr Profil zur erneuten Verifizierung eingereicht.
          </p>
        </div>
      </div>

      {/* Toast notification */}
      <div style={styles.toast(!!toast, toast?.isError)}>
        {toast?.message}
      </div>
    </div>
  )
}
