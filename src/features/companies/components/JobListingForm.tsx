import { useState, useEffect, useRef } from 'react'
import {
  useSkillsTaxonomy,
  SkillsSelector,
  HARD_SKILL_CATEGORIES,
  SOFT_SKILL_CATEGORY,
} from '../../jobs'
import { useJobListings } from '../hooks/useJobListings'
import type { JobListingFormData, TierLimitResult } from '../hooks/useJobListings'
import { useJobListingsManagement } from '../hooks/useJobListingsManagement'

// [Story 4.3] Stellenausschreibung anlegen — AGG-konform (FR18)
// Ausschließlich skill-basierte Kriterien. Kein Alter, Geschlecht, Nationalität, Herkunft, Religion.

const C = {
  accent: '#3b72b8', accentDk: '#2a5490', accentBg: '#eef4ff', accentBd: 'rgba(59,114,184,0.18)',
  text: '#0f1623', muted: '#4b5675', faint: '#8b9ab1',
  border: 'rgba(15,22,35,0.08)', borderMd: 'rgba(15,22,35,0.13)',
  green: '#16a34a', greenBg: '#f0fdf4', red: '#dc2626', redBg: '#fef2f2',
  amber: '#d97706', amberBg: '#fffbeb',
  shadow: '0 2px 12px rgba(59,114,184,0.06)',
  shadowMd: '0 8px 32px rgba(59,114,184,0.10)',
}
const F = "'Helvetica Neue', Helvetica, Arial, sans-serif"

const BUNDESLAENDER = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen',
  'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen',
  'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen',
  'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen',
] as const

const VERFUEGBARKEIT_OPTIONS = [
  { value: 'sofort', label: 'Sofort' },
  { value: 'innerhalb_1_monat', label: 'Innerhalb 1 Monat' },
  { value: 'innerhalb_3_monate', label: 'Innerhalb 3 Monate' },
  { value: 'flexibel', label: 'Flexibel' },
] as const

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

const INITIAL_FORM: JobListingFormData = {
  title: '',
  hardSkillIds: [],
  softSkillIds: [],
  desiredLocationState: '',
  radiusKm: null,
  desiredAvailability: '',
  salaryMin: null,
  salaryMax: null,
}

interface JobListingFormProps {
  listingId?: string       // wenn gesetzt: Edit-Modus
  onSaveSuccess?: () => void
}

export function JobListingForm({ listingId, onSaveSuccess }: JobListingFormProps = {}) {
  const isEditMode = !!listingId
  const { isSaving, createJobListing, checkTierLimit } = useJobListings()
  const { loadListingForEdit, updateListing } = useJobListingsManagement()
  const { skills, isLoading: skillsLoading, loadSkills } = useSkillsTaxonomy()

  // Patch 2: loadSkills must be called explicitly — useSkillsTaxonomy starts with empty array
  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const [formData, setFormData] = useState<JobListingFormData>(INITIAL_FORM)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [tierLimit, setTierLimit] = useState<TierLimitResult | null>(null)
  // tierLoading doubles as listing-load spinner in edit mode
  const [tierLoading, setTierLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadedSkillIds, setLoadedSkillIds] = useState<string[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  // [P4] Warning when loaded skill IDs don't appear in the taxonomy (archived/deleted skills)
  const [skillSplitWarning, setSkillSplitWarning] = useState<string | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  // Check tier limit on mount — create mode only (FR19)
  // Patch 3: add .catch() so a network/auth error doesn't permanently disable the form
  useEffect(() => {
    if (isEditMode) return
    setTierLoading(true)
    checkTierLimit()
      .then((result) => {
        if (mountedRef.current) {
          setTierLimit(result)
          setTierLoading(false)
        }
      })
      .catch(() => {
        if (mountedRef.current) setTierLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Edit mode: load existing listing data on mount
  useEffect(() => {
    if (!listingId) return
    setTierLoading(true)
    loadListingForEdit(listingId)
      .then((result) => {
        if (!mountedRef.current) return
        if (typeof result === 'string') {
          setLoadError(result)
          setTierLoading(false)
          return
        }
        const { listing, skillIds } = result
        // [P1] Guard: geschlossen is terminal — editing is not permitted
        if (listing.status === 'geschlossen') {
          setLoadError('Diese Stelle ist geschlossen und kann nicht mehr bearbeitet werden.')
          setTierLoading(false)
          return
        }
        setFormData({
          title: listing.title,
          hardSkillIds: [],   // split after taxonomy loads (see useEffect below)
          softSkillIds: [],
          desiredLocationState: listing.desired_location_state ?? '',
          radiusKm: listing.radius_km,
          desiredAvailability: listing.desired_availability ?? '',
          salaryMin: listing.salary_min,
          salaryMax: listing.salary_max,
        })
        setLoadedSkillIds(skillIds)
        setTierLoading(false)
      })
      .catch(() => {
        if (mountedRef.current) {
          setLoadError('Stelle konnte nicht geladen werden.')
          setTierLoading(false)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  // Split loaded skill IDs into hard/soft once taxonomy is available
  useEffect(() => {
    if (!isEditMode || skillsLoading || loadedSkillIds.length === 0) return
    const hardIds = loadedSkillIds.filter((id) => hardSkills.some((s) => s.id === id))
    const softIds = loadedSkillIds.filter((id) => softSkills.some((s) => s.id === id))
    // [P4] Warn if any saved skill IDs are not found in the taxonomy (archived/deleted skills)
    const classifiedCount = hardIds.length + softIds.length
    if (classifiedCount < loadedSkillIds.length) {
      const dropped = loadedSkillIds.length - classifiedCount
      setSkillSplitWarning(
        `${dropped} gespeicherte${dropped === 1 ? 'r' : ''} Skill${dropped === 1 ? '' : 's'} konnte${dropped === 1 ? '' : 'n'} nicht klassifiziert werden (nicht mehr in der Taxonomie vorhanden) und wurde${dropped === 1 ? '' : 'n'} entfernt.`
      )
    }
    setFormData((p) => ({ ...p, hardSkillIds: hardIds, softSkillIds: softIds }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skillsLoading, loadedSkillIds, isEditMode])

  // Split skills into hard and soft for separate SkillsSelector instances
  const hardSkills = skills.filter((s) => HARD_SKILL_CATEGORIES.includes(s.category as typeof HARD_SKILL_CATEGORIES[number]))
  const softSkills = skills.filter((s) => s.category === SOFT_SKILL_CATEGORY)

  const tierLimitReached = !isEditMode && tierLimit !== null && !tierLimit.allowed
  const isDisabled = tierLimitReached || isSaving || isUpdating || skillsLoading || tierLoading

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast(msg)
    setToastType(type)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      if (mountedRef.current) setToast(null)
    }, 4000)
  }

  const handleSave = async () => {
    setValidationError(null)

    // Client-side validation (shared between create and edit)
    if (!formData.title.trim()) {
      setValidationError('Stellenbezeichnung ist erforderlich.')
      return
    }
    if (formData.title.trim().length > 150) {
      setValidationError('Stellenbezeichnung darf maximal 150 Zeichen haben.')
      return
    }
    if (formData.hardSkillIds.length === 0) {
      setValidationError('Bitte wählen Sie mindestens eine fachliche Qualifikation (Hard Skill) aus.')
      return
    }
    if (
      formData.salaryMin !== null &&
      formData.salaryMax !== null &&
      formData.salaryMin > formData.salaryMax
    ) {
      setValidationError('Mindestgehalt darf nicht größer als Maximalgehalt sein.')
      return
    }

    if (isEditMode) {
      setIsUpdating(true)
      const errorMsg = await updateListing(listingId!, {
        ...formData,
        title: formData.title.trim(),
      })
      if (mountedRef.current) setIsUpdating(false)
      if (errorMsg) {
        showToast(errorMsg, 'error')
      } else {
        showToast('Änderungen gespeichert!')
        onSaveSuccess?.()
      }
    } else {
      const errorMsg = await createJobListing({
        ...formData,
        title: formData.title.trim(),
      })

      if (errorMsg) {
        showToast(errorMsg, 'error')
      } else {
        showToast('Stelle erfolgreich angelegt!')
        setFormData(INITIAL_FORM)
        // Re-check tier limit after creating (may now be at limit)
        // Patch 3: catch error on post-save refresh — form stays active on failure
        checkTierLimit()
          .then((result) => {
            if (mountedRef.current) setTierLimit(result)
          })
          .catch(() => {/* silent — form remains active if refresh fails */})
      }
    }
  }

  if (loadError) {
    return (
      <div style={{
        background: C.redBg, border: `1.5px solid #fecaca`,
        borderRadius: 12, padding: '16px 20px',
        fontFamily: F, fontSize: 14, color: C.red,
      }}>
        {loadError}
      </div>
    )
  }

  if (tierLoading || skillsLoading) {
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

      {/* Tier-Limit Banner — create mode only (FR19) */}
      {!isEditMode && tierLimitReached && tierLimit && (
        <div style={{
          background: C.amberBg,
          border: `1.5px solid #fde68a`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          fontFamily: F, fontSize: 14, color: C.amber, lineHeight: 1.5,
        }}>
          <strong>Paket-Limit erreicht:</strong> Ihr aktuelles Paket erlaubt maximal {tierLimit.max} aktive Stelle{tierLimit.max === 1 ? '' : 'n'} ({tierLimit.current}/{tierLimit.max} belegt).
          Bitte schließen Sie eine Stelle oder upgraden Sie Ihr Paket.
        </div>
      )}

      {/* Card */}
      <div style={{
        background: '#fff', borderRadius: 20,
        border: `1.5px solid ${C.border}`, boxShadow: C.shadow, padding: '28px 32px',
        opacity: tierLimitReached ? 0.7 : 1,
      }}>
        <h2 style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>
          {isEditMode ? 'Stelle bearbeiten' : 'Neue Stellenausschreibung'}
        </h2>
        <p style={{ fontFamily: F, fontSize: 14, color: C.muted, marginBottom: 28 }}>
          Definieren Sie die Anforderungen Ihrer Stelle. Alle Kriterien sind skill-basiert.
        </p>

        {/* [P4] Warn when saved skills were not found in taxonomy */}
        {skillSplitWarning && (
          <div style={{
            background: C.amberBg, border: `1.5px solid #fde68a`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            fontFamily: F, fontSize: 14, color: C.amber,
          }}>
            {skillSplitWarning}
          </div>
        )}

        {validationError && (
          <div style={{
            background: C.redBg, border: `1.5px solid #fecaca`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 20,
            fontFamily: F, fontSize: 14, color: C.red,
          }}>
            {validationError}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stellenbezeichnung */}
          <div>
            <label style={labelStyle}>Stellenbezeichnung *</label>
            <input
              style={{ ...inputStyle, background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="z.B. Elektriker (m/w/d), Anlagenmechaniker SHK"
              maxLength={150}
              disabled={isDisabled}
            />
            <p style={{ fontFamily: F, fontSize: 12, color: C.faint, marginTop: 4 }}>
              {formData.title.length} / 150
            </p>
          </div>

          {/* Hard Skills */}
          <div>
            <label style={labelStyle}>Fachliche Qualifikationen (Hard Skills) *</label>
            <p style={{ fontFamily: F, fontSize: 13, color: C.muted, marginBottom: 10 }}>
              Mindestens eine Qualifikation ist erforderlich.
            </p>
            <SkillsSelector
              skills={hardSkills}
              selectedIds={formData.hardSkillIds}
              onChange={(ids) => setFormData((p) => ({ ...p, hardSkillIds: ids }))}
              disabled={isDisabled}
            />
          </div>

          {/* Soft Skills */}
          <div>
            <label style={labelStyle}>IT- und Soft Skills (optional)</label>
            <p style={{ fontFamily: F, fontSize: 13, color: C.muted, marginBottom: 10 }}>
              Ergänzende Qualifikationen für die Stelle.
            </p>
            <SkillsSelector
              skills={softSkills}
              selectedIds={formData.softSkillIds}
              onChange={(ids) => setFormData((p) => ({ ...p, softSkillIds: ids }))}
              disabled={isDisabled}
            />
          </div>

          {/* Region + Umkreis */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
            <div>
              <label style={labelStyle}>Bundesland</label>
              <select
                style={{ ...inputStyle, cursor: isDisabled ? 'not-allowed' : 'pointer', background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
                value={formData.desiredLocationState}
                onChange={(e) => setFormData((p) => ({ ...p, desiredLocationState: e.target.value }))}
                disabled={isDisabled}
              >
                <option value="">Alle Bundesländer</option>
                {BUNDESLAENDER.map((bl) => (
                  <option key={bl} value={bl}>{bl}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Suchradius (km)</label>
              <input
                style={{ ...inputStyle, background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
                type="number"
                min={0}
                max={500}
                value={formData.radiusKm ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                  setFormData((p) => ({ ...p, radiusKm: val }))
                }}
                placeholder="z.B. 50"
                disabled={isDisabled}
              />
            </div>
          </div>

          {/* Verfügbarkeit */}
          <div>
            <label style={labelStyle}>Gewünschte Verfügbarkeit</label>
            <select
              style={{ ...inputStyle, cursor: isDisabled ? 'not-allowed' : 'pointer', background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
              value={formData.desiredAvailability}
              onChange={(e) => setFormData((p) => ({ ...p, desiredAvailability: e.target.value }))}
              disabled={isDisabled}
            >
              <option value="">Keine Angabe</option>
              {VERFUEGBARKEIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Gehaltsspanne */}
          <div>
            <label style={labelStyle}>Gehaltsspanne (EUR / Jahr, optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <input
                  style={{ ...inputStyle, background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
                  type="number"
                  min={0}
                  value={formData.salaryMin ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                    setFormData((p) => ({ ...p, salaryMin: val }))
                  }}
                  placeholder="Minimum (z.B. 40000)"
                  disabled={isDisabled}
                />
              </div>
              <div>
                <input
                  style={{ ...inputStyle, background: isDisabled ? '#f0f0f0' : '#f5f7fa' }}
                  type="number"
                  min={0}
                  value={formData.salaryMax ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value, 10)
                    setFormData((p) => ({ ...p, salaryMax: val }))
                  }}
                  placeholder="Maximum (z.B. 55000)"
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={isDisabled}
            style={{
              background: isDisabled ? C.accentBg : C.accent,
              color: isDisabled ? C.accent : '#fff',
              border: 'none', borderRadius: 12,
              padding: '12px 28px', fontSize: 14, fontWeight: 700,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              fontFamily: F, transition: 'all 0.2s',
              boxShadow: isDisabled ? 'none' : '0 4px 16px rgba(59,114,184,0.22)',
            }}
          >
            {(isSaving || isUpdating) ? 'Wird gespeichert...' : isEditMode ? 'Änderungen speichern' : 'Stelle anlegen'}
          </button>
        </div>
      </div>
    </div>
  )
}
